// Booking API route implementation
// Handles booking creation, retrieval, and management with security measures

import { NextRequest, NextResponse } from 'next/server';
import { getBookingProvider } from '@/lib/booking-providers';
import {
  BookingValidator,
  BookingError,
  BookingErrorCodes,
  handleBookingError,
  BookingRateLimiter,
  bookingRequestSchema
} from '@/lib/booking-validation';
import { bookingMonitor, measurePerformance, BookingAlerts } from '@/lib/booking-monitoring';
import { SessionManager, sessionCSRF } from '@/lib/session-management';
import { SECURITY_HEADERS, securityValidators } from '@/lib/security-middleware';
import { GDPRCompliance, cookieConsent } from '@/lib/gdpr-compliance';
import { checkPaymentRateLimit, sanitizePaymentLog } from '@/lib/payment-security';

// Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Security validations
    const originValidation = securityValidators.validateOrigin(request);
    if (!originValidation) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const headerValidation = securityValidators.validateHeaders(request);
    if (!headerValidation.valid) {
      return NextResponse.json(
        { error: headerValidation.error },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // CSRF protection
    const session = await SessionManager.getSessionFromRequest(request);
    const csrfToken = request.headers.get('x-csrf-token');

    if (!session || !sessionCSRF.validateToken(session, csrfToken || '')) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Get client IP for rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Enhanced rate limiting for booking endpoints
    const rateLimitCheck = checkPaymentRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many booking attempts. Please try again later.',
          resetTime: rateLimitCheck.resetTime
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Check for suspicious activity
    const suspiciousActivity = securityValidators.detectSuspiciousActivity(request);
    if (suspiciousActivity.suspicious) {
      console.warn('Suspicious booking attempt detected:', {
        ip: clientIP,
        reasons: suspiciousActivity.reasons,
        userAgent: request.headers.get('user-agent'),
      });

      // Log but don't block (could be false positive)
    }

    // Parse request body
    const bookingData = await request.json();

    // GDPR consent validation for booking data
    const consentStatus = cookieConsent.getConsentStatus(request);
    if (!GDPRCompliance.isProcessingAllowed(consentStatus.consentTypes, 'booking_data', 'contract')) {
      return NextResponse.json(
        { error: 'Consent required for booking data processing' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Validate booking data with enhanced security
    const validation = BookingValidator.validateCompleteBooking(bookingData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Sanitize booking data for logging
    const sanitizedBookingData = sanitizePaymentLog(bookingData);

    // Get booking provider
    const provider = getBookingProvider();

    // Check availability before creating booking
    const availability = await provider.checkAvailability(
      bookingData.tourId,
      new Date(bookingData.date)
    );

    if (!availability.available) {
      return NextResponse.json(
        { error: 'Tour not available for selected date' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Verify the requested time slot is available
    const requestedTime = bookingData.startTime;
    const availableSlot = availability.availableSlots.find(
      slot => slot.startTime.includes(requestedTime)
    );

    if (!availableSlot) {
      return NextResponse.json(
        { error: 'Requested time slot not available' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    if (availableSlot.availableSpots < bookingData.groupSize) {
      return NextResponse.json(
        {
          error: `Only ${availableSlot.availableSpots} spots available for this time slot`,
          availableSpots: availableSlot.availableSpots
        },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Create booking with provider (with performance monitoring)
    const bookingResult = await measurePerformance(
      () => provider.createBooking(bookingData),
      'booking_created',
      {
        tourId: bookingData.tourId,
        date: bookingData.date,
        groupSize: bookingData.groupSize,
      }
    );

    if (!bookingResult.success) {
      BookingAlerts.trackFailure();
      bookingMonitor.trackBookingFailure(
        {
          tourId: bookingData.tourId,
          error: bookingResult.error || 'Booking creation failed',
          errorCode: BookingErrorCodes.PROVIDER_ERROR,
        },
        0
      );
      
      throw new BookingError(
        bookingResult.error || 'Booking creation failed',
        BookingErrorCodes.PROVIDER_ERROR,
        500
      );
    }

    // Track successful booking
    BookingAlerts.trackSuccess();
    bookingMonitor.trackBookingSuccess(
      {
        bookingId: bookingResult.bookingId || 'unknown',
        tourId: bookingData.tourId,
        totalPrice: bookingData.totalPrice,
      },
      0
    );

    // Log successful booking
    console.log('Booking created successfully:', {
      bookingId: bookingResult.bookingId,
      tourId: bookingData.tourId,
      date: bookingData.date,
      groupSize: bookingData.groupSize,
      customerEmail: bookingData.customerInfo.email,
    });

    // Create secure response with updated session
    const response = NextResponse.json({
      success: true,
      booking: bookingResult.booking,
      confirmationCode: bookingResult.confirmationCode,
    });

    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Update session with booking information
    const updatedSessionToken = await SessionManager.updateSessionActivity(
      request.cookies.get('session-token')?.value || '',
      { bookingData: { bookingId: bookingResult.bookingId } }
    );

    if (updatedSessionToken) {
      SessionManager.setSessionCookie(response, updatedSessionToken);
    }

    return response;

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    // Track booking failure
    BookingAlerts.trackFailure();
    BookingAlerts.checkAlerts();
    
    console.error('Booking creation failed:', {
      error: bookingError.message,
      code: bookingError.code,
      stack: bookingError.stack,
    });

    return NextResponse.json(
      {
        error: bookingError.message,
        code: bookingError.code
      },
      {
        status: bookingError.statusCode,
        headers: SECURITY_HEADERS,
      }
    );
  }
}

// Get booking details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const confirmationCode = searchParams.get('confirmation');

    if (!bookingId && !confirmationCode) {
      return NextResponse.json(
        { error: 'Booking ID or confirmation code required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const provider = getBookingProvider();

    // If we have a booking ID, use it directly
    if (bookingId) {
      const bookingResult = await provider.getBooking(bookingId);
      
      if (!bookingResult.success) {
        return NextResponse.json(
          { error: bookingResult.error || 'Booking not found' },
          { status: 404, headers: SECURITY_HEADERS }
        );
      }

      const response = NextResponse.json({
        success: true,
        booking: bookingResult.booking,
      });

      // Set security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // If we only have confirmation code, we'd need to implement a lookup
    // For now, return an error as this requires additional database setup
    return NextResponse.json(
      { error: 'Booking lookup by confirmation code not yet implemented' },
      { status: 501, headers: SECURITY_HEADERS }
    );

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    console.error('Booking retrieval failed:', {
      error: bookingError.message,
      code: bookingError.code,
    });

    return NextResponse.json(
      {
        error: bookingError.message,
        code: bookingError.code
      },
      {
        status: bookingError.statusCode,
        headers: SECURITY_HEADERS,
      }
    );
  }
}
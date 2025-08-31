// Booking cancellation API route
// Handles booking cancellations and refund processing

import { NextRequest, NextResponse } from 'next/server';
import { getBookingProvider } from '@/lib/booking-providers';
import { 
  BookingError, 
  BookingErrorCodes, 
  handleBookingError,
  BookingRateLimiter 
} from '@/lib/booking-validation';
import { bookingMonitor } from '@/lib/booking-monitoring';
import { z } from 'zod';

const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().max(500, 'Cancellation reason too long').optional(),
  customerEmail: z.string().email('Valid email required for verification'),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting (more restrictive for cancellations)
    const rateLimitCheck = BookingRateLimiter.checkRateLimit(`cancel_${clientIP}`);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many cancellation attempts. Please try again later.',
          resetTime: rateLimitCheck.resetTime 
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const requestData = await request.json();
    
    try {
      cancelBookingSchema.parse(requestData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validationError.errors.map(e => e.message)
          },
          { status: 400 }
        );
      }
    }

    const { bookingId, reason, customerEmail } = requestData;
    const provider = getBookingProvider();

    // First, get the booking to verify ownership and cancellation eligibility
    const bookingResult = await provider.getBooking(bookingId);
    
    if (!bookingResult.success || !bookingResult.booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookingResult.booking;

    // Verify customer email matches
    if (booking.customerInfo.email.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking records' },
        { status: 403 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 409 }
      );
    }

    // Check cancellation policy (24 hours before tour)
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const hoursUntilTour = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilTour < 24) {
      return NextResponse.json(
        { 
          error: 'Cancellations must be made at least 24 hours before the tour',
          hoursUntilTour: Math.round(hoursUntilTour * 10) / 10
        },
        { status: 409 }
      );
    }

    // Calculate refund amount based on cancellation policy
    let refundPercent = 100;
    if (hoursUntilTour < 48) {
      refundPercent = 50; // 50% refund if cancelled within 48 hours
    }

    const refundAmount = (booking.totalPrice * refundPercent) / 100;

    // Cancel the booking with the provider
    const cancellationResult = await provider.cancelBooking(bookingId);

    if (!cancellationResult.success) {
      throw new BookingError(
        cancellationResult.error || 'Cancellation failed',
        BookingErrorCodes.PROVIDER_ERROR,
        500
      );
    }

    // Track cancellation
    bookingMonitor.trackCancellation({
      bookingId,
      refundAmount,
      reason,
    });

    // Log cancellation (in production, this would trigger refund processing)
    console.log('Booking cancelled successfully:', {
      bookingId,
      customerEmail,
      reason,
      refundAmount,
      refundPercent,
      hoursUntilTour,
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      refund: {
        amount: refundAmount,
        percent: refundPercent,
        currency: 'EUR',
        processingTime: '3-5 business days',
      },
      cancellation: {
        cancelledAt: new Date().toISOString(),
        reason,
      },
    });

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    console.error('Booking cancellation failed:', {
      error: bookingError.message,
      code: bookingError.code,
      stack: bookingError.stack,
    });

    return NextResponse.json(
      { 
        error: bookingError.message,
        code: bookingError.code 
      },
      { status: bookingError.statusCode }
    );
  }
}

// Get cancellation policy information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      // Return general cancellation policy
      return NextResponse.json({
        policy: {
          fullRefund: {
            timeframe: '48+ hours before tour',
            refundPercent: 100,
          },
          partialRefund: {
            timeframe: '24-48 hours before tour',
            refundPercent: 50,
          },
          noRefund: {
            timeframe: 'Less than 24 hours before tour',
            refundPercent: 0,
          },
        },
        processingTime: '3-5 business days',
        currency: 'EUR',
      });
    }

    // Get specific booking cancellation info
    const provider = getBookingProvider();
    const bookingResult = await provider.getBooking(bookingId);
    
    if (!bookingResult.success || !bookingResult.booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = bookingResult.booking;
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const hoursUntilTour = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    let canCancel = false;

    if (hoursUntilTour >= 48) {
      refundPercent = 100;
      canCancel = true;
    } else if (hoursUntilTour >= 24) {
      refundPercent = 50;
      canCancel = true;
    }

    const refundAmount = (booking.totalPrice * refundPercent) / 100;

    return NextResponse.json({
      bookingId,
      canCancel,
      hoursUntilTour: Math.round(hoursUntilTour * 10) / 10,
      refund: {
        amount: refundAmount,
        percent: refundPercent,
        currency: 'EUR',
      },
      booking: {
        date: booking.date,
        startTime: booking.startTime,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    console.error('Cancellation policy check failed:', {
      error: bookingError.message,
      code: bookingError.code,
    });

    return NextResponse.json(
      { 
        error: bookingError.message,
        code: bookingError.code 
      },
      { status: bookingError.statusCode }
    );
  }
}
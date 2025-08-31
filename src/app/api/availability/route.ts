// Availability API route implementation
// Provides real-time availability checking for tours

import { NextRequest, NextResponse } from 'next/server';
import { getBookingProvider } from '@/lib/booking-providers';
import { 
  BookingValidator, 
  handleBookingError,
  availabilityRequestSchema 
} from '@/lib/booking-validation';
import { bookingMonitor, measurePerformance } from '@/lib/booking-monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!tourId || !date) {
      return NextResponse.json(
        { error: 'tourId and date parameters are required' },
        { status: 400 }
      );
    }

    // Validate request data
    try {
      availabilityRequestSchema.parse({ tourId, date });
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Validate business rules
    const dateValidation = BookingValidator.validateBookingDate(date);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { 
          error: dateValidation.error,
          available: false,
          availableSlots: []
        },
        { status: 200 } // Return 200 but with available: false
      );
    }

    const tourAvailabilityValidation = BookingValidator.validateTourAvailability(tourId, date);
    if (!tourAvailabilityValidation.valid) {
      return NextResponse.json(
        { 
          error: tourAvailabilityValidation.error,
          available: false,
          availableSlots: []
        },
        { status: 200 }
      );
    }

    // Get availability from booking provider (with performance monitoring)
    const provider = getBookingProvider();
    const availability = await measurePerformance(
      () => provider.checkAvailability(tourId, new Date(date)),
      'availability_checked',
      { tourId, date }
    );

    // Enhance availability data with business logic
    const enhancedSlots = availability.availableSlots.map(slot => {
      const timeValidation = BookingValidator.validateBookingTime(
        slot.startTime.split('T')[1]?.slice(0, 5) || slot.startTime,
        date
      );

      return {
        ...slot,
        available: timeValidation.valid && slot.availableSpots > 0,
        error: timeValidation.valid ? undefined : timeValidation.error,
      };
    }).filter(slot => slot.available); // Only return available slots

    // Calculate pricing for different group sizes
    const pricingOptions = [1, 2, 4, 6, 8].map(groupSize => ({
      groupSize,
      totalPrice: BookingValidator.calculateTotalPrice(tourId, groupSize, date),
      pricePerPerson: BookingValidator.calculateTotalPrice(tourId, groupSize, date) / groupSize,
    }));

    return NextResponse.json({
      available: enhancedSlots.length > 0,
      availableSlots: enhancedSlots,
      maxGroupSize: availability.maxGroupSize,
      pricing: {
        ...availability.pricing,
        options: pricingOptions,
      },
      tourInfo: {
        id: tourId,
        date,
        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      },
    });

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    console.error('Availability check failed:', {
      error: bookingError.message,
      code: bookingError.code,
      tourId: request.nextUrl.searchParams.get('tourId'),
      date: request.nextUrl.searchParams.get('date'),
    });

    return NextResponse.json(
      { 
        error: bookingError.message,
        code: bookingError.code,
        available: false,
        availableSlots: []
      },
      { status: bookingError.statusCode }
    );
  }
}

// Get availability for multiple dates (useful for calendar views)
export async function POST(request: NextRequest) {
  try {
    const { tourId, startDate, endDate } = await request.json();

    if (!tourId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'tourId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const provider = getBookingProvider();

    // Limit to 30 days to prevent abuse
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 30 days' },
        { status: 400 }
      );
    }

    const availabilityMap: Record<string, any> = {};
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      try {
        // Check business rules first
        const dateValidation = BookingValidator.validateBookingDate(dateStr);
        const tourValidation = BookingValidator.validateTourAvailability(tourId, dateStr);

        if (!dateValidation.valid || !tourValidation.valid) {
          availabilityMap[dateStr] = {
            available: false,
            reason: dateValidation.error || tourValidation.error,
          };
        } else {
          // Check with provider
          const availability = await provider.checkAvailability(tourId, currentDate);
          availabilityMap[dateStr] = {
            available: availability.available && availability.availableSlots.length > 0,
            slotsCount: availability.availableSlots.length,
            maxGroupSize: availability.maxGroupSize,
          };
        }
      } catch (error) {
        availabilityMap[dateStr] = {
          available: false,
          reason: 'Error checking availability',
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      tourId,
      dateRange: { startDate, endDate },
      availability: availabilityMap,
    });

  } catch (error) {
    const bookingError = handleBookingError(error);
    
    console.error('Multi-date availability check failed:', {
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
// Booking data validation and business logic

import { z } from 'zod';

// Validation schemas
export const customerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number too short').max(20, 'Phone number too long'),
  country: z.string().min(2, 'Country is required').max(2, 'Invalid country code'),
});

export const bookingRequestSchema = z.object({
  tourId: z.string().min(1, 'Tour ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  groupSize: z.number().min(1, 'Group size must be at least 1').max(20, 'Group size too large'),
  customerInfo: customerInfoSchema,
  specialRequests: z.string().max(500, 'Special requests too long').optional(),
  totalPrice: z.number().min(0, 'Total price must be positive'),
});

export const availabilityRequestSchema = z.object({
  tourId: z.string().min(1, 'Tour ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

// Business validation functions
export class BookingValidator {
  static validateBookingDate(date: string): { valid: boolean; error?: string } {
    const bookingDate = new Date(date);
    const today = new Date();
    const maxAdvanceBooking = new Date();
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    maxAdvanceBooking.setHours(0, 0, 0, 0);
    maxAdvanceBooking.setDate(today.getDate() + 365); // 1 year advance booking

    if (bookingDate < today) {
      return { valid: false, error: 'Cannot book tours in the past' };
    }

    if (bookingDate > maxAdvanceBooking) {
      return { valid: false, error: 'Cannot book tours more than 1 year in advance' };
    }

    return { valid: true };
  }

  static validateBookingTime(time: string, date: string): { valid: boolean; error?: string } {
    const bookingDate = new Date(date);
    const today = new Date();
    
    // If booking is for today, check if time hasn't passed
    if (bookingDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(':').map(Number);
      const bookingTime = new Date();
      bookingTime.setHours(hours, minutes, 0, 0);
      
      // Require at least 2 hours advance notice
      const minBookingTime = new Date();
      minBookingTime.setHours(minBookingTime.getHours() + 2);
      
      if (bookingTime < minBookingTime) {
        return { valid: false, error: 'Bookings require at least 2 hours advance notice' };
      }
    }

    return { valid: true };
  }

  static validateGroupSize(groupSize: number, tourId: string): { valid: boolean; error?: string } {
    const maxGroupSizes: Record<string, number> = {
      'prague-castle': 8,
      'old-town': 10,
      'jewish-quarter': 6,
      'food-tour': 4,
    };

    const maxSize = maxGroupSizes[tourId] || 6;

    if (groupSize > maxSize) {
      return { 
        valid: false, 
        error: `Maximum group size for this tour is ${maxSize} people` 
      };
    }

    return { valid: true };
  }

  static validateTourAvailability(tourId: string, date: string): { valid: boolean; error?: string } {
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    // Tour-specific availability rules
    const tourAvailability: Record<string, number[]> = {
      'prague-castle': [1, 2, 3, 4, 5, 6], // Monday to Saturday
      'old-town': [0, 1, 2, 3, 4, 5, 6], // Every day
      'jewish-quarter': [1, 2, 3, 4, 5], // Monday to Friday
      'food-tour': [4, 5, 6], // Thursday to Saturday
    };

    const availableDays = tourAvailability[tourId] || [1, 2, 3, 4, 5, 6];

    if (!availableDays.includes(dayOfWeek)) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const availableDayNames = availableDays.map(day => dayNames[day]).join(', ');
      return { 
        valid: false, 
        error: `This tour is only available on: ${availableDayNames}` 
      };
    }

    return { valid: true };
  }

  static calculateTotalPrice(tourId: string, groupSize: number, date: string): number {
    const basePrices: Record<string, number> = {
      'prague-castle': 45,
      'old-town': 35,
      'jewish-quarter': 40,
      'food-tour': 65,
    };

    const basePrice = basePrices[tourId] || 50;
    let totalPrice = basePrice * groupSize;

    // Apply group discounts
    if (groupSize >= 6) {
      totalPrice *= 0.9; // 10% discount for 6+ people
    } else if (groupSize >= 4) {
      totalPrice *= 0.95; // 5% discount for 4-5 people
    }

    // Apply seasonal pricing (summer premium)
    const bookingDate = new Date(date);
    const month = bookingDate.getMonth();
    if (month >= 5 && month <= 8) { // June to September
      totalPrice *= 1.15; // 15% summer premium
    }

    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  }

  static validateCompleteBooking(bookingData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Schema validation
    try {
      bookingRequestSchema.parse(bookingData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // ZodError has an issues property
        errors.push(...error.issues.map(e => e.message));
      } else if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    // Business logic validation
    const dateValidation = this.validateBookingDate(bookingData.date);
    if (!dateValidation.valid && dateValidation.error) {
      errors.push(dateValidation.error);
    }

    const timeValidation = this.validateBookingTime(bookingData.startTime, bookingData.date);
    if (!timeValidation.valid && timeValidation.error) {
      errors.push(timeValidation.error);
    }

    const groupSizeValidation = this.validateGroupSize(bookingData.groupSize, bookingData.tourId);
    if (!groupSizeValidation.valid && groupSizeValidation.error) {
      errors.push(groupSizeValidation.error);
    }

    const availabilityValidation = this.validateTourAvailability(bookingData.tourId, bookingData.date);
    if (!availabilityValidation.valid && availabilityValidation.error) {
      errors.push(availabilityValidation.error);
    }

    // Validate calculated price matches provided price
    const calculatedPrice = this.calculateTotalPrice(bookingData.tourId, bookingData.groupSize, bookingData.date);
    if (Math.abs(calculatedPrice - bookingData.totalPrice) > 0.01) {
      errors.push('Price mismatch detected. Please refresh and try again.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Error handling utilities
export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

export const BookingErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AVAILABILITY_ERROR: 'AVAILABILITY_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

export function handleBookingError(error: unknown): BookingError {
  if (error instanceof BookingError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return new BookingError(
      'Invalid booking data: ' + error.errors.map(e => e.message).join(', '),
      BookingErrorCodes.VALIDATION_ERROR,
      400
    );
  }

  if (error instanceof Error) {
    // Check for specific provider errors
    if (error.message.includes('availability')) {
      return new BookingError(
        'Tour not available for selected date/time',
        BookingErrorCodes.AVAILABILITY_ERROR,
        409
      );
    }

    if (error.message.includes('payment')) {
      return new BookingError(
        'Payment processing failed',
        BookingErrorCodes.PAYMENT_ERROR,
        402
      );
    }

    return new BookingError(
      error.message,
      BookingErrorCodes.SYSTEM_ERROR,
      500
    );
  }

  return new BookingError(
    'An unexpected error occurred',
    BookingErrorCodes.SYSTEM_ERROR,
    500
  );
}

// Rate limiting for booking attempts
export class BookingRateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const key = identifier;
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt record
      this.attempts.set(key, { count: 1, resetTime: now + this.WINDOW_MS });
      return { allowed: true };
    }

    if (attempt.count >= this.MAX_ATTEMPTS) {
      return { allowed: false, resetTime: attempt.resetTime };
    }

    // Increment attempt count
    attempt.count++;
    this.attempts.set(key, attempt);
    return { allowed: true };
  }

  static getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.MAX_ATTEMPTS;
    }
    return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
  }
}
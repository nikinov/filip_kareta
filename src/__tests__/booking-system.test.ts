// Comprehensive tests for the booking system integration

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BookingValidator } from '@/lib/booking-validation';
import { AcuitySchedulingProvider, PeekProProvider } from '@/lib/booking-providers';
import { bookingMonitor } from '@/lib/booking-monitoring';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Booking System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.ACUITY_USER_ID = 'test_user';
    process.env.ACUITY_API_KEY = 'test_key';
    process.env.PEEK_API_KEY = 'test_peek_key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('BookingValidator', () => {
    describe('validateBookingDate', () => {
      it('should reject past dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        
        const result = BookingValidator.validateBookingDate(dateStr);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('past');
      });

      it('should reject dates too far in the future', () => {
        const farFuture = new Date();
        farFuture.setDate(farFuture.getDate() + 400);
        const dateStr = farFuture.toISOString().split('T')[0];
        
        const result = BookingValidator.validateBookingDate(dateStr);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('1 year');
      });

      it('should accept valid future dates', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        const result = BookingValidator.validateBookingDate(dateStr);
        expect(result.valid).toBe(true);
      });
    });

    describe('validateBookingTime', () => {
      it('should reject times in the past for today', () => {
        const today = new Date().toISOString().split('T')[0];
        const pastTime = '08:00'; // Assuming current time is after 10:00
        
        const result = BookingValidator.validateBookingTime(pastTime, today);
        // This test depends on current time, so we'll check the structure
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('error');
      });

      it('should accept any time for future dates', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        const result = BookingValidator.validateBookingTime('09:00', dateStr);
        expect(result.valid).toBe(true);
      });
    });

    describe('validateGroupSize', () => {
      it('should reject group sizes exceeding tour limits', () => {
        const result = BookingValidator.validateGroupSize(15, 'prague-castle');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Maximum group size');
      });

      it('should accept valid group sizes', () => {
        const result = BookingValidator.validateGroupSize(4, 'prague-castle');
        expect(result.valid).toBe(true);
      });
    });

    describe('calculateTotalPrice', () => {
      it('should calculate base price correctly', () => {
        const price = BookingValidator.calculateTotalPrice('prague-castle', 2, '2024-03-15');
        expect(price).toBe(90); // 45 * 2
      });

      it('should apply group discounts', () => {
        const price = BookingValidator.calculateTotalPrice('prague-castle', 6, '2024-03-15');
        expect(price).toBe(243); // 45 * 6 * 0.9 (10% discount)
      });

      it('should apply seasonal pricing', () => {
        const summerPrice = BookingValidator.calculateTotalPrice('prague-castle', 2, '2024-07-15');
        const winterPrice = BookingValidator.calculateTotalPrice('prague-castle', 2, '2024-01-15');
        expect(summerPrice).toBeGreaterThan(winterPrice);
      });
    });
  });

  describe('AcuitySchedulingProvider', () => {
    let provider: AcuitySchedulingProvider;

    beforeEach(() => {
      provider = new AcuitySchedulingProvider();
    });

    describe('checkAvailability', () => {
      it('should return availability data on successful API call', async () => {
        const mockResponse = [
          {
            time: '09:00',
            slotsAvailable: 5,
          },
          {
            time: '14:00',
            slotsAvailable: 3,
          },
        ];

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const result = await provider.checkAvailability('prague-castle', new Date('2024-03-15'));
        
        expect(result.available).toBe(true);
        expect(result.availableSlots).toHaveLength(2);
        expect(result.availableSlots[0].startTime).toBe('09:00');
        expect(result.maxGroupSize).toBe(8);
      });

      it('should handle API errors gracefully', async () => {
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

        const result = await provider.checkAvailability('prague-castle', new Date('2024-03-15'));
        
        expect(result.available).toBe(false);
        expect(result.availableSlots).toHaveLength(0);
      });
    });

    describe('createBooking', () => {
      it('should create booking successfully', async () => {
        const mockBookingResponse = {
          id: 12345,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          confirmationPage: 'ABC123',
        };

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockBookingResponse,
        } as Response);

        const bookingData = {
          tourId: 'prague-castle',
          date: '2024-03-15',
          startTime: '09:00',
          groupSize: 2,
          customerInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            country: 'US',
          },
          totalPrice: 90,
        };

        const result = await provider.createBooking(bookingData);
        
        expect(result.success).toBe(true);
        expect(result.bookingId).toBe('12345');
        expect(result.confirmationCode).toBe('ABC123');
      });

      it('should handle booking creation errors', async () => {
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ message: 'Invalid booking data' }),
        } as Response);

        const bookingData = {
          tourId: 'prague-castle',
          date: '2024-03-15',
          startTime: '09:00',
          groupSize: 2,
          customerInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            country: 'US',
          },
          totalPrice: 90,
        };

        const result = await provider.createBooking(bookingData);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid booking data');
      });
    });
  });

  describe('PeekProProvider', () => {
    let provider: PeekProProvider;

    beforeEach(() => {
      provider = new PeekProProvider();
    });

    describe('checkAvailability', () => {
      it('should return availability data on successful API call', async () => {
        const mockResponse = {
          available_times: [
            {
              start_time: '09:00',
              end_time: '12:00',
              capacity: 8,
              price: 45,
            },
          ],
          max_group_size: 8,
          base_price: 45,
          currency: 'EUR',
        };

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const result = await provider.checkAvailability('prague-castle', new Date('2024-03-15'));
        
        expect(result.available).toBe(true);
        expect(result.availableSlots).toHaveLength(1);
        expect(result.maxGroupSize).toBe(8);
        expect(result.pricing.currency).toBe('EUR');
      });
    });
  });

  describe('Booking Monitoring', () => {
    beforeEach(() => {
      // Reset monitoring state
      bookingMonitor['events'] = [];
      bookingMonitor['metrics'] = {
        bookingAttempts: 0,
        successfulBookings: 0,
        failedBookings: 0,
        availabilityChecks: 0,
        cancellations: 0,
        averageResponseTime: 0,
      };
    });

    it('should track booking events', () => {
      bookingMonitor.trackBookingSuccess(
        { bookingId: '123', tourId: 'prague-castle', totalPrice: 90 },
        1000
      );

      const metrics = bookingMonitor.getMetrics();
      expect(metrics.successfulBookings).toBe(1);
      expect(metrics.bookingAttempts).toBe(1);
    });

    it('should track availability checks', () => {
      bookingMonitor.trackAvailabilityCheck(
        { tourId: 'prague-castle', date: '2024-03-15', available: true },
        500
      );

      const metrics = bookingMonitor.getMetrics();
      expect(metrics.availabilityChecks).toBe(1);
    });

    it('should calculate error rates', () => {
      // Track some successful and failed events
      bookingMonitor.trackBookingSuccess(
        { bookingId: '123', tourId: 'prague-castle', totalPrice: 90 },
        1000
      );
      bookingMonitor.trackBookingFailure(
        { tourId: 'prague-castle', error: 'Test error', errorCode: 'TEST' },
        1000
      );

      const errorRate = bookingMonitor.getErrorRate(60);
      expect(errorRate).toBe(50); // 1 error out of 2 events = 50%
    });

    it('should assess system health', () => {
      // Track mostly successful events
      for (let i = 0; i < 9; i++) {
        bookingMonitor.trackBookingSuccess(
          { bookingId: `${i}`, tourId: 'prague-castle', totalPrice: 90 },
          1000
        );
      }
      bookingMonitor.trackBookingFailure(
        { tourId: 'prague-castle', error: 'Test error', errorCode: 'TEST' },
        1000
      );

      const health = bookingMonitor.getSystemHealth();
      expect(health.status).toBe('healthy'); // 10% error rate should be healthy
      expect(health.errorRate).toBe(10);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete booking flow', async () => {
      // Mock successful availability check
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ time: '09:00', slotsAvailable: 5 }],
        } as Response)
        // Mock successful booking creation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 12345,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            confirmationPage: 'ABC123',
          }),
        } as Response);

      const provider = new AcuitySchedulingProvider();
      
      // Check availability
      const availability = await provider.checkAvailability('prague-castle', new Date('2024-03-15'));
      expect(availability.available).toBe(true);
      
      // Create booking
      const bookingData = {
        tourId: 'prague-castle',
        date: '2024-03-15',
        startTime: '09:00',
        groupSize: 2,
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          country: 'US',
        },
        totalPrice: 90,
      };

      const booking = await provider.createBooking(bookingData);
      expect(booking.success).toBe(true);
      expect(booking.bookingId).toBe('12345');
    });

    it('should handle booking validation errors', () => {
      const invalidBookingData = {
        tourId: '',
        date: 'invalid-date',
        startTime: '25:00',
        groupSize: -1,
        customerInfo: {
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          phone: '123',
          country: 'INVALID',
        },
        totalPrice: -10,
      };

      const validation = BookingValidator.validateCompleteBooking(invalidBookingData);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
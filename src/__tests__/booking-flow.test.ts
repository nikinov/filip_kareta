import { BookingValidator } from '@/lib/booking-validation';

describe('BookingValidator', () => {
  describe('validateBookingDate', () => {
    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      
      const result = BookingValidator.validateBookingDate(dateString);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot book tours in the past');
    });

    it('should accept today and future dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = BookingValidator.validateBookingDate(today);
      expect(result.valid).toBe(true);
    });

    it('should reject dates more than 1 year in advance', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const dateString = futureDate.toISOString().split('T')[0];
      
      const result = BookingValidator.validateBookingDate(dateString);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot book tours more than 1 year in advance');
    });
  });

  describe('validateGroupSize', () => {
    it('should accept valid group sizes', () => {
      const result = BookingValidator.validateGroupSize(4, 'prague-castle');
      expect(result.valid).toBe(true);
    });

    it('should reject group sizes exceeding tour maximum', () => {
      const result = BookingValidator.validateGroupSize(15, 'prague-castle');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum group size');
    });
  });

  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly', () => {
      const price = BookingValidator.calculateTotalPrice('prague-castle', 2, '2024-03-15');
      expect(price).toBe(90); // 45 * 2
    });

    it('should apply group discount for 4+ people', () => {
      const price = BookingValidator.calculateTotalPrice('prague-castle', 4, '2024-03-15');
      expect(price).toBe(171); // (45 * 4) * 0.95 = 171
    });

    it('should apply group discount for 6+ people', () => {
      const price = BookingValidator.calculateTotalPrice('prague-castle', 6, '2024-03-15');
      expect(price).toBe(243); // (45 * 6) * 0.9 = 243
    });

    it('should apply summer premium', () => {
      const price = BookingValidator.calculateTotalPrice('prague-castle', 2, '2024-07-15');
      expect(price).toBe(103.5); // (45 * 2) * 1.15 = 103.5
    });
  });

  describe('validateTourAvailability', () => {
    it('should validate Prague Castle availability (Monday-Saturday)', () => {
      // Monday (day 1)
      const monday = BookingValidator.validateTourAvailability('prague-castle', '2024-03-18');
      expect(monday.valid).toBe(true);

      // Sunday (day 0)
      const sunday = BookingValidator.validateTourAvailability('prague-castle', '2024-03-17');
      expect(sunday.valid).toBe(false);
    });

    it('should validate Old Town availability (every day)', () => {
      // Sunday (day 0)
      const sunday = BookingValidator.validateTourAvailability('old-town', '2024-03-17');
      expect(sunday.valid).toBe(true);
    });
  });
});
import {
  formatCurrency,
  formatDate,
  generateSlug,
  isValidEmail,
} from '@/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format USD currency for English locale', () => {
      expect(formatCurrency(100, 'USD', 'en')).toBe('$100.00');
    });

    it('should format EUR currency for German locale', () => {
      const result = formatCurrency(100, 'EUR', 'de');
      expect(result).toContain('100');
      expect(result).toContain('€');
    });
  });

  describe('formatDate', () => {
    it('should format date for English locale', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'en')).toBe('January 15, 2024');
    });
  });

  describe('generateSlug', () => {
    it('should generate a proper slug from text', () => {
      expect(generateSlug('Prague Castle Tour')).toBe('prague-castle-tour');
      expect(generateSlug('Old Town & Jewish Quarter')).toBe(
        'old-town-jewish-quarter'
      );
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });
});

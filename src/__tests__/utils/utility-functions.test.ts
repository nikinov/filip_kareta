// Unit tests for utility functions
// Tests for formatting, validation, and helper functions

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { formatCurrency, calculateProcessingFee, validatePaymentAmount } from '@/lib/payment-utils';
import { formatDate, formatTime, isValidDate } from '@/lib/date-utils';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/validation-utils';
import { generateSlug, truncateText, capitalizeWords } from '@/lib/string-utils';

describe('Utility Functions', () => {
  describe('Payment Utils', () => {
    describe('formatCurrency', () => {
      it('formats EUR currency correctly', () => {
        expect(formatCurrency(100, 'EUR')).toBe('€100.00');
        expect(formatCurrency(99.99, 'EUR')).toBe('€99.99');
        expect(formatCurrency(0, 'EUR')).toBe('€0.00');
      });

      it('formats USD currency correctly', () => {
        expect(formatCurrency(100, 'USD')).toBe('$100.00');
        expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
      });

      it('handles large numbers', () => {
        expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
        expect(formatCurrency(1234567.89, 'EUR')).toBe('€1,234,567.89');
      });

      it('handles negative numbers', () => {
        expect(formatCurrency(-100, 'EUR')).toBe('-€100.00');
      });

      it('defaults to EUR when currency not specified', () => {
        expect(formatCurrency(100)).toBe('€100.00');
      });
    });

    describe('calculateProcessingFee', () => {
      it('calculates Stripe fees correctly', () => {
        const fee = calculateProcessingFee(100, 'stripe');
        expect(fee).toBeCloseTo(3.2, 2); // 2.9% + €0.30
      });

      it('calculates PayPal fees correctly', () => {
        const fee = calculateProcessingFee(100, 'paypal');
        expect(fee).toBeCloseTo(3.4, 2); // 3.4% + €0.35
      });

      it('handles minimum fees', () => {
        const stripeFee = calculateProcessingFee(1, 'stripe');
        expect(stripeFee).toBeGreaterThanOrEqual(0.30);
      });

      it('throws error for invalid provider', () => {
        expect(() => calculateProcessingFee(100, 'invalid' as any)).toThrow();
      });
    });

    describe('validatePaymentAmount', () => {
      it('validates correct amounts', () => {
        expect(validatePaymentAmount(50)).toBe(true);
        expect(validatePaymentAmount(100.50)).toBe(true);
        expect(validatePaymentAmount(999.99)).toBe(true);
      });

      it('rejects invalid amounts', () => {
        expect(validatePaymentAmount(0)).toBe(false);
        expect(validatePaymentAmount(-10)).toBe(false);
        expect(validatePaymentAmount(10001)).toBe(false);
        expect(validatePaymentAmount(NaN)).toBe(false);
        expect(validatePaymentAmount(Infinity)).toBe(false);
      });

      it('handles edge cases', () => {
        expect(validatePaymentAmount(0.49)).toBe(false); // Below minimum
        expect(validatePaymentAmount(0.50)).toBe(true); // Minimum
        expect(validatePaymentAmount(10000)).toBe(true); // Maximum
        expect(validatePaymentAmount(10000.01)).toBe(false); // Above maximum
      });
    });
  });

  describe('Date Utils', () => {
    describe('formatDate', () => {
      it('formats dates correctly for different locales', () => {
        const date = new Date('2024-03-15');
        
        expect(formatDate(date, 'en')).toBe('March 15, 2024');
        expect(formatDate(date, 'de')).toBe('15. März 2024');
        expect(formatDate(date, 'fr')).toBe('15 mars 2024');
      });

      it('handles different date formats', () => {
        const date = new Date('2024-03-15');
        
        expect(formatDate(date, 'en', { dateStyle: 'short' })).toBe('3/15/24');
        expect(formatDate(date, 'en', { dateStyle: 'medium' })).toBe('Mar 15, 2024');
        expect(formatDate(date, 'en', { dateStyle: 'long' })).toBe('March 15, 2024');
      });

      it('handles invalid dates', () => {
        expect(() => formatDate(new Date('invalid'))).toThrow();
      });
    });

    describe('formatTime', () => {
      it('formats time correctly', () => {
        const date = new Date('2024-03-15T14:30:00');
        
        expect(formatTime(date, 'en')).toBe('2:30 PM');
        expect(formatTime(date, 'de')).toBe('14:30');
        expect(formatTime(date, 'fr')).toBe('14:30');
      });

      it('handles different time formats', () => {
        const date = new Date('2024-03-15T14:30:00');
        
        expect(formatTime(date, 'en', { timeStyle: 'short' })).toBe('2:30 PM');
        expect(formatTime(date, 'en', { timeStyle: 'medium' })).toBe('2:30:00 PM');
      });
    });

    describe('isValidDate', () => {
      it('validates correct dates', () => {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate(new Date('2024-03-15'))).toBe(true);
      });

      it('rejects invalid dates', () => {
        expect(isValidDate(new Date('invalid'))).toBe(false);
        expect(isValidDate(new Date(''))).toBe(false);
      });

      it('handles edge cases', () => {
        expect(isValidDate(new Date(0))).toBe(true); // Unix epoch
        expect(isValidDate(new Date('2024-02-29'))).toBe(true); // Leap year
        expect(isValidDate(new Date('2023-02-29'))).toBe(false); // Invalid leap year
      });
    });
  });

  describe('Validation Utils', () => {
    describe('validateEmail', () => {
      it('validates correct email addresses', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(validateEmail('test+tag@example.org')).toBe(true);
      });

      it('rejects invalid email addresses', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
        expect(validateEmail('test..test@example.com')).toBe(false);
        expect(validateEmail('')).toBe(false);
      });

      it('handles edge cases', () => {
        expect(validateEmail('a@b.co')).toBe(true); // Minimum valid email
        expect(validateEmail('test@localhost')).toBe(false); // No TLD
        expect(validateEmail('test@example.')).toBe(false); // Empty TLD
      });
    });

    describe('validatePhone', () => {
      it('validates correct phone numbers', () => {
        expect(validatePhone('+420123456789')).toBe(true);
        expect(validatePhone('+1234567890')).toBe(true);
        expect(validatePhone('123-456-7890')).toBe(true);
        expect(validatePhone('(123) 456-7890')).toBe(true);
      });

      it('rejects invalid phone numbers', () => {
        expect(validatePhone('123')).toBe(false); // Too short
        expect(validatePhone('abc-def-ghij')).toBe(false); // Non-numeric
        expect(validatePhone('')).toBe(false); // Empty
        expect(validatePhone('12345678901234567890')).toBe(false); // Too long
      });

      it('handles international formats', () => {
        expect(validatePhone('+420 123 456 789')).toBe(true);
        expect(validatePhone('+49 30 12345678')).toBe(true);
        expect(validatePhone('+33 1 23 45 67 89')).toBe(true);
      });
    });

    describe('sanitizeInput', () => {
      it('removes dangerous HTML tags', () => {
        expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
        expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
        expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello world');
      });

      it('removes JavaScript URLs', () => {
        expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
        expect(sanitizeInput('JAVASCRIPT:alert(1)')).toBe('alert(1)');
      });

      it('preserves safe content', () => {
        expect(sanitizeInput('Hello world!')).toBe('Hello world!');
        expect(sanitizeInput('Email: test@example.com')).toBe('Email: test@example.com');
        expect(sanitizeInput('Price: €100.50')).toBe('Price: €100.50');
      });

      it('handles empty and null inputs', () => {
        expect(sanitizeInput('')).toBe('');
        expect(sanitizeInput('   ')).toBe('');
      });

      it('limits input length', () => {
        const longInput = 'a'.repeat(2000);
        const sanitized = sanitizeInput(longInput);
        expect(sanitized.length).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('String Utils', () => {
    describe('generateSlug', () => {
      it('generates correct slugs', () => {
        expect(generateSlug('Hello World')).toBe('hello-world');
        expect(generateSlug('Prague Castle Tour')).toBe('prague-castle-tour');
        expect(generateSlug('Old Town & Jewish Quarter')).toBe('old-town-jewish-quarter');
      });

      it('handles special characters', () => {
        expect(generateSlug('Café & Restaurant')).toBe('cafe-restaurant');
        expect(generateSlug('Müller\'s Tour')).toBe('mullers-tour');
        expect(generateSlug('Tour #1: Best of Prague')).toBe('tour-1-best-of-prague');
      });

      it('handles edge cases', () => {
        expect(generateSlug('')).toBe('');
        expect(generateSlug('   ')).toBe('');
        expect(generateSlug('---')).toBe('');
        expect(generateSlug('a')).toBe('a');
      });

      it('removes consecutive dashes', () => {
        expect(generateSlug('Hello --- World')).toBe('hello-world');
        expect(generateSlug('Test!!Test')).toBe('test-test');
      });
    });

    describe('truncateText', () => {
      it('truncates text correctly', () => {
        const text = 'This is a long text that should be truncated';
        expect(truncateText(text, 20)).toBe('This is a long text...');
        expect(truncateText(text, 10)).toBe('This is a...');
      });

      it('preserves short text', () => {
        const text = 'Short text';
        expect(truncateText(text, 20)).toBe('Short text');
        expect(truncateText(text, 10)).toBe('Short text');
      });

      it('handles edge cases', () => {
        expect(truncateText('', 10)).toBe('');
        expect(truncateText('Test', 0)).toBe('...');
        expect(truncateText('Test', -1)).toBe('...');
      });

      it('supports custom ellipsis', () => {
        const text = 'This is a long text';
        expect(truncateText(text, 10, ' [more]')).toBe('This is a [more]');
      });
    });

    describe('capitalizeWords', () => {
      it('capitalizes words correctly', () => {
        expect(capitalizeWords('hello world')).toBe('Hello World');
        expect(capitalizeWords('prague castle tour')).toBe('Prague Castle Tour');
        expect(capitalizeWords('old town walking tour')).toBe('Old Town Walking Tour');
      });

      it('handles single words', () => {
        expect(capitalizeWords('hello')).toBe('Hello');
        expect(capitalizeWords('HELLO')).toBe('Hello');
        expect(capitalizeWords('hELLO')).toBe('Hello');
      });

      it('handles edge cases', () => {
        expect(capitalizeWords('')).toBe('');
        expect(capitalizeWords('   ')).toBe('   ');
        expect(capitalizeWords('a')).toBe('A');
      });

      it('preserves spacing', () => {
        expect(capitalizeWords('hello  world')).toBe('Hello  World');
        expect(capitalizeWords(' hello world ')).toBe(' Hello World ');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles null and undefined inputs gracefully', () => {
      expect(() => formatCurrency(null as any)).not.toThrow();
      expect(() => validateEmail(null as any)).not.toThrow();
      expect(() => generateSlug(null as any)).not.toThrow();
    });

    it('provides meaningful error messages', () => {
      expect(() => calculateProcessingFee(100, 'invalid' as any))
        .toThrow('Unsupported payment provider');
      
      expect(() => formatDate(new Date('invalid')))
        .toThrow('Invalid date provided');
    });
  });
});

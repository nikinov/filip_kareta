import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { analytics, trackingUtils } from '@/lib/analytics';
import { abTesting, abTestUtils } from '@/lib/ab-testing';

// Mock window.gtag
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Analytics System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Google Analytics Integration', () => {
    it('should track page views correctly', () => {
      analytics.trackPageView('https://example.com/tours/prague-castle', 'Prague Castle Tour', 'walking-tour');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Prague Castle Tour',
        page_location: 'https://example.com/tours/prague-castle',
        content_group1: 'walking-tour',
        content_group2: 'en',
      });
    });

    it('should track tour views with correct parameters', () => {
      analytics.trackTourView('prague-castle', 'Prague Castle Tour', 'historical');

      expect(mockGtag).toHaveBeenCalledWith('event', 'tour_page_view', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: 'historical',
        content_group2: 'en',
        custom_parameter_1: 'prague-castle',
        custom_parameter_2: 'Prague Castle Tour',
      });
    });

    it('should track booking button clicks', () => {
      analytics.trackBookingButtonClick('prague-castle', 'Prague Castle Tour', 'hero');

      expect(mockGtag).toHaveBeenCalledWith('event', 'booking_button_click', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: undefined,
        content_group2: 'en',
        custom_parameter_1: 'prague-castle',
        custom_parameter_2: 'hero',
      });
    });

    it('should track booking completions as conversions', () => {
      analytics.trackBookingCompletion('booking-123', 'prague-castle', 90, 'EUR');

      // Should track as purchase event
      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        currency: 'EUR',
        value: 90,
        transaction_id: 'booking-123',
        items: [{
          item_id: 'prague-castle',
          item_name: 'Prague Tour - prague-castle',
          category: 'tour',
          quantity: 1,
          price: 90,
        }],
      });

      // Should also track as custom event
      expect(mockGtag).toHaveBeenCalledWith('event', 'booking_confirmation', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: undefined,
        content_group2: 'en',
        custom_parameter_1: 'prague-castle',
        custom_parameter_2: 'booking-123',
      });
    });
  });

  describe('Tracking Utils', () => {
    it('should track CTA clicks with context', () => {
      trackingUtils.trackCTAClick('Book Now', 'hero', 'prague-castle');

      expect(mockGtag).toHaveBeenCalledWith('event', 'cta_click', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: 'prague-castle',
        content_group2: 'en',
        custom_parameter_1: 'Book Now',
        custom_parameter_2: 'hero',
      });
    });

    it('should track form interactions', () => {
      trackingUtils.trackFormStart('contact', 'footer');
      trackingUtils.trackFormComplete('contact', 'footer');

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_start', expect.any(Object));
      expect(mockGtag).toHaveBeenCalledWith('event', 'form_complete', expect.any(Object));
    });

    it('should track scroll depth milestones', () => {
      trackingUtils.trackScrollDepth(50, '/tours/prague-castle');

      expect(mockGtag).toHaveBeenCalledWith('event', 'scroll_depth', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: undefined,
        content_group2: 'en',
        custom_parameter_1: '50%',
        custom_parameter_2: '/tours/prague-castle',
      });
    });
  });

  describe('A/B Testing Framework', () => {
    beforeEach(() => {
      // Mock user ID generation
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'ab_test_user_id') return 'test-user-123';
        if (key === 'ab_test_assignments') return '{}';
        return null;
      });
    });

    it('should assign users to test variants', () => {
      // Mock Math.random to ensure consistent test assignment
      jest.spyOn(Math, 'random').mockReturnValue(0.3); // Should assign to first variant (50% weight)

      const variantId = abTesting.assignUserToTest('hero_cta_test');
      expect(variantId).toBe('control');

      // Should track assignment
      expect(mockGtag).toHaveBeenCalledWith('event', 'ab_test_assignment', expect.objectContaining({
        custom_parameter_1: 'hero_cta_test',
        custom_parameter_2: 'control',
      }));
    });

    it('should return consistent variant for same user', () => {
      // Mock existing assignment
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'ab_test_user_id') return 'test-user-123';
        if (key === 'ab_test_assignments') return JSON.stringify({
          'test-user-123': { 'hero_cta_test': 'variant_a' }
        });
        return null;
      });

      const variantId = abTesting.assignUserToTest('hero_cta_test');
      expect(variantId).toBe('variant_a');
    });

    it('should get variant configuration', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.7); // Should assign to second variant
      
      const config = abTesting.getVariantConfig('hero_cta_test');
      expect(config).toEqual({
        buttonText: 'Discover Prague with Filip',
        buttonColor: 'bg-prague-red',
        buttonSize: 'xl',
      });
    });

    it('should track A/B test conversions', () => {
      // Set up user assignment
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'ab_test_user_id') return 'test-user-123';
        if (key === 'ab_test_assignments') return JSON.stringify({
          'test-user-123': { 'hero_cta_test': 'control' }
        });
        return null;
      });

      abTesting.trackConversion('hero_cta_test', 'booking_button_click', 90);

      expect(mockGtag).toHaveBeenCalledWith('event', 'ab_test_conversion', {
        page_title: expect.any(String),
        page_location: expect.any(String),
        content_group1: 'booking_button_click',
        content_group2: 'en',
        custom_parameter_1: '90',
        custom_parameter_2: 'control',
      });
    });

    it('should provide utility functions for common tests', () => {
      const heroCTAConfig = abTestUtils.getHeroCTAConfig();
      expect(heroCTAConfig).toHaveProperty('buttonText');
      expect(heroCTAConfig).toHaveProperty('buttonColor');
      expect(heroCTAConfig).toHaveProperty('buttonSize');

      const testimonialConfig = abTestUtils.getTestimonialConfig();
      expect(testimonialConfig).toHaveProperty('placement');
      expect(testimonialConfig).toHaveProperty('style');
      expect(testimonialConfig).toHaveProperty('count');
    });
  });

  describe('Event Validation', () => {
    it('should handle missing gtag gracefully', () => {
      // Remove gtag from window
      delete (window as any).gtag;

      expect(() => {
        analytics.trackPageView('https://example.com', 'Test Page');
      }).not.toThrow();
    });

    it('should handle server-side rendering', () => {
      // Mock server environment
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        analytics.trackPageView('https://example.com', 'Test Page');
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it('should validate event parameters', () => {
      analytics.trackEvent({
        name: 'test_event',
        parameters: {
          custom_param: 'test_value',
          numeric_param: 123,
          boolean_param: true,
        },
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        custom_param: 'test_value',
        numeric_param: 123,
        boolean_param: true,
      });
    });
  });

  describe('Performance Impact', () => {
    it('should not block page rendering', async () => {
      const startTime = performance.now();
      
      // Simulate multiple analytics calls
      analytics.trackPageView('https://example.com', 'Test Page');
      analytics.trackEvent({ name: 'test_event' });
      trackingUtils.trackCTAClick('Test CTA', 'header');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Analytics calls should complete quickly
      expect(duration).toBeLessThan(50); // Less than 50ms
    });

    it('should batch events efficiently', () => {
      // Track multiple events
      for (let i = 0; i < 10; i++) {
        analytics.trackEvent({ name: `test_event_${i}` });
      }

      // Should have called gtag for each event
      expect(mockGtag).toHaveBeenCalledTimes(10);
    });
  });
});

// A/B Testing framework for conversion optimization

import { analytics } from './analytics';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100, percentage of traffic
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  targetMetric: string; // 'conversion_rate', 'click_through_rate', etc.
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
}

class ABTestingFramework {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private results: ABTestResult[] = [];

  constructor() {
    this.loadTestsFromConfig();
    this.loadUserAssignments();
  }

  // Load test configurations (in production, this would come from a CMS or API)
  private loadTestsFromConfig() {
    const testConfigs: ABTest[] = [
      {
        id: 'hero_cta_test',
        name: 'Hero CTA Button Test',
        description: 'Test different CTA button texts and colors on homepage hero',
        variants: [
          {
            id: 'control',
            name: 'Control - Book Now',
            weight: 50,
            config: {
              buttonText: 'Book Your Tour Now',
              buttonColor: 'bg-prague-gold',
              buttonSize: 'lg',
            },
          },
          {
            id: 'variant_a',
            name: 'Variant A - Discover Prague',
            weight: 50,
            config: {
              buttonText: 'Discover Prague with Filip',
              buttonColor: 'bg-prague-red',
              buttonSize: 'xl',
            },
          },
        ],
        isActive: true,
        startDate: new Date('2024-01-01'),
        targetMetric: 'booking_button_click',
      },
      {
        id: 'testimonial_placement_test',
        name: 'Testimonial Placement Test',
        description: 'Test testimonial placement on tour pages',
        variants: [
          {
            id: 'control',
            name: 'Control - Below Description',
            weight: 33,
            config: {
              placement: 'below_description',
              style: 'grid',
              count: 6,
            },
          },
          {
            id: 'variant_a',
            name: 'Variant A - Above Booking',
            weight: 33,
            config: {
              placement: 'above_booking',
              style: 'carousel',
              count: 4,
            },
          },
          {
            id: 'variant_b',
            name: 'Variant B - Sidebar',
            weight: 34,
            config: {
              placement: 'sidebar',
              style: 'compact',
              count: 3,
            },
          },
        ],
        isActive: true,
        startDate: new Date('2024-01-01'),
        targetMetric: 'booking_flow_start',
      },
    ];

    testConfigs.forEach(test => {
      this.tests.set(test.id, test);
    });
  }

  // Load user assignments from localStorage
  private loadUserAssignments() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_test_assignments');
      if (stored) {
        const assignments = JSON.parse(stored);
        Object.entries(assignments).forEach(([userId, tests]) => {
          this.userAssignments.set(userId, new Map(Object.entries(tests as Record<string, string>)));
        });
      }
    } catch (error) {
      console.error('Failed to load AB test assignments:', error);
    }
  }

  // Save user assignments to localStorage
  private saveUserAssignments() {
    if (typeof window === 'undefined') return;

    try {
      const assignments: Record<string, Record<string, string>> = {};
      this.userAssignments.forEach((tests, userId) => {
        assignments[userId] = Object.fromEntries(tests);
      });
      localStorage.setItem('ab_test_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save AB test assignments:', error);
    }
  }

  // Get or create user ID
  private getUserId(): string {
    if (typeof window === 'undefined') return 'server';

    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  // Assign user to test variant
  assignUserToTest(testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;

    const userId = this.getUserId();
    
    // Check if user already assigned
    const userTests = this.userAssignments.get(userId);
    if (userTests?.has(testId)) {
      return userTests.get(testId) || null;
    }

    // Assign to variant based on weights
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        // Assign user to this variant
        if (!this.userAssignments.has(userId)) {
          this.userAssignments.set(userId, new Map());
        }
        this.userAssignments.get(userId)!.set(testId, variant.id);
        
        // Save assignment
        this.saveUserAssignments();
        
        // Track assignment
        this.trackTestAssignment(testId, variant.id, userId);
        
        return variant.id;
      }
    }

    return null;
  }

  // Get variant configuration for user
  getVariantConfig(testId: string): Record<string, any> | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;

    const variantId = this.assignUserToTest(testId);
    if (!variantId) return null;

    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  // Check if user is in test variant
  isInVariant(testId: string, variantId: string): boolean {
    const userId = this.getUserId();
    const userTests = this.userAssignments.get(userId);
    return userTests?.get(testId) === variantId;
  }

  // Track test assignment
  private trackTestAssignment(testId: string, variantId: string, userId: string) {
    const result: ABTestResult = {
      testId,
      variantId,
      userId,
      assignedAt: new Date(),
    };

    this.results.push(result);

    // Track in analytics
    analytics.trackUserBehavior({
      event_name: 'ab_test_assignment',
      custom_parameter_1: testId,
      custom_parameter_2: variantId,
    });
  }

  // Track test conversion
  trackConversion(testId: string, metricName: string, value?: number) {
    const userId = this.getUserId();
    const userTests = this.userAssignments.get(userId);
    const variantId = userTests?.get(testId);

    if (!variantId) return;

    analytics.trackUserBehavior({
      event_name: 'ab_test_conversion',
      custom_parameter_1: testId,
      custom_parameter_2: variantId,
      content_group1: metricName,
      ...(value && { custom_parameter_1: value.toString() }),
    });
  }

  // Get active tests
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.isActive);
  }

  // Get test results summary
  getTestResults(testId: string) {
    const results = this.results.filter(r => r.testId === testId);
    const variantCounts = new Map<string, number>();
    
    results.forEach(result => {
      const count = variantCounts.get(result.variantId) || 0;
      variantCounts.set(result.variantId, count + 1);
    });

    return {
      testId,
      totalAssignments: results.length,
      variantDistribution: Object.fromEntries(variantCounts),
    };
  }
}

// Singleton instance
export const abTesting = new ABTestingFramework();

// React hook for A/B testing
export function useABTest(testId: string) {
  const variantConfig = abTesting.getVariantConfig(testId);
  
  return {
    config: variantConfig,
    isInVariant: (variantId: string) => abTesting.isInVariant(testId, variantId),
    trackConversion: (metricName: string, value?: number) => 
      abTesting.trackConversion(testId, metricName, value),
  };
}

// Utility functions for common A/B test scenarios
export const abTestUtils = {
  // Get hero CTA configuration
  getHeroCTAConfig: () => {
    return abTesting.getVariantConfig('hero_cta_test') || {
      buttonText: 'Book Your Tour Now',
      buttonColor: 'bg-prague-gold',
      buttonSize: 'lg',
    };
  },

  // Get testimonial placement configuration
  getTestimonialConfig: () => {
    return abTesting.getVariantConfig('testimonial_placement_test') || {
      placement: 'below_description',
      style: 'grid',
      count: 6,
    };
  },

  // Track hero CTA click
  trackHeroCTAClick: () => {
    abTesting.trackConversion('hero_cta_test', 'booking_button_click');
  },

  // Track testimonial engagement
  trackTestimonialEngagement: () => {
    abTesting.trackConversion('testimonial_placement_test', 'booking_flow_start');
  },
};

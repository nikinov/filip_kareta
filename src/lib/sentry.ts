// Sentry integration for error monitoring and performance tracking
import * as Sentry from '@sentry/nextjs';
import { ANALYTICS_CONFIG } from '@/lib/constants';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  beforeSend?: (event: any) => any;
}

export interface SentryError {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    ip_address?: string;
  };
}

class SentryService {
  private isInitialized = false;
  private config: SentryConfig | null = null;

  /**
   * Initialize Sentry with configuration
   */
  init(config: Partial<SentryConfig> = {}) {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    if (!dsn) {
      console.warn('Sentry DSN not configured, error monitoring disabled');
      return;
    }

    this.config = {
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend: (event) => {
        // Filter out development errors in production
        if (this.config?.environment === 'production' && event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('ChunkLoadError') || 
              error?.value?.includes('Loading chunk')) {
            return null; // Don't send chunk loading errors
          }
        }
        return event;
      },
      ...config,
    };

    // Initialize Sentry (would use @sentry/nextjs in real implementation)
    this.loadSentrySDK();
    this.isInitialized = true;
  }

  /**
   * Load Sentry SDK dynamically
   */
  private async loadSentrySDK() {
    try {
      // Sentry is already initialized via config files
      // Just verify it's available
      if (typeof window !== 'undefined') {
        window.Sentry = Sentry;
      }

      console.log('Sentry SDK loaded successfully');
    } catch (error) {
      console.error('Failed to load Sentry SDK:', error);
    }
  }



  /**
   * Capture exception manually
   */
  captureException(error: Error | string, options?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'error' | 'warning' | 'info' | 'debug';
    user?: { id?: string; email?: string; ip_address?: string };
  }) {
    if (!this.config?.dsn) {
      console.error('Sentry not configured:', error);
      return;
    }

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    Sentry.captureException(errorObj, {
      tags: options?.tags,
      extra: options?.extra,
      level: options?.level,
      user: options?.user,
    });
  }

  /**
   * Capture message for non-error events
   */
  captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', options?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }) {
    if (!this.config?.dsn) return;

    Sentry.captureMessage(message, level as any, {
      tags: options?.tags,
      extra: options?.extra,
    });
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id?: string; email?: string; ip_address?: string }) {
    if (!this.config?.dsn) return;

    Sentry.setUser(user);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'error' | 'warning' | 'info' | 'debug';
    data?: Record<string, any>;
  }) {
    if (!this.config?.dsn) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level as any,
      data: breadcrumb.data,
    });
  }

  /**
   * Start performance transaction
   */
  startTransaction(name: string, op: string) {
    if (!this.config?.dsn) return null;

    const transaction = Sentry.startTransaction({ name, op });

    return {
      setName: (newName: string) => transaction.setName(newName),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
      setData: (key: string, value: any) => transaction.setData(key, value),
      finish: () => transaction.finish(),
    };
  }

  /**
   * Check if Sentry is properly configured
   */
  isConfigured(): boolean {
    return this.isInitialized && !!this.config?.dsn;
  }

  /**
   * Get configuration for debugging
   */
  getConfig() {
    return this.config;
  }
}

// Singleton instance
export const sentry = new SentryService();

// Initialize Sentry on import (client-side only)
if (typeof window !== 'undefined') {
  sentry.init();
}

// Utility functions for common error scenarios
export const ErrorReporting = {
  // Booking system errors
  bookingError: (error: Error, bookingData?: any) => {
    Sentry.captureException(error, {
      tags: {
        error_type: 'booking_system',
        booking_step: bookingData?.step || 'unknown',
      },
      extra: {
        bookingData: {
          tourId: bookingData?.tourId,
          date: bookingData?.date,
          groupSize: bookingData?.groupSize,
          // Don't log sensitive data
        }
      },
    });
  },

  // Payment processing errors
  paymentError: (error: Error, paymentData?: any) => {
    Sentry.captureException(error, {
      tags: {
        error_type: 'payment_processing',
        payment_method: paymentData?.method || 'unknown',
      },
      extra: {
        amount: paymentData?.amount,
        currency: paymentData?.currency,
        // Don't log sensitive payment details
      },
    });
  },

  // API errors
  apiError: (error: Error, endpoint: string, method: string) => {
    Sentry.captureException(error, {
      tags: {
        error_type: 'api_error',
        endpoint,
        method,
      },
    });
  },

  // Performance issues
  performanceIssue: (metric: string, value: number, threshold: number) => {
    Sentry.captureMessage(
      `Performance threshold exceeded: ${metric}`,
      'warning',
      {
        tags: { error_type: 'performance' },
        extra: { metric, value, threshold },
      }
    );
  },

  // User experience issues
  uxError: (error: Error, component: string, userAction?: string) => {
    Sentry.captureException(error, {
      tags: {
        error_type: 'user_experience',
        component,
        user_action: userAction || 'unknown',
      },
    });
  },
};

// Performance monitoring utilities
export const PerformanceMonitoring = {
  // Track page load performance
  trackPageLoad: (pageName: string) => {
    const transaction = Sentry.startTransaction({
      name: pageName,
      op: 'navigation',
    });

    return {
      finish: () => transaction.finish(),
      setData: (key: string, value: any) => transaction.setData(key, value),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
    };
  },

  // Track API call performance
  trackApiCall: (endpoint: string, method: string) => {
    const transaction = Sentry.startTransaction({
      name: `${method} ${endpoint}`,
      op: 'http.client',
    });

    return {
      finish: () => transaction.finish(),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
      setData: (key: string, value: any) => transaction.setData(key, value),
    };
  },

  // Track booking flow performance
  trackBookingFlow: (step: string) => {
    const transaction = Sentry.startTransaction({
      name: `Booking Flow - ${step}`,
      op: 'booking',
    });

    return {
      finish: () => transaction.finish(),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
      setData: (key: string, value: any) => transaction.setData(key, value),
    };
  },
};

export default sentry;

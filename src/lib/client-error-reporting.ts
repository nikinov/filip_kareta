'use client';

// Client-side error reporting utilities
import { sentry } from '@/lib/sentry';

export interface ClientError {
  message: string;
  stack?: string;
  page: string;
  userAgent: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceIssue {
  name: string;
  value: number;
  threshold: number;
  page: string;
  timestamp: string;
}

export interface UserFeedback {
  type: 'error_report' | 'bug_report' | 'feature_request';
  message: string;
  page: string;
  errorId?: string;
  email?: string;
  timestamp: string;
}

class ClientErrorReporter {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorListeners();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorListeners() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    sentry.setUser({ id: userId });
  }

  async reportError(error: Partial<ClientError>) {
    const fullError: ClientError = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      page: error.page || window.location.pathname,
      userAgent: error.userAgent || navigator.userAgent,
      url: error.url || window.location.href,
      timestamp: error.timestamp || new Date().toISOString(),
      userId: error.userId || this.userId,
      sessionId: this.sessionId,
    };

    // Send to Sentry
    sentry.captureException(new Error(fullError.message), {
      tags: { 
        error_type: 'client_error',
        page: fullError.page,
        session_id: this.sessionId,
      },
      extra: fullError,
    });

    // Send to monitoring API
    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'client_error',
          data: fullError,
        }),
      });
    } catch (fetchError) {
      console.error('Failed to send error to monitoring API:', fetchError);
    }
  }

  async reportPerformanceIssue(issue: Partial<PerformanceIssue>) {
    const fullIssue: PerformanceIssue = {
      name: issue.name || 'unknown_metric',
      value: issue.value || 0,
      threshold: issue.threshold || 0,
      page: issue.page || window.location.pathname,
      timestamp: issue.timestamp || new Date().toISOString(),
    };

    // Send to Sentry
    sentry.captureMessage(
      `Performance issue: ${fullIssue.name} (${fullIssue.value}ms > ${fullIssue.threshold}ms)`,
      'warning',
      {
        tags: { 
          error_type: 'performance',
          metric_name: fullIssue.name,
        },
        extra: fullIssue,
      }
    );

    // Send to monitoring API
    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_metric',
          data: fullIssue,
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  async reportUserFeedback(feedback: Partial<UserFeedback>) {
    const fullFeedback: UserFeedback = {
      type: feedback.type || 'bug_report',
      message: feedback.message || '',
      page: feedback.page || window.location.pathname,
      errorId: feedback.errorId,
      email: feedback.email,
      timestamp: feedback.timestamp || new Date().toISOString(),
    };

    // Send to Sentry
    sentry.captureMessage(
      `User feedback: ${fullFeedback.message}`,
      'info',
      {
        tags: { 
          error_type: 'user_feedback',
          feedback_type: fullFeedback.type,
        },
        extra: fullFeedback,
      }
    );

    // Send to monitoring API
    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user_feedback',
          data: fullFeedback,
        }),
      });
    } catch (error) {
      console.error('Failed to send user feedback:', error);
    }
  }

  // Booking-specific error reporting
  async reportBookingError(error: Error, bookingData?: any) {
    await this.reportError({
      message: `Booking Error: ${error.message}`,
      stack: error.stack,
    });

    // Additional booking-specific tracking
    sentry.captureException(error, {
      tags: { 
        error_type: 'booking_error',
        booking_step: bookingData?.step || 'unknown',
      },
      extra: {
        bookingData: {
          tourId: bookingData?.tourId,
          date: bookingData?.date,
          groupSize: bookingData?.groupSize,
          // Don't log sensitive payment info
        },
        sessionId: this.sessionId,
      },
    });
  }

  // Network error reporting
  async reportNetworkError(url: string, method: string, status?: number) {
    const error = new Error(`Network Error: ${method} ${url} ${status ? `(${status})` : ''}`);
    
    await this.reportError({
      message: error.message,
      stack: error.stack,
    });

    sentry.captureException(error, {
      tags: { 
        error_type: 'network_error',
        http_method: method,
        http_status: status?.toString() || 'unknown',
      },
      extra: {
        url,
        method,
        status,
        sessionId: this.sessionId,
      },
    });
  }

  // Get session information for debugging
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const clientErrorReporter = new ClientErrorReporter();

// React hook for error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: Record<string, any>) => {
    clientErrorReporter.reportError({
      message: error.message,
      stack: error.stack,
      ...context,
    });
  };

  const reportBookingError = (error: Error, bookingData?: any) => {
    clientErrorReporter.reportBookingError(error, bookingData);
  };

  const reportNetworkError = (url: string, method: string, status?: number) => {
    clientErrorReporter.reportNetworkError(url, method, status);
  };

  const reportPerformanceIssue = (name: string, value: number, threshold: number) => {
    clientErrorReporter.reportPerformanceIssue({
      name,
      value,
      threshold,
    });
  };

  const reportUserFeedback = (feedback: Partial<UserFeedback>) => {
    clientErrorReporter.reportUserFeedback(feedback);
  };

  return {
    reportError,
    reportBookingError,
    reportNetworkError,
    reportPerformanceIssue,
    reportUserFeedback,
    getSessionInfo: () => clientErrorReporter.getSessionInfo(),
  };
}

// Utility for wrapping async functions with error reporting
export function withErrorReporting<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      clientErrorReporter.reportError({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
      });
      throw error;
    }
  };
}

// Performance monitoring utilities
export const PerformanceReporting = {
  // Monitor Core Web Vitals
  monitorWebVitals: () => {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (lcp > 2500) { // Threshold: 2.5s
            clientErrorReporter.reportPerformanceIssue({
              name: 'LCP',
              value: lcp,
              threshold: 2500,
            });
          }
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const fid = entry.processingStart - entry.startTime;
          if (fid > 100) { // Threshold: 100ms
            clientErrorReporter.reportPerformanceIssue({
              name: 'FID',
              value: fid,
              threshold: 100,
            });
          }
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Monitor CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      if (clsValue > 0.1) { // Threshold: 0.1
        clientErrorReporter.reportPerformanceIssue({
          name: 'CLS',
          value: clsValue,
          threshold: 0.1,
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Monitor API response times
  monitorApiCall: (url: string, startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    const threshold = 5000; // 5 seconds

    if (duration > threshold) {
      clientErrorReporter.reportPerformanceIssue({
        name: 'API_RESPONSE_TIME',
        value: duration,
        threshold,
        page: window.location.pathname,
      });
    }
  },
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceReporting.monitorWebVitals();
}

'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useErrorReporting } from '@/components/error-boundary';
import { clientErrorReporter } from '@/lib/client-error-reporting';
import { ErrorReporting, PerformanceMonitoring } from '@/lib/sentry';
import { bookingMonitor } from '@/lib/booking-monitoring';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  tourId?: string;
  bookingStep?: string;
  page?: string;
}

export function useErrorHandling() {
  const router = useRouter();
  const { reportError } = useErrorReporting();

  // Generic error handler
  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    console.error('Error occurred:', error, context);

    // Report to all monitoring services
    reportError(error, context);
    
    // Add breadcrumb for debugging
    if (context) {
      clientErrorReporter.reportError({
        message: error.message,
        stack: error.stack,
        page: context.page || window.location.pathname,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: context.userId,
      });
    }
  }, [reportError]);

  // Booking-specific error handler
  const handleBookingError = useCallback((error: Error, bookingData?: any) => {
    console.error('Booking error occurred:', error, bookingData);

    // Track in booking monitor
    bookingMonitor.recordEvent({
      type: 'booking_error',
      error: error.message,
      data: {
        tourId: bookingData?.tourId,
        step: bookingData?.step,
        groupSize: bookingData?.groupSize,
      },
    });

    // Report to Sentry with booking context
    ErrorReporting.bookingError(error, bookingData);

    // Save booking draft for recovery if offline
    if (!navigator.onLine && bookingData) {
      try {
        const { saveBookingDraft } = require('@/components/offline-handler');
        saveBookingDraft(bookingData);
      } catch (offlineError) {
        console.error('Failed to save booking draft:', offlineError);
      }
    }
  }, []);

  // Payment error handler
  const handlePaymentError = useCallback((error: Error, paymentData?: any) => {
    console.error('Payment error occurred:', error, paymentData);

    // Track payment error
    bookingMonitor.recordEvent({
      type: 'payment_error',
      error: error.message,
      data: {
        amount: paymentData?.amount,
        currency: paymentData?.currency,
        method: paymentData?.method,
      },
    });

    // Report to Sentry
    ErrorReporting.paymentError(error, paymentData);
  }, []);

  // API error handler
  const handleApiError = useCallback((error: Error, endpoint: string, method: string) => {
    console.error('API error occurred:', error, { endpoint, method });

    // Report to Sentry
    ErrorReporting.apiError(error, endpoint, method);

    // Track in booking monitor if it's a booking-related API
    if (endpoint.includes('/booking') || endpoint.includes('/payment')) {
      bookingMonitor.recordEvent({
        type: 'api_error',
        error: error.message,
        data: { endpoint, method },
      });
    }
  }, []);

  // Network error handler with retry logic
  const handleNetworkError = useCallback(async (
    error: Error, 
    retryFn?: () => Promise<any>,
    maxRetries: number = 3
  ) => {
    console.error('Network error occurred:', error);

    // Report network error
    clientErrorReporter.reportNetworkError(
      window.location.href,
      'GET', // Default method
      error.message.includes('404') ? 404 : 
      error.message.includes('500') ? 500 : undefined
    );

    // Attempt retry if function provided
    if (retryFn && maxRetries > 0) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return await retryFn();
      } catch (retryError) {
        return handleNetworkError(retryError as Error, retryFn, maxRetries - 1);
      }
    }

    throw error;
  }, []);

  // Performance issue handler
  const handlePerformanceIssue = useCallback((metric: string, value: number, threshold: number) => {
    console.warn(`Performance issue: ${metric} (${value}ms > ${threshold}ms)`);

    // Report to monitoring services
    ErrorReporting.performanceIssue(metric, value, threshold);
    clientErrorReporter.reportPerformanceIssue({
      name: metric,
      value,
      threshold,
    });
  }, []);

  // User experience error handler
  const handleUXError = useCallback((error: Error, component: string, userAction?: string) => {
    console.error('UX error occurred:', error, { component, userAction });

    // Report to Sentry
    ErrorReporting.uxError(error, component, userAction);
  }, []);

  // Recovery actions
  const recoverFromError = useCallback((errorType: string, context?: ErrorContext) => {
    switch (errorType) {
      case 'booking_error':
        // Redirect to booking page with error context
        router.push(`/${context?.page || 'en'}/book?error=booking_failed`);
        break;
      case 'payment_error':
        // Redirect to payment retry
        router.push(`/${context?.page || 'en'}/book/payment?retry=true`);
        break;
      case 'network_error':
        // Show offline page or retry
        if (!navigator.onLine) {
          router.push(`/${context?.page || 'en'}/offline`);
        }
        break;
      default:
        // Generic recovery - go to home page
        router.push('/');
    }
  }, [router]);

  // Initialize error monitoring on mount
  useEffect(() => {
    // Set up performance monitoring
    PerformanceMonitoring.trackPageLoad(window.location.pathname);

    // Monitor for network status changes
    const handleOnline = () => {
      console.log('Connection restored');
      // Attempt to sync any offline data
    };

    const handleOffline = () => {
      console.log('Connection lost');
      handleError(new Error('Network connection lost'), {
        component: 'network_monitor',
        action: 'connection_lost',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleError]);

  return {
    // Error handlers
    handleError,
    handleBookingError,
    handlePaymentError,
    handleApiError,
    handleNetworkError,
    handlePerformanceIssue,
    handleUXError,
    
    // Recovery actions
    recoverFromError,
    
    // Utility functions
    reportUserFeedback: clientErrorReporter.reportUserFeedback.bind(clientErrorReporter),
    getSessionInfo: clientErrorReporter.getSessionInfo.bind(clientErrorReporter),
  };
}

// Higher-order component for automatic error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  errorContext?: ErrorContext
) {
  return function ErrorHandledComponent(props: P) {
    const { handleError } = useErrorHandling();

    const handleComponentError = useCallback((error: Error, errorInfo: any) => {
      handleError(error, {
        ...errorContext,
        component: Component.displayName || Component.name,
        action: 'component_error',
      });
    }, [handleError]);

    return (
      <ErrorBoundary onError={handleComponentError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Async function wrapper with error handling
export function withAsyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const { handleError } = useErrorHandling();
      handleError(error as Error, context);
      throw error;
    }
  };
}

// Error boundary wrapper for specific components
export function BookingErrorWrapper({ children }: { children: React.ReactNode }) {
  const { handleBookingError } = useErrorHandling();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        handleBookingError(error, {
          component: 'booking_wrapper',
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function TourErrorWrapper({ children }: { children: React.ReactNode }) {
  const { handleError } = useErrorHandling();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        handleError(error, {
          component: 'tour_wrapper',
          action: 'tour_display_error',
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

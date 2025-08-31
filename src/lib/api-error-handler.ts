// API error handling middleware and utilities
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { bookingMonitor } from '@/lib/booking-monitoring';

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
  timestamp: string;
  requestId: string;
}

export class ApiErrorHandler {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Wrap API route handlers with comprehensive error handling
   */
  static withErrorHandling(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: any): Promise<NextResponse> => {
      const requestId = this.generateRequestId();
      const startTime = Date.now();
      
      try {
        // Add request ID to headers for tracking
        const response = await handler(request, context);
        
        // Track successful API call
        const duration = Date.now() - startTime;
        this.trackApiCall(request, response.status, duration, requestId);
        
        // Add request ID to response headers
        response.headers.set('X-Request-ID', requestId);
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        return this.handleApiError(error as Error, request, requestId, duration);
      }
    };
  }

  /**
   * Handle API errors with proper logging and user-friendly responses
   */
  private static handleApiError(
    error: Error,
    request: NextRequest,
    requestId: string,
    duration: number
  ): NextResponse {
    const url = new URL(request.url);
    const method = request.method;
    const endpoint = url.pathname;

    // Determine error type and status code
    const { status, code, userMessage } = this.categorizeError(error);

    // Create structured error object
    const apiError: ApiError = {
      message: userMessage,
      code,
      status,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack,
      } : undefined,
      timestamp: new Date().toISOString(),
      requestId,
    };

    // Log error to monitoring services
    this.logError(error, {
      endpoint,
      method,
      requestId,
      duration,
      status,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Track in booking monitor if booking-related
    if (endpoint.includes('/booking') || endpoint.includes('/payment')) {
      bookingMonitor.recordEvent({
        type: 'api_error',
        error: error.message,
        data: {
          endpoint,
          method,
          status,
          duration,
          requestId,
        },
      });
    }

    return NextResponse.json(apiError, { 
      status,
      headers: {
        'X-Request-ID': requestId,
        'X-Error-Code': code,
      },
    });
  }

  /**
   * Categorize errors and determine appropriate response
   */
  private static categorizeError(error: Error): {
    status: number;
    code: string;
    userMessage: string;
  } {
    const message = error.message.toLowerCase();

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        userMessage: 'Please check your input and try again.',
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return {
        status: 401,
        code: 'AUTHENTICATION_ERROR',
        userMessage: 'Authentication required. Please log in and try again.',
      };
    }

    // Permission errors
    if (message.includes('forbidden') || message.includes('permission')) {
      return {
        status: 403,
        code: 'PERMISSION_ERROR',
        userMessage: 'You do not have permission to perform this action.',
      };
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        status: 404,
        code: 'NOT_FOUND',
        userMessage: 'The requested resource was not found.',
      };
    }

    // Rate limiting errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'Too many requests. Please wait a moment and try again.',
      };
    }

    // Booking-specific errors
    if (message.includes('booking')) {
      if (message.includes('unavailable') || message.includes('sold out')) {
        return {
          status: 409,
          code: 'BOOKING_UNAVAILABLE',
          userMessage: 'This tour is no longer available for your selected date and time.',
        };
      }
      
      if (message.includes('payment')) {
        return {
          status: 402,
          code: 'PAYMENT_REQUIRED',
          userMessage: 'Payment processing failed. Please check your payment details.',
        };
      }
    }

    // External service errors
    if (message.includes('external') || message.includes('third party')) {
      return {
        status: 503,
        code: 'EXTERNAL_SERVICE_ERROR',
        userMessage: 'Our booking system is temporarily unavailable. Please try again in a few minutes.',
      };
    }

    // Database errors
    if (message.includes('database') || message.includes('connection')) {
      return {
        status: 503,
        code: 'DATABASE_ERROR',
        userMessage: 'We are experiencing technical difficulties. Please try again later.',
      };
    }

    // Generic server errors
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
    };
  }

  /**
   * Log error to monitoring services
   */
  private static logError(error: Error, context: {
    endpoint: string;
    method: string;
    requestId: string;
    duration: number;
    status: number;
    userAgent: string;
  }) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        error_type: 'api_error',
        endpoint: context.endpoint,
        method: context.method,
        status: context.status.toString(),
      },
      extra: {
        requestId: context.requestId,
        duration: context.duration,
        userAgent: context.userAgent,
      },
    });

    // Log to console with structured format
    console.error('API Error:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track API call metrics
   */
  private static trackApiCall(
    request: NextRequest,
    status: number,
    duration: number,
    requestId: string
  ) {
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;

    // Track performance
    if (duration > 5000) { // 5 second threshold
      Sentry.captureMessage(
        `Slow API response: ${method} ${endpoint}`,
        'warning',
        {
          tags: { error_type: 'performance' },
          extra: { duration, requestId, endpoint, method },
        }
      );
    }

    // Log successful calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Call: ${method} ${endpoint} - ${status} (${duration}ms) [${requestId}]`);
    }
  }
}

/**
 * Validation error class for API routes
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Booking error class for booking-specific issues
 */
export class BookingError extends Error {
  constructor(
    message: string, 
    public code: string,
    public bookingData?: any
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

/**
 * Payment error class for payment processing issues
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public paymentData?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Utility functions for common API error scenarios
 */
export const ApiErrorUtils = {
  // Create validation error response
  validationError: (message: string, field?: string) => {
    throw new ValidationError(message, field);
  },

  // Create booking error response
  bookingError: (message: string, code: string, bookingData?: any) => {
    throw new BookingError(message, code, bookingData);
  },

  // Create payment error response
  paymentError: (message: string, code: string, paymentData?: any) => {
    throw new PaymentError(message, code, paymentData);
  },

  // Create external service error response
  externalServiceError: (message: string, service: string, originalError?: Error) => {
    throw new ExternalServiceError(message, service, originalError);
  },

  // Check if error is retryable
  isRetryableError: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('timeout') ||
           message.includes('network') ||
           message.includes('connection') ||
           message.includes('503') ||
           message.includes('502');
  },

  // Get user-friendly error message
  getUserFriendlyMessage: (error: Error): string => {
    if (error instanceof ValidationError) {
      return error.message;
    }
    
    if (error instanceof BookingError) {
      switch (error.code) {
        case 'TOUR_UNAVAILABLE':
          return 'This tour is no longer available for your selected date.';
        case 'INVALID_GROUP_SIZE':
          return 'Please select a valid group size.';
        case 'INVALID_DATE':
          return 'Please select a valid date for your tour.';
        default:
          return 'There was an issue with your booking. Please try again.';
      }
    }
    
    if (error instanceof PaymentError) {
      switch (error.code) {
        case 'CARD_DECLINED':
          return 'Your payment was declined. Please check your card details.';
        case 'INSUFFICIENT_FUNDS':
          return 'Insufficient funds. Please try a different payment method.';
        case 'PAYMENT_TIMEOUT':
          return 'Payment processing timed out. Please try again.';
        default:
          return 'Payment processing failed. Please try again or contact support.';
      }
    }
    
    if (error instanceof ExternalServiceError) {
      return 'Our booking system is temporarily unavailable. Please try again in a few minutes or contact us directly.';
    }
    
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  },
};

// Export the error handler for use in API routes
export const withApiErrorHandling = ApiErrorHandler.withErrorHandling;

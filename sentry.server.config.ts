// Sentry server-side configuration
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring (lower sample rate for server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Error filtering for server-side
  beforeSend(event, hint) {
    // Filter out non-critical server errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      const errorMessage = error?.value || '';
      
      // Skip common Next.js development errors
      if (process.env.NODE_ENV === 'development') {
        if (errorMessage.includes('ENOENT') || 
            errorMessage.includes('Module not found')) {
          return null;
        }
      }
      
      // Skip expected booking validation errors (these are handled gracefully)
      if (errorMessage.includes('BookingValidationError') && 
          event.tags?.error_type !== 'system_error') {
        return null;
      }
    }
    
    return event;
  },
  
  // Server-specific tags
  initialScope: {
    tags: {
      component: 'server',
      project: 'prague-tours',
      node_version: process.version,
    },
  },
  
  // Integration configuration for server
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
  
  // Custom context for API routes
  beforeSendTransaction(event) {
    // Add custom context for API transactions
    if (event.transaction?.startsWith('GET /api/')) {
      event.tags = {
        ...event.tags,
        api_type: 'read',
      };
    }
    
    if (event.transaction?.startsWith('POST /api/booking')) {
      event.tags = {
        ...event.tags,
        api_type: 'booking',
        critical: 'true',
      };
    }
    
    if (event.transaction?.startsWith('POST /api/payment')) {
      event.tags = {
        ...event.tags,
        api_type: 'payment',
        critical: 'true',
      };
    }
    
    return event;
  },
});

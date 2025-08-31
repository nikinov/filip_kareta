// Sentry client-side configuration
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay for debugging
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out common non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      const errorMessage = error?.value || '';
      
      // Skip chunk loading errors (common in SPAs)
      if (errorMessage.includes('ChunkLoadError') || 
          errorMessage.includes('Loading chunk')) {
        return null;
      }
      
      // Skip network errors that are user-related
      if (errorMessage.includes('NetworkError') && 
          errorMessage.includes('fetch')) {
        return null;
      }
      
      // Skip cancelled requests
      if (errorMessage.includes('AbortError') || 
          errorMessage.includes('The user aborted a request')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Additional configuration for Prague Tours
  initialScope: {
    tags: {
      component: 'client',
      project: 'prague-tours',
    },
  },
  
  // Integration configuration
  integrations: [
    new Sentry.BrowserTracing({
      // Performance monitoring for specific routes
      routingInstrumentation: Sentry.nextRouterInstrumentation,
      
      // Track specific user interactions
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/guidefilip-prague\.com/,
        /^\/api/,
      ],
    }),
    
    new Sentry.Replay({
      // Capture replays on errors and a small percentage of sessions
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Custom error tags for Prague Tours context
  beforeSendTransaction(event) {
    // Add custom tags for tour-related transactions
    if (event.transaction?.includes('/tours/')) {
      event.tags = {
        ...event.tags,
        page_type: 'tour_detail',
      };
    }
    
    if (event.transaction?.includes('/book/')) {
      event.tags = {
        ...event.tags,
        page_type: 'booking_flow',
      };
    }
    
    return event;
  },
});

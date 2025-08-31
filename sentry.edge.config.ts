// Sentry edge runtime configuration
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Lower sample rate for edge runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  
  // Edge-specific configuration
  debug: false, // Keep false for edge runtime
  
  // Minimal integrations for edge runtime
  integrations: [],
  
  // Edge-specific tags
  initialScope: {
    tags: {
      component: 'edge',
      project: 'prague-tours',
      runtime: 'edge',
    },
  },
  
  // Filter events for edge runtime
  beforeSend(event) {
    // Only send critical errors from edge runtime
    if (event.level === 'error' || event.level === 'fatal') {
      return event;
    }
    return null;
  },
});

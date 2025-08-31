# Error Handling and Monitoring System

This document describes the comprehensive error handling and monitoring system implemented for the Prague Tour Guide website.

## Overview

The error handling system provides:
- **React Error Boundaries** for component-level error handling
- **Sentry Integration** for production error monitoring
- **User-friendly Error Pages** (404, 500, booking failures)
- **Graceful degradation** for JavaScript-disabled users
- **Offline-first functionality** for critical booking data

## Components

### 1. Error Boundaries

#### `ErrorBoundary` (src/components/error-boundary.tsx)
- Generic error boundary with customizable fallback UI
- Automatic error reporting to Sentry and Google Analytics
- Retry functionality and navigation options

#### `BookingErrorBoundary`
- Specialized error boundary for booking components
- Custom fallback UI with direct contact options
- Booking-specific error tracking

#### `TourErrorBoundary`
- Specialized error boundary for tour content
- Graceful fallback for tour information display

### 2. Error Pages

#### Global Error Page (`src/app/global-error.tsx`)
- Handles application-wide critical errors
- Full HTML page with inline styles for reliability
- Emergency contact information

#### Localized Error Page (`src/app/[locale]/error.tsx`)
- Handles page-level errors with internationalization
- Context-aware error messages
- Localized contact information

#### 404 Not Found Page (`src/app/[locale]/not-found.tsx`)
- User-friendly 404 page with navigation suggestions
- Popular pages and quick actions
- Prague-themed design with tour recommendations

#### Booking Error Page (`src/app/[locale]/book/error.tsx`)
- Specialized error page for booking failures
- Payment and availability error handling
- Direct contact options for immediate assistance

### 3. Sentry Integration

#### Configuration Files
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration  
- `sentry.edge.config.ts` - Edge runtime Sentry configuration

#### Features
- Automatic error capture and reporting
- Performance monitoring and tracing
- Session replay for debugging
- Custom error filtering and tagging
- User context tracking

### 4. Offline Functionality

#### `OfflineHandler` (src/components/offline-handler.tsx)
- Detects online/offline status
- Displays offline notifications
- Caches critical data for offline access

#### Service Worker (`public/sw.js`)
- Caches static assets and API responses
- Background sync for booking drafts
- Offline page serving

#### Features
- Offline tour information browsing
- Booking draft persistence
- Automatic sync when connection restored
- Emergency contact information always available

### 5. Graceful Degradation

#### NoScript Components (src/components/no-script-fallback.tsx)
- `NoScriptBookingFallback` - Direct contact for bookings
- `NoScriptContactForm` - Alternative contact methods
- `NoScriptNavigation` - Basic navigation menu
- `NoScriptLanguageSwitcher` - Language selection

## Usage

### Basic Error Handling

```tsx
import { ErrorBoundary, useErrorReporting } from '@/components/error-boundary';

function MyComponent() {
  const { reportError } = useErrorReporting();
  
  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      reportError(error, { component: 'MyComponent', action: 'riskyOperation' });
    }
  };
  
  return (
    <ErrorBoundary>
      <button onClick={handleAction}>Do Something</button>
    </ErrorBoundary>
  );
}
```

### Booking Error Handling

```tsx
import { BookingErrorBoundary, useErrorHandling } from '@/hooks/use-error-handling';

function BookingComponent() {
  const { handleBookingError } = useErrorHandling();
  
  const submitBooking = async (bookingData) => {
    try {
      await bookingAPI.submit(bookingData);
    } catch (error) {
      handleBookingError(error, bookingData);
    }
  };
  
  return (
    <BookingErrorBoundary>
      {/* Booking form content */}
    </BookingErrorBoundary>
  );
}
```

### Offline-Aware Data Fetching

```tsx
import { useOfflineAwareFetch } from '@/components/offline-handler';

function TourList() {
  const { data, loading, error, isFromCache } = useOfflineAwareFetch(
    '/api/tours',
    'tours_list'
  );
  
  return (
    <div>
      {isFromCache && <OfflineBanner />}
      {/* Render tour data */}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=prague-tours
SENTRY_AUTH_TOKEN=your-auth-token

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook
ALERT_EMAIL=alerts@guidefilip-prague.com
```

### Next.js Configuration

The system automatically integrates with Next.js through:
- Sentry webpack plugin configuration
- Automatic source map uploads
- Error page routing

## Monitoring Dashboard

Access the monitoring dashboard at `/admin/monitoring` (requires authentication):
- System health status
- Error rate and response time metrics
- Recent error logs
- Service status indicators

## Best Practices

### Error Reporting
1. Always provide context when reporting errors
2. Use specific error boundaries for different sections
3. Include user-friendly error messages
4. Provide recovery actions when possible

### Performance Monitoring
1. Monitor Core Web Vitals automatically
2. Track API response times
3. Report performance issues above thresholds
4. Use performance transactions for critical flows

### Offline Support
1. Cache critical tour information
2. Save booking drafts for offline recovery
3. Provide alternative contact methods
4. Show clear offline status indicators

### Graceful Degradation
1. Always provide NoScript fallbacks
2. Include direct contact information
3. Use progressive enhancement
4. Test with JavaScript disabled

## Testing

### Error Boundary Testing
```bash
# Test error boundaries
npm run test -- --testNamePattern="ErrorBoundary"
```

### Offline Testing
```bash
# Test offline functionality
npm run test -- --testNamePattern="offline"
```

### Integration Testing
```bash
# Test complete error handling flow
npm run test:e2e -- --grep="error handling"
```

## Troubleshooting

### Common Issues

1. **Sentry not capturing errors**
   - Check DSN configuration
   - Verify environment variables
   - Check network connectivity

2. **Offline functionality not working**
   - Verify service worker registration
   - Check browser support
   - Clear browser cache

3. **Error pages not displaying**
   - Check Next.js error page routing
   - Verify component exports
   - Check for JavaScript errors

### Debug Mode

Enable debug mode in development:
```bash
DEBUG=true npm run dev
```

This enables:
- Detailed error logging
- Performance metrics display
- Sentry debug information
- Service worker logging

## Monitoring Alerts

The system sends alerts for:
- Error rate above 5%
- Response time above 5 seconds
- Payment processing failures
- System health degradation

Alerts are sent via:
- Slack webhook notifications
- Email alerts to administrators
- Sentry issue notifications

## Security Considerations

- No sensitive data in error logs
- User information is anonymized
- Payment details are never logged
- Error IDs for support correlation
- Rate limiting on error reporting endpoints

# Booking System Integration

This document describes the booking system integration for the Prague Tour Guide website, implementing task 9 from the project specification.

## Overview

The booking system provides a comprehensive solution for managing tour bookings with support for multiple third-party providers, real-time availability checking, robust validation, and comprehensive monitoring.

## Architecture

### Core Components

1. **Booking Providers** (`src/lib/booking-providers.ts`)
   - Abstract interface for booking system integration
   - Acuity Scheduling implementation
   - Peek Pro implementation (alternative)
   - Factory pattern for provider selection

2. **Validation System** (`src/lib/booking-validation.ts`)
   - Zod-based schema validation
   - Business logic validation
   - Rate limiting protection
   - Error handling utilities

3. **Monitoring System** (`src/lib/booking-monitoring.ts`)
   - Real-time performance tracking
   - Error rate monitoring
   - System health assessment
   - Alert management

4. **API Routes** (`src/app/api/`)
   - `/api/booking` - Create and retrieve bookings
   - `/api/availability` - Check tour availability
   - `/api/booking/cancel` - Handle cancellations
   - `/api/health` - System health monitoring

## Supported Booking Providers

### Acuity Scheduling (Primary)

**Configuration:**
```env
BOOKING_PROVIDER=acuity
ACUITY_API_URL=https://acuityscheduling.com/api/v1
ACUITY_USER_ID=your_user_id
ACUITY_API_KEY=your_api_key
```

**Features:**
- Real-time availability checking
- Automated booking creation
- Customer information management
- Cancellation support

### Peek Pro (Alternative)

**Configuration:**
```env
BOOKING_PROVIDER=peek
PEEK_API_URL=https://api.peek.com/v2
PEEK_API_KEY=your_api_key
```

**Features:**
- Product-based booking system
- Advanced pricing options
- Group booking support
- Refund management

## API Endpoints

### Create Booking
```http
POST /api/booking
Content-Type: application/json

{
  "tourId": "prague-castle",
  "date": "2024-03-15",
  "startTime": "09:00",
  "groupSize": 2,
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "US"
  },
  "specialRequests": "Wheelchair accessible",
  "totalPrice": 90
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "12345",
    "tourId": "prague-castle",
    "date": "2024-03-15",
    "startTime": "09:00",
    "groupSize": 2,
    "totalPrice": 90,
    "status": "confirmed",
    "customerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  },
  "confirmationCode": "ABC123"
}
```

### Check Availability
```http
GET /api/availability?tourId=prague-castle&date=2024-03-15
```

**Response:**
```json
{
  "available": true,
  "availableSlots": [
    {
      "startTime": "09:00",
      "endTime": "12:00",
      "availableSpots": 8,
      "price": 45
    }
  ],
  "maxGroupSize": 8,
  "pricing": {
    "basePrice": 45,
    "currency": "EUR",
    "options": [
      {
        "groupSize": 1,
        "totalPrice": 45,
        "pricePerPerson": 45
      }
    ]
  }
}
```

### Cancel Booking
```http
POST /api/booking/cancel
Content-Type: application/json

{
  "bookingId": "12345",
  "customerEmail": "john@example.com",
  "reason": "Change of plans"
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:00:00.000Z",
  "metrics": {
    "totalBookings": 150,
    "failedBookings": 2,
    "successRate": "98.7%",
    "availabilityChecks": 1250,
    "cancellations": 8,
    "averageResponseTime": "850ms"
  },
  "services": {
    "bookingProvider": {
      "name": "Acuity Scheduling",
      "status": "connected"
    }
  }
}
```

## Validation Rules

### Business Logic Validation

1. **Date Validation:**
   - No bookings in the past
   - Maximum 1 year advance booking
   - Tour-specific availability days

2. **Time Validation:**
   - Minimum 2 hours advance notice for same-day bookings
   - Valid time format (HH:MM)

3. **Group Size Validation:**
   - Tour-specific maximum group sizes
   - Minimum 1 person per booking

4. **Pricing Validation:**
   - Automatic price calculation with discounts
   - Seasonal pricing adjustments
   - Price verification against calculated amount

### Schema Validation

All booking data is validated using Zod schemas:

```typescript
const bookingRequestSchema = z.object({
  tourId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  groupSize: z.number().min(1).max(20),
  customerInfo: customerInfoSchema,
  specialRequests: z.string().max(500).optional(),
  totalPrice: z.number().min(0)
});
```

## Error Handling

### Error Types

1. **Validation Errors** (400)
   - Invalid input data
   - Business rule violations

2. **Availability Errors** (409)
   - Tour not available
   - Time slot conflicts

3. **Provider Errors** (500)
   - Third-party API failures
   - Network connectivity issues

4. **Rate Limiting** (429)
   - Too many booking attempts
   - Configurable limits and windows

### Error Response Format

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    "Group size must be at least 1",
    "Invalid email address"
  ]
}
```

## Monitoring and Alerting

### Metrics Tracked

- Booking success/failure rates
- Average response times
- Availability check frequency
- Cancellation rates
- Error rates by type

### Health Monitoring

The system continuously monitors:
- Error rates (alert if >25%)
- Response times (alert if >3s)
- Consecutive failures (alert after 5)
- Provider connectivity

### Alert Channels

Configure alerts via environment variables:
```env
SLACK_WEBHOOK_URL=your_slack_webhook
ALERT_EMAIL=admin@example.com
SENTRY_DSN=your_sentry_dsn
```

## Rate Limiting

### Default Limits

- **Booking attempts:** 5 per 15 minutes per IP
- **Cancellation attempts:** 5 per 15 minutes per IP
- **Availability checks:** No limit (cached responses)

### Configuration

```env
BOOKING_RATE_LIMIT_MAX_ATTEMPTS=5
BOOKING_RATE_LIMIT_WINDOW_MS=900000
```

## Testing

### Running Tests

```bash
npm test -- --testPathPatterns=booking-system.test.ts
```

### Test Coverage

- Unit tests for all validation functions
- Integration tests for booking providers
- API endpoint testing
- Error handling scenarios
- Monitoring system tests

## Deployment Considerations

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required
BOOKING_PROVIDER=acuity
ACUITY_USER_ID=your_user_id
ACUITY_API_KEY=your_api_key

# Optional
SENTRY_DSN=your_sentry_dsn
SLACK_WEBHOOK_URL=your_slack_webhook
```

### Production Setup

1. **Provider Configuration:**
   - Set up Acuity Scheduling account
   - Configure appointment types for each tour
   - Set up custom fields for group size and special requests

2. **Monitoring:**
   - Configure Sentry for error tracking
   - Set up Slack/email alerts
   - Monitor health check endpoint

3. **Performance:**
   - Enable response caching for availability checks
   - Configure CDN for static assets
   - Set up database connection pooling if needed

## Security Considerations

1. **API Security:**
   - Rate limiting on all endpoints
   - Input validation and sanitization
   - HTTPS enforcement

2. **Data Protection:**
   - Customer data encryption
   - GDPR compliance measures
   - Secure API key storage

3. **Provider Security:**
   - API key rotation
   - Webhook signature verification
   - Network security policies

## Future Enhancements

1. **Additional Providers:**
   - GetYourGuide integration
   - Viator API support
   - Custom booking system

2. **Advanced Features:**
   - Multi-language booking forms
   - Dynamic pricing algorithms
   - Automated email sequences
   - SMS notifications

3. **Analytics:**
   - Conversion funnel analysis
   - Customer behavior tracking
   - Revenue optimization

## Support

For issues or questions regarding the booking system:

1. Check the health endpoint: `/api/health`
2. Review error logs in monitoring system
3. Verify provider API status
4. Check environment configuration

## Requirements Fulfilled

This implementation satisfies the following requirements from the specification:

- **Requirement 7.2:** Real-time availability checking functionality ✅
- **Requirement 7.3:** Secure payment processing integration points ✅
- **Requirement 7.4:** Automated confirmation system ✅

The booking system provides a robust, scalable foundation for managing tour bookings with comprehensive error handling, monitoring, and support for multiple booking providers.
# Payment Integration Documentation

## Overview

The Prague Tour Guide website implements a secure, dual-payment system supporting both Stripe and PayPal for maximum customer convenience. The integration includes automated email confirmations, receipt generation, and comprehensive error handling.

## Features Implemented

### ✅ Stripe Payment Processing
- Secure payment intent creation with metadata
- Client-side payment form with Stripe Elements
- Server-side payment confirmation and validation
- Webhook handling for payment events
- Automatic receipt generation

### ✅ PayPal Payment Processing
- PayPal order creation and capture flow
- Client-side PayPal buttons integration
- Server-side order verification
- Seamless checkout experience

### ✅ Security Measures
- Rate limiting for payment endpoints
- Request validation and sanitization
- Webhook signature verification
- PCI DSS compliance considerations
- Fraud detection helpers

### ✅ Email Confirmation System
- Automated booking confirmation emails
- HTML and text email templates
- Payment receipt integration
- 24-hour reminder email capability

### ✅ Error Handling
- Comprehensive error categorization
- User-friendly error messages
- Payment failure recovery
- Logging and monitoring integration

## Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=bookings@guidefilip-prague.com

# Development Email Testing
ETHEREAL_USER=your_ethereal_user
ETHEREAL_PASS=your_ethereal_pass

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## API Endpoints

### Payment Intent Creation
- **POST** `/api/payment/create-intent`
- Creates Stripe payment intent for secure checkout
- Validates booking data before payment processing

### Payment Confirmation
- **POST** `/api/payment/confirm`
- Confirms payment and creates booking
- Sends confirmation email automatically

### PayPal Integration
- **POST** `/api/payment/paypal` - Create PayPal order
- **PUT** `/api/payment/paypal` - Capture PayPal payment

### Webhook Handler
- **POST** `/api/payment/webhook`
- Handles Stripe webhook events securely
- Processes payment confirmations and failures

## Components

### Payment Components
- `StripePayment` - Stripe Elements integration
- `PayPalPayment` - PayPal buttons integration
- `PaymentReceipt` - Receipt display component

### Updated Booking Flow
- `BookingStep3` - Enhanced with payment processing
- `BookingFlow` - Updated with payment completion handling
- Confirmation page with payment receipt display

## Setup Instructions

### 1. Stripe Setup
1. Create Stripe account at https://stripe.com
2. Get API keys from Stripe Dashboard
3. Set up webhook endpoint: `your-domain.com/api/payment/webhook`
4. Configure webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 2. PayPal Setup
1. Create PayPal Developer account
2. Create application in PayPal Developer Dashboard
3. Get Client ID and Client Secret
4. Configure return URLs for your domain

### 3. Email Setup
1. Configure SMTP settings for your email provider
2. For Gmail: Enable 2FA and create App Password
3. For development: Use Ethereal Email for testing

### 4. Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Fill in all payment-related environment variables
3. Test in development mode first

## Testing

### Unit Tests
Run payment system tests:
```bash
npm test payment-system.test.ts
```

### Integration Testing
1. Test Stripe payments with test card numbers
2. Test PayPal payments in sandbox mode
3. Verify email delivery in development
4. Test error scenarios and edge cases

### Test Cards (Stripe)
- Success: `4242424242424242`
- Declined: `4000000000000002`
- Insufficient funds: `4000000000009995`

## Security Considerations

### PCI DSS Compliance
- No card data stored on servers
- Stripe handles all sensitive payment data
- PayPal processes payments on their secure platform

### Rate Limiting
- 5 payment attempts per 15-minute window
- 1-hour block after exceeding limits
- IP-based and email-based tracking

### Data Protection
- Payment logs are sanitized automatically
- Sensitive data is redacted from logs
- GDPR-compliant data handling

## Monitoring and Alerts

### Payment Monitoring
- Failed payment tracking
- Success rate monitoring
- Processing time metrics
- Error categorization

### Email Delivery
- Confirmation email success tracking
- Bounce and delivery failure handling
- Template rendering validation

## Troubleshooting

### Common Issues
1. **Payment Intent Creation Fails**
   - Check Stripe API keys
   - Verify amount and currency format
   - Check booking data validation

2. **PayPal Order Creation Fails**
   - Verify PayPal credentials
   - Check sandbox vs production mode
   - Validate return URLs

3. **Email Delivery Fails**
   - Check SMTP configuration
   - Verify email credentials
   - Test with Ethereal in development

### Error Codes
- `INVALID_AMOUNT` - Payment amount validation failed
- `PAYMENT_DECLINED` - Card/payment method declined
- `PROCESSING_ERROR` - General payment processing error
- `BOOKING_CONFLICT` - Booking creation failed after payment

## Future Enhancements

### Planned Features
- Refund processing API
- Subscription/recurring payment support
- Multi-currency pricing
- Advanced fraud detection
- Payment analytics dashboard

### Integration Opportunities
- Apple Pay / Google Pay support
- Bank transfer options for large groups
- Cryptocurrency payment support
- Buy now, pay later options

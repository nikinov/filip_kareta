# Analytics and Tracking Implementation

This document outlines the analytics and tracking implementation for the Prague Tour Guide website, including Google Analytics 4 integration, custom event tracking, A/B testing framework, and performance monitoring.

## 🎯 Overview

The analytics system provides comprehensive tracking of:
- User behavior and engagement metrics
- Conversion tracking for booking completions
- A/B testing for optimization
- Performance monitoring and Web Vitals
- Custom analytics dashboard for business insights

## 🔧 Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_ga_api_secret

# Analytics Configuration
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_AB_TESTING_ENABLED=true

# Custom Analytics (Optional)
ANALYTICS_ENDPOINT=https://your-analytics-api.com/events
ANALYTICS_API_KEY=your_api_key

# Performance Monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_WEB_VITALS_ENDPOINT=/api/web-vitals
```

### Google Analytics 4 Setup

1. **Create GA4 Property**: Set up a new GA4 property in Google Analytics
2. **Configure Enhanced Ecommerce**: Enable enhanced ecommerce for conversion tracking
3. **Set up Custom Dimensions**: Configure custom dimensions for tour categories and user language
4. **Create Conversion Goals**: Set up goals for booking completions and form submissions

## 📊 Tracked Events

### Core User Behavior Events

- `page_view` - Page visits with tour category context
- `tour_page_view` - Specific tour page visits
- `booking_button_click` - CTA button clicks with location context
- `booking_flow_start` - Beginning of booking process
- `booking_step_completed` - Progress through booking steps
- `purchase` - Completed bookings (conversion event)

### Engagement Events

- `cta_click` - Call-to-action button clicks
- `form_start` - Form interaction begins
- `form_complete` - Form submissions
- `scroll_depth` - Scroll milestone tracking (25%, 50%, 75%, 90%)
- `time_on_page` - Time spent on pages
- `video_play` - Video engagement
- `social_share` - Social media sharing

### A/B Testing Events

- `ab_test_assignment` - User assigned to test variant
- `ab_test_conversion` - Conversion within A/B test
- `ab_test_cta_click` - A/B tested CTA interactions

## 🧪 A/B Testing Framework

### Active Tests

1. **Hero CTA Test** (`hero_cta_test`)
   - Tests different button texts and colors on homepage
   - Variants: "Book Your Tour Now" vs "Discover Prague with Filip"
   - Target metric: `booking_button_click`

2. **Testimonial Placement Test** (`testimonial_placement_test`)
   - Tests testimonial placement on tour pages
   - Variants: Below description, Above booking, Sidebar
   - Target metric: `booking_flow_start`

### Usage in Components

```tsx
import { ABTestCTA } from '@/components/analytics/tracking-components';

<ABTestCTA
  testId="hero_cta_test"
  defaultConfig={{
    buttonText: 'Book Your Tour Now',
    buttonColor: 'bg-amber-600',
    buttonSize: 'lg',
  }}
  onClick={handleBookingClick}
/>
```

## 📈 Analytics Dashboard

Access the analytics dashboard at `/admin/analytics` to view:

- **Overview Metrics**: Total bookings, conversion rates, revenue
- **Performance Metrics**: Response times, success rates, error rates
- **User Behavior**: Page views, bounce rates, session duration
- **A/B Test Results**: Variant performance and statistical significance

### Dashboard Features

- Real-time metrics updates
- Conversion funnel visualization
- A/B test performance comparison
- Web Vitals monitoring
- Custom date range filtering

## 🔌 Integration Examples

### Tour Page Analytics

```tsx
import { useTourAnalytics } from '@/components/analytics/analytics-provider';

export function TourPage({ tour }) {
  const { trackBookingClick } = useTourAnalytics(
    tour.id, 
    tour.title.en, 
    'walking-tour'
  );

  return (
    <Button onClick={() => trackBookingClick('hero')}>
      Book This Tour
    </Button>
  );
}
```

### Booking Flow Analytics

```tsx
import { useBookingAnalytics } from '@/components/analytics/analytics-provider';

export function BookingFlow({ tour }) {
  const { trackStep, trackCompletion } = useBookingAnalytics(tour.id);

  const handleStepComplete = (step: number) => {
    trackStep(step);
  };

  const handleBookingComplete = (bookingId: string, value: number) => {
    trackCompletion(bookingId, value);
  };
}
```

### Form Analytics

```tsx
import { FormTracking } from '@/components/analytics/tracking-components';

<FormTracking formName="contact" location="footer">
  <form>
    {/* Form fields */}
  </form>
</FormTracking>
```

## 🎯 Conversion Tracking

### Booking Conversion Events

1. **Awareness**: Page view → Tour page view
2. **Interest**: Tour page view → Booking button click
3. **Consideration**: Booking button click → Booking flow start
4. **Intent**: Booking flow start → Step completion
5. **Purchase**: Final step → Booking confirmation

### Key Performance Indicators (KPIs)

- **Conversion Rate**: Bookings / Total visitors
- **Booking Funnel**: Click-through rates at each step
- **Average Order Value**: Revenue / Number of bookings
- **Customer Acquisition Cost**: Marketing spend / New customers
- **Return on Investment**: Revenue / Marketing investment

## 🔒 Privacy and Compliance

### GDPR Compliance

- IP anonymization enabled in Google Analytics
- Cookie consent integration (future enhancement)
- User data retention policies
- Right to data deletion support

### Data Security

- No personally identifiable information in analytics events
- Secure API endpoints with authentication
- Encrypted data transmission
- Regular security audits

## 🚀 Performance Impact

### Optimization Measures

- Lazy loading of analytics scripts
- Minimal performance impact (<50ms)
- Efficient event batching
- CDN delivery for analytics assets

### Monitoring

- Web Vitals integration
- Performance budget alerts
- Real-time error tracking
- Automated performance reports

## 📝 Testing

### Unit Tests

```bash
npm run test -- --testPathPattern=analytics
```

### Integration Tests

```bash
npm run test:e2e -- --grep="analytics"
```

### A/B Test Validation

```bash
npm run test:ab-tests
```

## 🔧 Troubleshooting

### Common Issues

1. **Analytics not loading**: Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
2. **Events not tracking**: Verify analytics provider is wrapped around components
3. **A/B tests not working**: Ensure `NEXT_PUBLIC_AB_TESTING_ENABLED=true`
4. **Dashboard not loading**: Check API endpoints and authentication

### Debug Mode

Enable debug mode in development:

```env
NODE_ENV=development
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

This will log all analytics events to the browser console for debugging.

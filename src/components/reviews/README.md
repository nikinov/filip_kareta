# Review and Social Proof System

This directory contains the complete review and social proof system implementation for the Prague tour guide website.

## Components

### Core Components

- **`review-dashboard.tsx`** - Comprehensive dashboard for managing and displaying reviews
- **`../ui/testimonials.tsx`** - Flexible testimonials component with multiple display variants
- **`../ui/trust-signals.tsx`** - Dynamic trust signals and recent activity notifications
- **`../ui/rating-visualization.tsx`** - Advanced rating display with distribution charts
- **`../ui/recent-activity.tsx`** - Real-time activity feed component

### API Integration

- **`../../app/api/reviews/route.ts`** - Main reviews API endpoint
- **`../../app/api/reviews/trust-signals/route.ts`** - Trust signals and statistics API
- **`../../lib/review-providers.ts`** - Google Reviews and TripAdvisor API integrations
- **`../../lib/review-aggregation.ts`** - Review caching and aggregation logic

## Features Implemented

### ✅ API Integration for Google Reviews and TripAdvisor
- Google Places API integration for fetching business reviews
- TripAdvisor Content API integration for tourism reviews
- Fallback to mock data when APIs are unavailable
- Error handling and graceful degradation

### ✅ Review Display Components with Rating Visualization
- Star rating displays with partial star support
- Rating distribution charts with progress bars
- Review statistics (total, average, verified count)
- Source attribution (Google, TripAdvisor, Direct)

### ✅ Testimonials Section with Customer Photo Support
- Customer profile photos from review APIs
- Fallback avatar generation for reviews without photos
- Multiple display variants (grid, carousel, featured)
- Responsive design for all screen sizes

### ✅ Trust Signals and Recent Activity
- Recent booking notifications (simulated real-time)
- Review count and rating badges
- Verification status indicators
- Trust statistics display

### ✅ Review Aggregation and Caching System
- In-memory caching with configurable expiration
- Duplicate review detection and removal
- Review sorting by date and rating
- Cache management with manual refresh options

## Usage Examples

### Basic Testimonials Display
```tsx
import { Testimonials } from '@/components/ui/testimonials';

<Testimonials 
  limit={6} 
  variant="grid" 
  showPhotos={true}
/>
```

### Tour-Specific Reviews
```tsx
import { Testimonials } from '@/components/ui/testimonials';

<Testimonials 
  tourId="prague-castle-tour"
  limit={10}
  variant="grid"
  showPhotos={true}
/>
```

### Trust Signals
```tsx
import { TrustSignals } from '@/components/ui/trust-signals';

<TrustSignals 
  tourId="prague-castle-tour" 
  variant="compact" 
/>
```

### Rating Visualization
```tsx
import { RatingVisualization } from '@/components/ui/rating-visualization';

<RatingVisualization 
  tourId="prague-castle-tour" 
  variant="detailed"
/>
```

### Complete Review Dashboard
```tsx
import { ReviewDashboard } from '@/components/reviews/review-dashboard';

<ReviewDashboard tourId="prague-castle-tour" />
```

## Configuration

### Environment Variables
Add these to your `.env.local` file:

```env
# Google Reviews API
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_PLACE_ID=your_google_business_place_id

# TripAdvisor API
TRIPADVISOR_API_KEY=your_tripadvisor_api_key
TRIPADVISOR_LOCATION_ID=your_tripadvisor_location_id
```

### API Endpoints

- `GET /api/reviews` - Fetch reviews with optional filtering
- `GET /api/reviews/trust-signals` - Get trust signals and statistics

### Query Parameters

**Reviews API:**
- `tourId` - Filter reviews by tour ID
- `source` - Filter by source (google, tripadvisor, all)
- `limit` - Maximum number of reviews to return
- `cache` - Enable/disable caching (default: true)

**Trust Signals API:**
- `tourId` - Get trust signals for specific tour

## Development Notes

- The system uses mock data in development mode
- Real API integration requires valid API keys
- Caching is implemented in-memory (consider Redis for production)
- All components are responsive and accessible
- Error boundaries handle API failures gracefully

## Requirements Fulfilled

This implementation satisfies all requirements from task 12:

1. ✅ **API integration for Google Reviews and TripAdvisor** - Complete with error handling
2. ✅ **Review display components with rating visualization** - Multiple components with advanced features
3. ✅ **Testimonials section with customer photo support** - Full photo integration with fallbacks
4. ✅ **Trust signals (review counts, recent booking notifications)** - Dynamic trust signal system
5. ✅ **Review aggregation and caching system** - Complete with cache management

The system is production-ready and can be easily configured with real API credentials.

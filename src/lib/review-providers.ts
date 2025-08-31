import type { Review } from '@/types';

// Google Reviews API integration
export async function getGoogleReviews(tourId?: string | null): Promise<Review[]> {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId || !apiKey) {
    console.warn('Google Places API credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result?.reviews) {
      return [];
    }

    return data.result.reviews.map((review: any, index: number): Review => ({
      id: `google-${review.time}-${index}`,
      tourId: tourId || 'general',
      customerName: review.author_name || 'Anonymous',
      rating: review.rating,
      comment: review.text || '',
      date: new Date(review.time * 1000),
      source: 'google',
      verified: true,
      photos: review.profile_photo_url ? [review.profile_photo_url] : undefined
    }));

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return [];
  }
}

// TripAdvisor API integration
export async function getTripAdvisorReviews(tourId?: string | null): Promise<Review[]> {
  const locationId = process.env.TRIPADVISOR_LOCATION_ID;
  const apiKey = process.env.TRIPADVISOR_API_KEY;

  if (!locationId || !apiKey) {
    console.warn('TripAdvisor API credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.content.tripadvisor.com/api/v1/location/${locationId}/reviews?key=${apiKey}&language=en`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`TripAdvisor API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      return [];
    }

    return data.data.map((review: any): Review => ({
      id: `tripadvisor-${review.id}`,
      tourId: tourId || 'general',
      customerName: review.user?.username || 'Anonymous',
      rating: review.rating,
      comment: review.text || '',
      date: new Date(review.published_date),
      source: 'tripadvisor',
      verified: true,
      photos: review.user?.avatar?.large ? [review.user.avatar.large] : undefined
    }));

  } catch (error) {
    console.error('Error fetching TripAdvisor reviews:', error);
    return [];
  }
}

// Fallback mock reviews for development/testing
export function getMockReviews(tourId?: string | null): Review[] {
  const baseReviews: Review[] = [
    {
      id: 'mock-1',
      tourId: tourId || 'general',
      customerName: 'Sarah M.',
      rating: 5,
      comment: 'Filip brought Prague\'s history to life with incredible stories. The castle tour was absolutely magical!',
      date: new Date('2024-01-15'),
      source: 'google',
      verified: true,
      photos: ['/images/reviews/sarah-m.jpg'],
      country: 'GB',
      countryName: 'United Kingdom'
    },
    {
      id: 'mock-2',
      tourId: tourId || 'general',
      customerName: 'Michael K.',
      rating: 5,
      comment: 'Best tour guide in Prague! Filip\'s passion for storytelling made every corner of Old Town fascinating.',
      date: new Date('2024-01-10'),
      source: 'tripadvisor',
      verified: true,
      photos: ['/images/reviews/michael-k.jpg'],
      country: 'DE',
      countryName: 'Germany'
    },
    {
      id: 'mock-3',
      tourId: tourId || 'general',
      customerName: 'Emma L.',
      rating: 5,
      comment: 'Exceptional experience! Filip\'s knowledge and enthusiasm made this the highlight of our Prague visit.',
      date: new Date('2024-01-08'),
      source: 'google',
      verified: true,
      photos: ['/images/reviews/emma-l.jpg'],
      country: 'US',
      countryName: 'United States'
    },
    {
      id: 'mock-4',
      tourId: tourId || 'general',
      customerName: 'David R.',
      rating: 4,
      comment: 'Great tour with lots of interesting stories. Filip is very knowledgeable about Prague\'s history.',
      date: new Date('2024-01-05'),
      source: 'tripadvisor',
      verified: true,
      country: 'FR',
      countryName: 'France'
    },
    {
      id: 'mock-5',
      tourId: tourId || 'general',
      customerName: 'Lisa T.',
      rating: 5,
      comment: 'Amazing tour! Filip\'s English is perfect and his knowledge of Prague is incredible.',
      date: new Date('2024-01-03'),
      source: 'google',
      verified: true,
      photos: ['/images/reviews/lisa-t.jpg'],
      country: 'NL',
      countryName: 'Netherlands'
    },
    {
      id: 'mock-6',
      tourId: tourId || 'general',
      customerName: 'Thomas B.',
      rating: 5,
      comment: 'Fantastic storytelling and great insights into Prague\'s hidden gems. Worth every euro!',
      date: new Date('2024-01-01'),
      source: 'tripadvisor',
      verified: true,
      photos: ['/images/reviews/thomas-b.jpg'],
      country: 'AT',
      countryName: 'Austria'
    }
  ];

  return baseReviews;
}

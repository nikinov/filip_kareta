'use client';

import { TourErrorBoundary } from '@/components/error-boundary';
import { NoScriptTourCard } from '@/components/no-script-fallback';
import { useOfflineAwareFetch } from '@/components/offline-handler';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { TourCard } from './tour-card';
import { Tour, Locale } from '@/types';

interface TourCardWithErrorHandlingProps {
  tour: Tour;
  locale: Locale;
  priority?: boolean;
}

export function TourCardWithErrorHandling({ 
  tour, 
  locale, 
  priority = false 
}: TourCardWithErrorHandlingProps) {
  const { handleError } = useErrorHandling();

  // Fetch additional tour data with offline support
  const { 
    data: tourDetails, 
    loading, 
    error, 
    isFromCache 
  } = useOfflineAwareFetch<any>(
    `/api/tours/${tour.id}/details`,
    `tour_details_${tour.id}`
  );

  // Handle tour data loading errors
  if (error && !isFromCache) {
    handleError(error, {
      component: 'TourCard',
      action: 'load_tour_details',
      tourId: tour.id,
    });
  }

  return (
    <TourErrorBoundary>
      <div className="relative">
        {/* Online tour card */}
        <TourCard 
          tour={tour} 
          locale={locale} 
          priority={priority}
          additionalData={tourDetails}
          loading={loading}
          isFromCache={isFromCache}
        />
        
        {/* Offline fallback */}
        <NoScriptTourCard tour={{
          slug: tour.slug,
          title: tour.title[locale],
          description: tour.description[locale],
          price: tour.basePrice,
          duration: tour.duration,
          maxGroupSize: tour.maxGroupSize,
          image: tour.images[0]?.url || '/images/tours/default.jpg',
        }} />
        
        {/* Cache indicator for development */}
        {process.env.NODE_ENV === 'development' && isFromCache && (
          <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
            Cached
          </div>
        )}
      </div>
    </TourErrorBoundary>
  );
}

// Enhanced tour list with error handling
export function TourListWithErrorHandling({ 
  tours, 
  locale 
}: { 
  tours: Tour[]; 
  locale: Locale; 
}) {
  const { handleError } = useErrorHandling();

  return (
    <TourErrorBoundary>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour, index) => (
          <TourCardWithErrorHandling
            key={tour.id}
            tour={tour}
            locale={locale}
            priority={index < 3} // Prioritize first 3 tours
          />
        ))}
      </div>
      
      {/* NoScript fallback for tour list */}
      <noscript>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              JavaScript Required for Interactive Features
            </h3>
            <p className="text-blue-800 text-sm">
              For the best experience with tour browsing, booking, and interactive features, 
              please enable JavaScript. You can still view tour information below.
            </p>
          </div>
          
          {tours.map((tour) => (
            <NoScriptTourCard
              key={tour.id}
              tour={{
                slug: tour.slug,
                title: tour.title[locale],
                description: tour.description[locale],
                price: tour.basePrice,
                duration: tour.duration,
                maxGroupSize: tour.maxGroupSize,
                image: tour.images[0]?.url || '/images/tours/default.jpg',
              }}
            />
          ))}
        </div>
      </noscript>
    </TourErrorBoundary>
  );
}

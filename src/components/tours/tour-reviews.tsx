'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { RatingVisualization } from '@/components/ui/rating-visualization';
import { Testimonials } from '@/components/ui/testimonials';
import { TrustSignals } from '@/components/ui/trust-signals';
import type { Tour, Review } from '@/types';

interface TourReviewsProps {
  tour: Tour;
  locale: string;
}

export function TourReviews({ tour, locale }: TourReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(tour.reviews || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTourReviews() {
      if (!tour.id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?tourId=${tour.id}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || tour.reviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch tour reviews:', error);
        // Fallback to tour.reviews if API fails
        setReviews(tour.reviews || []);
      } finally {
        setLoading(false);
      }
    }

    fetchTourReviews();
  }, [tour.id, tour.reviews]);

  if (!loading && reviews.length === 0) {
    return null;
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Customer Reviews
        </h3>
        <TrustSignals tourId={tour.id} variant="compact" />
      </div>

      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <RatingVisualization
          tourId={tour.id}
          variant="detailed"
        />
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">What customers say</h4>
          <div className="text-sm text-gray-600">
            Based on {reviews.length} verified reviews from Google and TripAdvisor
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <Testimonials
        tourId={tour.id}
        limit={6}
        variant="grid"
        showPhotos={true}
      />

      {reviews.length > 6 && (
        <div className="text-center mt-8">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View all {reviews.length} reviews
          </button>
        </div>
      )}
    </div>
  );
}
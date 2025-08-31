'use client';

import { useEffect, useState } from 'react';
import * as m from '@/paraglide/messages';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { CountryFlag } from './country-flag';
import type { Review } from '@/types';

interface TestimonialsProps {
  tourId?: string;
  limit?: number;
  showPhotos?: boolean;
  variant?: 'grid' | 'carousel' | 'featured';
  className?: string;
}

export function Testimonials({ 
  tourId, 
  limit = 6, 
  showPhotos = true, 
  variant = 'grid',
  className = '' 
}: TestimonialsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const params = new URLSearchParams();
        if (tourId) params.set('tourId', tourId);
        params.set('limit', limit.toString());
        
        const response = await fetch(`/api/reviews?${params}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [tourId, limit]);

  if (loading) {
    return <TestimonialsSkeleton variant={variant} className={className} />;
  }

  if (reviews.length === 0) {
    return null;
  }

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

  const getSourceBadge = (source: Review['source']) => {
    const badges = {
      google: { label: 'Google', color: 'bg-red-500' },
      tripadvisor: { label: 'TripAdvisor', color: 'bg-green-500' },
      direct: { label: 'Direct', color: 'bg-blue-500' }
    };
    
    const badge = badges[source];
    return (
      <div className={`${badge.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
        {badge.label}
      </div>
    );
  };

  if (variant === 'featured') {
    const featuredReview = reviews[0];
    return (
      <Card className={`bg-gradient-to-br from-prague-50 to-gold-50 border-prague-200 ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <Quote className="w-8 h-8 text-prague-400" />
            <div>
              <h3 className="text-xl font-bold text-prague-900">Featured Review</h3>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(featuredReview.rating)}
                {getSourceBadge(featuredReview.source)}
              </div>
            </div>
          </div>
          
          <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
            "{featuredReview.comment}"
          </blockquote>
          
          <div className="flex items-center gap-3">
            {showPhotos && featuredReview.photos?.[0] && (
              <ResponsiveImage
                src={featuredReview.photos[0]}
                alt={`${featuredReview.customerName} profile`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {featuredReview.customerName}
                <CountryFlag
                  countryCode={featuredReview.country}
                  countryName={featuredReview.countryName}
                />
              </div>
              <div className="text-sm text-gray-500">
                {new Date(featuredReview.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="flex gap-4 pb-4" style={{ width: `${reviews.length * 320}px` }}>
          {reviews.map((review) => (
            <TestimonialCard 
              key={review.id} 
              review={review} 
              showPhotos={showPhotos}
              className="w-80 flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {reviews.map((review) => (
        <TestimonialCard 
          key={review.id} 
          review={review} 
          showPhotos={showPhotos}
        />
      ))}
    </div>
  );
}

interface TestimonialCardProps {
  review: Review;
  showPhotos?: boolean;
  className?: string;
}

function TestimonialCard({ review, showPhotos = true, className = '' }: TestimonialCardProps) {
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
    <Card className={`h-full hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {showPhotos && review.photos?.[0] ? (
              <ResponsiveImage
                src={review.photos[0]}
                alt={`${review.customerName} profile`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-prague-100 rounded-full flex items-center justify-center">
                <span className="text-prague-600 font-medium text-sm">
                  {review.customerName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {review.customerName}
                <CountryFlag
                  countryCode={review.country}
                  countryName={review.countryName}
                />
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          {review.verified && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          {renderStars(review.rating)}
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">
          "{review.comment}"
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{review.source} Review</span>
          {review.tourId !== 'general' && (
            <span>Tour: {review.tourId}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialsSkeleton({ variant, className }: { variant: string; className: string }) {
  const skeletonCount = variant === 'featured' ? 1 : 6;
  
  return (
    <div className={`${variant === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'flex gap-4'} ${className}`}>
      {Array.from({ length: skeletonCount }, (_, i) => (
        <Card key={i} className="h-full">
          <CardContent className="p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

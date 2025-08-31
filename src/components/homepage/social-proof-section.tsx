'use client';

import { useEffect, useState } from 'react';
import * as m from '@/paraglide/messages';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { TrustSignals } from '@/components/ui/trust-signals';
import { RatingVisualization } from '@/components/ui/rating-visualization';
import { Testimonials } from '@/components/ui/testimonials';
import type { Review } from '@/types';
import type { ReviewStats } from '@/lib/review-aggregation';

// Fallback review data for when API is unavailable
const fallbackReviews: Review[] = [
  {
    id: '1',
    tourId: 'prague-castle-stories',
    customerName: 'Sarah M.',
    rating: 5,
    comment: 'Filip brought Prague\'s history to life with incredible stories. The castle tour was absolutely magical!',
    date: new Date('2024-01-15'),
    source: 'google',
    verified: true,
    photos: ['/images/reviews/sarah-m.jpg']
  },
  {
    id: '2',
    tourId: 'old-town-mysteries',
    customerName: 'Michael K.',
    rating: 5,
    comment: 'Best tour guide in Prague! Filip\'s passion for storytelling made every corner of Old Town fascinating.',
    date: new Date('2024-01-10'),
    source: 'tripadvisor',
    verified: true,
    photos: ['/images/reviews/michael-k.jpg']
  },
  {
    id: '3',
    tourId: 'jewish-quarter-heritage',
    customerName: 'Emma L.',
    rating: 5,
    comment: 'A deeply moving and educational experience. Filip handled the sensitive history with great respect and knowledge.',
    date: new Date('2024-01-08'),
    source: 'google',
    verified: true,
    photos: ['/images/reviews/emma-l.jpg']
  },
  {
    id: '4',
    tourId: 'charles-bridge-tales',
    customerName: 'David R.',
    rating: 5,
    comment: 'Filip\'s stories about the saints on Charles Bridge were captivating. Highly recommend!',
    date: new Date('2024-01-05'),
    source: 'direct',
    verified: true,
    photos: ['/images/reviews/david-r.jpg']
  },
  {
    id: '5',
    tourId: 'prague-castle-stories',
    customerName: 'Lisa T.',
    rating: 5,
    comment: 'Amazing tour! Filip\'s English is perfect and his knowledge of Prague is incredible.',
    date: new Date('2024-01-03'),
    source: 'google',
    verified: true,
    photos: ['/images/reviews/lisa-t.jpg']
  },
  {
    id: '6',
    tourId: 'old-town-mysteries',
    customerName: 'Thomas B.',
    rating: 5,
    comment: 'Fantastic storytelling and great insights into Prague\'s hidden gems. Worth every euro!',
    date: new Date('2024-01-01'),
    source: 'tripadvisor',
    verified: true,
    photos: ['/images/reviews/thomas-b.jpg']
  }
];

const fallbackStats = {
  totalReviews: 247,
  averageRating: 4.9,
  yearsExperience: 12,
  toursCompleted: 1500,
  repeatCustomers: 85
};

export function SocialProofSection() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/reviews/trust-signals');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch review stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const displayStats = stats || {
    totalReviews: fallbackStats.totalReviews,
    averageRating: fallbackStats.averageRating,
    verifiedReviewsCount: fallbackStats.totalReviews
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            {m['homepage.socialProof.title']()}
          </h2>
          <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto mb-8">
            {m['homepage.socialProof.subtitle']()}
          </p>

          {/* Trust Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">
                {loading ? '...' : `${displayStats.averageRating}★`}
              </div>
              <div className="text-sm md:text-base text-stone-600">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">
                {loading ? '...' : `${displayStats.totalReviews}+`}
              </div>
              <div className="text-sm md:text-base text-stone-600">
                Happy Travelers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">
                {fallbackStats.yearsExperience}+
              </div>
              <div className="text-sm md:text-base text-stone-600">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">
                {fallbackStats.toursCompleted}+
              </div>
              <div className="text-sm md:text-base text-stone-600">
                Tours Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-prague-600 mb-1">
                {loading ? '...' : `${stats?.verifiedReviewsCount || fallbackStats.totalReviews}`}
              </div>
              <div className="text-sm md:text-base text-stone-600">
                Verified Reviews
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mb-8">
          <TrustSignals variant="full" className="max-w-md mx-auto" />
        </div>

        {/* Reviews Grid - Now using new Testimonials component */}
        <Testimonials
          limit={6}
          variant="grid"
          showPhotos={true}
          className="mb-12"
        />

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-stone-900">Licensed Guide</div>
              <div className="text-sm text-stone-600">Official Prague Tourism</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-stone-900">Secure Booking</div>
              <div className="text-sm text-stone-600">SSL Protected</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-stone-900">85% Return Rate</div>
              <div className="text-sm text-stone-600">Customers book again</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-stone-900">Free Cancellation</div>
              <div className="text-sm text-stone-600">Up to 24h before</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
  };

  const getSourceIcon = (source: Review['source']) => {
    switch (source) {
      case 'google':
        return (
          <div className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
            G
          </div>
        );
      case 'tripadvisor':
        return (
          <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
            T
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 bg-prague-500 rounded text-white text-xs flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card className="h-full hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Header with customer info and rating */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {review.photos?.[0] ? (
              <ResponsiveImage
                src={review.photos[0]}
                alt={`${review.customerName} profile`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                <span className="text-stone-600 font-medium text-sm">
                  {review.customerName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold text-stone-900">{review.customerName}</div>
              <div className="text-sm text-stone-500">{formatDate(review.date)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSourceIcon(review.source)}
            {review.verified && (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'text-gold-400 fill-current' : 'text-stone-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Review comment */}
        <p className="text-stone-700 leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
}
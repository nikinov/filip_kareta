'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReviewStats } from '@/lib/review-aggregation';

interface RatingVisualizationProps {
  tourId?: string;
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function RatingVisualization({ 
  tourId, 
  className = '', 
  variant = 'compact' 
}: RatingVisualizationProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams();
        if (tourId) params.set('tourId', tourId);
        
        const response = await fetch(`/api/reviews/trust-signals?${params}`);
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
  }, [tourId]);

  if (loading) {
    return <RatingVisualizationSkeleton variant={variant} className={className} />;
  }

  if (!stats || stats.totalReviews === 0) {
    return null;
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1">
          {renderStars(stats.averageRating)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{stats.averageRating}</span>
          <span className="mx-1">•</span>
          <span>{stats.totalReviews} reviews</span>
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageRating}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {renderStars(stats.averageRating, 'lg')}
            </div>
            <div className="text-sm text-gray-500">
              {stats.totalReviews} reviews
            </div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {stats.verifiedReviewsCount}
            </div>
            <div className="text-sm text-gray-500">Verified Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {stats.recentReviewsCount}
            </div>
            <div className="text-sm text-gray-500">Recent Reviews</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingVisualizationSkeleton({ 
  variant, 
  className 
}: { 
  variant: string; 
  className: string; 
}) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 animate-pulse ${className}`}>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </CardHeader>
      <CardContent className="animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

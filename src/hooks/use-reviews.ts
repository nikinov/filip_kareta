'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Review } from '@/types';
import type { ReviewStats, TrustSignal } from '@/lib/review-aggregation';

interface UseReviewsOptions {
  tourId?: string;
  source?: 'google' | 'tripadvisor' | 'all';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  trustSignals: TrustSignal[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export function useReviews({
  tourId,
  source = 'all',
  limit = 10,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseReviewsOptions = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [trustSignals, setTrustSignals] = useState<TrustSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (tourId) params.set('tourId', tourId);
      if (source !== 'all') params.set('source', source);
      params.set('limit', limit.toString());

      const [reviewsResponse, trustResponse] = await Promise.all([
        fetch(`/api/reviews?${params}`),
        fetch(`/api/reviews/trust-signals?${tourId ? `tourId=${tourId}` : ''}`)
      ]);

      if (!reviewsResponse.ok || !trustResponse.ok) {
        throw new Error('Failed to fetch review data');
      }

      const [reviewsData, trustData] = await Promise.all([
        reviewsResponse.json(),
        trustResponse.json()
      ]);

      if (reviewsData.success) {
        setReviews(reviewsData.reviews || []);
      }

      if (trustData.success) {
        setStats(trustData.stats);
        setTrustSignals(trustData.signals || []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [tourId, source, limit]);

  const clearCache = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (tourId) params.set('tourId', tourId);
      if (source !== 'all') params.set('source', source);
      params.set('cache', 'false');

      await fetch(`/api/reviews?${params}`);
      await fetchReviews();
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, [tourId, source, fetchReviews]);

  const refresh = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  // Initial fetch
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchReviews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchReviews]);

  return {
    reviews,
    stats,
    trustSignals,
    loading,
    error,
    refresh,
    clearCache
  };
}

// Specialized hook for homepage social proof
export function useHomepageReviews() {
  return useReviews({
    limit: 6,
    autoRefresh: true,
    refreshInterval: 600000 // 10 minutes
  });
}

// Specialized hook for tour-specific reviews
export function useTourReviews(tourId: string) {
  return useReviews({
    tourId,
    limit: 10,
    autoRefresh: false
  });
}

import type { Review } from '@/types';

// In-memory cache for development (in production, use Redis or similar)
const reviewCache = new Map<string, {
  reviews: Review[];
  timestamp: number;
  expiresAt: number;
}>();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recentReviewsCount: number; // Reviews in last 30 days
  verifiedReviewsCount: number;
}

export function aggregateReviews(reviews: Review[]): Review[] {
  // Remove duplicates based on content similarity
  const uniqueReviews = removeDuplicateReviews(reviews);
  
  // Sort by date (newest first) and rating (highest first for same date)
  return uniqueReviews.sort((a, b) => {
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return b.rating - a.rating;
  });
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {},
      recentReviewsCount: 0,
      verifiedReviewsCount: 0
    };
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {} as Record<number, number>);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentReviewsCount = reviews.filter(
    review => new Date(review.date) >= thirtyDaysAgo
  ).length;

  const verifiedReviewsCount = reviews.filter(review => review.verified).length;

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution,
    recentReviewsCount,
    verifiedReviewsCount
  };
}

export async function cacheReviews(
  tourId: string | null, 
  source: string | null, 
  reviews: Review[]
): Promise<void> {
  const cacheKey = getCacheKey(tourId, source);
  const now = Date.now();
  
  reviewCache.set(cacheKey, {
    reviews,
    timestamp: now,
    expiresAt: now + CACHE_DURATION
  });
}

export async function getCachedReviews(
  tourId: string | null, 
  source: string | null
): Promise<Review[] | null> {
  const cacheKey = getCacheKey(tourId, source);
  const cached = reviewCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache has expired
  if (Date.now() > cached.expiresAt) {
    reviewCache.delete(cacheKey);
    return null;
  }
  
  return cached.reviews;
}

export function clearReviewCache(tourId?: string | null, source?: string | null): void {
  if (tourId || source) {
    const cacheKey = getCacheKey(tourId, source);
    reviewCache.delete(cacheKey);
  } else {
    // Clear all cache
    reviewCache.clear();
  }
}

function getCacheKey(tourId: string | null, source: string | null): string {
  return `reviews:${tourId || 'all'}:${source || 'all'}`;
}

function removeDuplicateReviews(reviews: Review[]): Review[] {
  const seen = new Set<string>();
  const uniqueReviews: Review[] = [];
  
  for (const review of reviews) {
    // Create a signature based on customer name, rating, and first 50 chars of comment
    const signature = `${review.customerName}-${review.rating}-${review.comment.substring(0, 50)}`;
    
    if (!seen.has(signature)) {
      seen.add(signature);
      uniqueReviews.push(review);
    }
  }
  
  return uniqueReviews;
}

// Trust signals and recent activity simulation
export interface TrustSignal {
  type: 'recent_booking' | 'review_count' | 'rating_badge' | 'verification';
  message: string;
  timestamp?: Date | string;
  priority: 'high' | 'medium' | 'low';
}

export function generateTrustSignals(reviews: Review[]): TrustSignal[] {
  const stats = calculateReviewStats(reviews);
  const signals: TrustSignal[] = [];

  // Recent booking notifications (simulated)
  const recentBookings = Math.floor(Math.random() * 5) + 1;
  signals.push({
    type: 'recent_booking',
    message: `${recentBookings} people booked this tour in the last 24 hours`,
    timestamp: new Date(),
    priority: 'high'
  });

  // Review count badge
  if (stats.totalReviews > 0) {
    signals.push({
      type: 'review_count',
      message: `${stats.totalReviews} verified reviews`,
      priority: 'medium'
    });
  }

  // High rating badge
  if (stats.averageRating >= 4.5) {
    signals.push({
      type: 'rating_badge',
      message: `${stats.averageRating}★ average rating`,
      priority: 'high'
    });
  }

  // Verification badge
  if (stats.verifiedReviewsCount > 0) {
    signals.push({
      type: 'verification',
      message: `${stats.verifiedReviewsCount} verified customer reviews`,
      priority: 'medium'
    });
  }

  return signals.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

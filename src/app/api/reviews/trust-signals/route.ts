import { NextRequest, NextResponse } from 'next/server';
import { getMockReviews } from '@/lib/review-providers';
import { generateTrustSignals, calculateReviewStats } from '@/lib/review-aggregation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');

    // Always use mock reviews for now
    const reviews = getMockReviews(tourId);

    const trustSignals = generateTrustSignals(reviews);
    const stats = calculateReviewStats(reviews);

    return NextResponse.json({
      success: true,
      signals: trustSignals,
      stats,
      reviewCount: reviews.length
    });

  } catch (error) {
    console.error('Trust signals API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate trust signals',
        signals: [],
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {},
          recentReviewsCount: 0,
          verifiedReviewsCount: 0
        }
      },
      { status: 500 }
    );
  }
}

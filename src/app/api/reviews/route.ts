import { NextRequest, NextResponse } from 'next/server';
import { getMockReviews } from '@/lib/review-providers';
import { aggregateReviews } from '@/lib/review-aggregation';
import type { Review } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Always use mock reviews for now
    const reviews = getMockReviews(tourId);

    // Aggregate and sort reviews
    const aggregatedReviews = aggregateReviews(reviews);

    return NextResponse.json({
      success: true,
      reviews: aggregatedReviews.slice(0, limit),
      cached: false,
      totalCount: aggregatedReviews.length
    });

  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        reviews: []
      },
      { status: 500 }
    );
  }
}
import { getAllReviewsForModeration, getModerationStats, getPendingReviews, getReviewsByStatus } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const includeStats = searchParams.get('stats') === 'true';

    let reviews;
    let stats = null;

    if (status === 'pending') {
      reviews = getPendingReviews();
    } else if (status === 'approved' || status === 'rejected' || status === 'deleted') {
      reviews = getReviewsByStatus(status as 'pending' | 'approved' | 'rejected' | 'deleted');
    } else {
      reviews = getAllReviewsForModeration();
    }

    if (includeStats) {
      stats = getModerationStats();
    }

    return NextResponse.json({ 
      reviews,
      stats,
      filters: { status },
      totalReviews: reviews.reduce((sum, product) => sum + product.reviews.length, 0)
    });
  } catch (error) {
    console.error('Error fetching reviews for moderation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews for moderation' },
      { status: 500 }
    );
  }
} 
import { getAllReviewsForModeration, getPendingReviews } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let reviews;
    if (status === 'pending') {
      reviews = getPendingReviews();
    } else {
      reviews = getAllReviewsForModeration();
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews for moderation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews for moderation' },
      { status: 500 }
    );
  }
} 
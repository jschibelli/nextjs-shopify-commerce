import { deleteReview } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, reviewId } = body;

    if (!productId || !reviewId) {
      return NextResponse.json(
        { error: 'Missing productId or reviewId' },
        { status: 400 }
      );
    }

    const success = deleteReview(productId, reviewId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Review deleted' });
    } else {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 
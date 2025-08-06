import { rejectReview } from 'lib/shopify/yotpo-reviews';
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

    const success = rejectReview(productId, reviewId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Review rejected' });
    } else {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error rejecting review:', error);
    return NextResponse.json(
      { error: 'Failed to reject review' },
      { status: 500 }
    );
  }
} 
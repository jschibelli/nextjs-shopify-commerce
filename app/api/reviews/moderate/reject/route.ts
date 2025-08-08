import { rejectReview } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, reviewId, moderator = 'admin', notes } = body;

    if (!productId || !reviewId) {
      return NextResponse.json(
        { error: 'Missing productId or reviewId' },
        { status: 400 }
      );
    }

    const success = rejectReview(productId, reviewId, moderator, notes);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Review rejected',
        data: { productId, reviewId, moderator, notes }
      });
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
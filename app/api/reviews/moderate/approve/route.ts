import { approveReview } from 'lib/shopify/yotpo-reviews';
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

    const success = approveReview(productId, reviewId);

    if (success) {
      return NextResponse.json({ success: true, message: 'Review approved' });
    } else {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { error: 'Failed to approve review' },
      { status: 500 }
    );
  }
} 
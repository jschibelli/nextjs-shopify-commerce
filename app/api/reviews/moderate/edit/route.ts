import { editReview } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, reviewId, updates } = body;

    if (!productId || !reviewId || !updates) {
      return NextResponse.json(
        { error: 'Missing productId, reviewId, or updates' },
        { status: 400 }
      );
    }

    const success = editReview(productId, reviewId, updates);

    if (success) {
      return NextResponse.json({ success: true, message: 'Review updated' });
    } else {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error editing review:', error);
    return NextResponse.json(
      { error: 'Failed to edit review' },
      { status: 500 }
    );
  }
} 
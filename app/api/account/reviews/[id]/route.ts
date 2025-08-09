import { getAuth } from 'lib/auth';
import { deleteReview, editReview, getAllReviewsForModeration } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuth();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, title, content, rating } = body;

    // Verify the review belongs to the current user
    const allReviews = getAllReviewsForModeration();
    const userReview = allReviews
      .flatMap(({ productId: pid, reviews }) => 
        reviews.map(review => ({ ...review, productId: pid }))
      )
      .find(review => 
        review.id.toString() === id && 
        review.reviewer_email === user.email
      );

    if (!userReview) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow editing if review is pending or approved
    if (userReview.status === 'rejected' || userReview.status === 'deleted') {
      return NextResponse.json(
        { error: 'Cannot edit rejected or deleted reviews' },
        { status: 400 }
      );
    }

    const success = editReview(
      productId,
      parseInt(id),
      { title, content, rating },
      user.email,
      'Customer edited their own review'
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuth();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the review and verify ownership
    const allReviews = getAllReviewsForModeration();
    const userReview = allReviews
      .flatMap(({ productId, reviews }) => 
        reviews.map(review => ({ ...review, productId }))
      )
      .find(review => 
        review.id.toString() === id && 
        review.reviewer_email === user.email
      );

    if (!userReview) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow deletion if review is pending
    if (userReview.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending reviews' },
        { status: 400 }
      );
    }

    const success = deleteReview(
      userReview.productId,
      parseInt(id),
      user.email,
      'Customer deleted their own review'
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
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
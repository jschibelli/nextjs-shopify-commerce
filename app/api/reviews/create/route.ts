import { getAuth } from 'lib/auth';
import { createProductReviewYotpo } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = getAuth();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, title, content, rating, authorName, authorEmail } = body;

    // Validate required fields
    if (!productId || !content || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Use authenticated user's information
    const userFullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const finalAuthorName = authorName || userFullName || 'Anonymous';
    const finalAuthorEmail = authorEmail || user.email;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalAuthorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const yotpoReview = await createProductReviewYotpo({
      productId,
      title: title || '',
      content,
      rating,
      authorName: finalAuthorName,
      authorEmail: finalAuthorEmail
    });

    // Convert Yotpo review to ProductReview format
    const review = {
      id: yotpoReview.id.toString(),
      title: yotpoReview.title || '',
      content: yotpoReview.content,
      rating: yotpoReview.rating,
      author: {
        name: yotpoReview.reviewer_name,
        email: yotpoReview.reviewer_email
      },
      createdAt: yotpoReview.created_at,
      updatedAt: yotpoReview.updated_at,
      status: yotpoReview.status
    };

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 
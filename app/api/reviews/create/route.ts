import { createProductReviewYotpo } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, title, content, rating, authorName, authorEmail } = body;

    // Validate required fields
    if (!productId || !content || !rating || !authorName || !authorEmail) {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
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
      authorName,
      authorEmail
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
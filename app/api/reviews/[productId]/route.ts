import { debugStorage, getProductReviewStatsYotpo, getProductReviewsYotpo } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '10');
    const after = searchParams.get('after') || undefined;

    // Await params and decode the product ID from URL
    const { productId } = await params;
    const decodedProductId = decodeURIComponent(productId);

    console.log('API Debug - Fetching reviews for product:', decodedProductId);
    
    // Debug storage
    debugStorage();

    // Get reviews from Yotpo API
    const yotpoReviews = await getProductReviewsYotpo(decodedProductId);
    const stats = await getProductReviewStatsYotpo(decodedProductId);

    console.log('API Debug - Yotpo reviews received:', yotpoReviews.length);
    console.log('API Debug - Yotpo reviews:', yotpoReviews);

    // Convert Yotpo reviews to ProductReview format
    const reviews = yotpoReviews.map(yotpoReview => ({
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
    }));

    console.log('API Debug - Converted reviews:', reviews.length);
    console.log('API Debug - Converted reviews:', reviews);

    // Apply pagination
    const startIndex = after ? parseInt(after) : 0;
    const endIndex = startIndex + first;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    const pageInfo = {
      hasNextPage: endIndex < reviews.length,
      hasPreviousPage: startIndex > 0,
      startCursor: startIndex.toString(),
      endCursor: endIndex.toString()
    };

    const response = {
      reviews: paginatedReviews,
      pageInfo,
      stats
    };

    console.log('API Debug - Final response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 
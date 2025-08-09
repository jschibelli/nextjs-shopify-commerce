import { debugStorage, getProductReviewStatsPublic, getProductReviewStatsYotpo, getProductReviewsYotpo } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '10');
    const after = searchParams.get('after') || undefined;
    const includeAll = searchParams.get('includeAll') === 'true'; // For admin use

    // Await params and decode the product ID from URL
    const { productId } = await params;
    const decodedProductId = decodeURIComponent(productId);

    console.log('API Debug - Fetching reviews for product:', decodedProductId);
    console.log('API Debug - Include all reviews (admin mode):', includeAll);
    
    // Debug storage
    debugStorage();

    // Get reviews from Yotpo API
    const yotpoReviews = await getProductReviewsYotpo(decodedProductId);
    
    // Get stats based on access level
    let stats;
    if (includeAll) {
      // For admin, use full stats including all review statuses
      stats = await getProductReviewStatsYotpo(decodedProductId);
    } else {
      // For public display, use stats for approved reviews only
      stats = await getProductReviewStatsPublic(decodedProductId);
    }

    console.log('API Debug - Yotpo reviews received:', yotpoReviews.length);
    console.log('API Debug - Yotpo reviews:', yotpoReviews);

    // Filter reviews based on access level
    let filteredReviews = yotpoReviews;
    if (!includeAll) {
      // For public display, only show approved reviews
      filteredReviews = yotpoReviews.filter(review => review.status === 'approved');
      console.log('API Debug - Filtered to approved reviews only:', filteredReviews.length);
    } else {
      console.log('API Debug - Including all review statuses (admin mode)');
    }

    // Convert Yotpo reviews to ProductReview format
    const reviews = filteredReviews.map(yotpoReview => ({
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
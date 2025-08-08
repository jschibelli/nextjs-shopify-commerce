import { getAuth } from 'lib/auth';
import { getProductById } from 'lib/shopify';
import { getAllReviewsForModeration } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    const user = await auth.getCurrentUser();

    console.log('API Debug - User authentication check:', { 
      user: user ? { email: user.email, id: user.id } : null 
    });

    if (!user) {
      console.log('API Debug - No user found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const allReviews = getAllReviewsForModeration();
    console.log('API Debug - All reviews from moderation:', allReviews.length, 'products');

    // Debug: Log all reviews to see what exists
    console.log('API Debug - All reviews in system:');
    try {
      for (const [productId, reviews] of global.reviewStorage.entries()) {
        console.log('API Debug - Product:', productId, 'Reviews:', reviews.map(r => ({
          id: r.id,
          email: r.reviewer_email,
          status: r.status,
          title: r.title
        })));
      }
    } catch (error) {
      console.log('API Debug - Error accessing global storage:', error);
    }

    const userReviews: any[] = [];

    // Filter reviews to only include those by the current user
    for (const { productId, reviews } of allReviews) {
      console.log('API Debug - Checking product:', productId, 'with', reviews.length, 'reviews');
      
      const userProductReviews = reviews.filter(
        (review: any) => {
          const matches = review.reviewer_email === user.email;
          console.log('API Debug - Review email check:', {
            reviewEmail: review.reviewer_email,
            userEmail: user.email,
            matches
          });
          return matches;
        }
      );
      
      console.log('API Debug - User reviews for product:', userProductReviews.length);
      
      if (userProductReviews.length > 0) {
        // Try to get product information
        let productInfo = null;
        try {
          const product = await getProductById(productId);
          if (product) {
            productInfo = {
              id: product.id,
              title: product.title,
              handle: product.handle,
              featuredImage: product.featuredImage?.url,
              price: product.priceRange?.minVariantPrice?.amount
            };
            console.log('API Debug - Product info fetched:', productInfo.title);
          } else {
            // Fallback if product not found
            productInfo = {
              id: productId,
              title: `Product ${productId.split('/').pop()}`,
              handle: productId.split('/').pop() || productId,
              featuredImage: null,
              price: null
            };
            console.log('API Debug - Using fallback product info');
          }
        } catch (error) {
          console.log('Could not fetch product info for:', productId, error);
          // Fallback if error
          productInfo = {
            id: productId,
            title: `Product ${productId.split('/').pop()}`,
            handle: productId.split('/').pop() || productId,
            featuredImage: null,
            price: null
          };
        }

        userReviews.push({
          productId,
          productInfo,
          reviews: userProductReviews.map((review: any) => ({
            id: review.id,
            title: review.title,
            content: review.content,
            rating: review.rating,
            status: review.status,
            created_at: review.created_at,
            updated_at: review.updated_at,
            moderated_by: review.moderated_by,
            moderated_at: review.moderated_at,
            moderation_notes: review.moderation_notes
          }))
        });
      }
    }

    console.log('API Debug - Final user reviews:', userReviews.length, 'products');

    return NextResponse.json({
      reviews: userReviews,
      totalReviews: userReviews.reduce((sum, product) => sum + product.reviews.length, 0)
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reviews' },
      { status: 500 }
    );
  }
} 
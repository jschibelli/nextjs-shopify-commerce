import { ProductReview, ReviewStats } from './types';

export async function getProductReviewsClient(
  productId: string,
  first: number = 10,
  after?: string
): Promise<{ reviews: ProductReview[]; pageInfo: any }> {
  try {
    const response = await fetch(`/api/reviews/${encodeURIComponent(productId)}?first=${first}${after ? `&after=${after}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], pageInfo: {} };
  }
}

export async function getProductReviewStatsClient(productId: string): Promise<ReviewStats> {
  try {
    const response = await fetch(`/api/reviews/${encodeURIComponent(productId)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch review stats');
    }
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
}

export async function createProductReviewClient(reviewData: {
  productId: string;
  title: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail: string;
}): Promise<ProductReview> {
  try {
    const response = await fetch('/api/reviews/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
} 
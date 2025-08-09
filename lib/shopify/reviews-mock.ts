import { ProductReview, ReviewStats } from './types';

// In-memory storage for mock reviews
const mockReviews = new Map<string, ProductReview[]>();

export async function getProductReviewsMock(
  productId: string,
  first: number = 10,
  after?: string
): Promise<{ reviews: ProductReview[]; pageInfo: any }> {
  const reviews = mockReviews.get(productId) || [];
  return { 
    reviews: reviews.slice(0, first), 
    pageInfo: { hasNextPage: false, hasPreviousPage: false } 
  };
}

export async function getProductReviewStatsMock(productId: string): Promise<ReviewStats> {
  const reviews = mockReviews.get(productId) || [];
  const approvedReviews = reviews.filter(review => review.status === 'APPROVED');
  
  const totalReviews = approvedReviews.length;
  const averageRating = totalReviews > 0 
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  approvedReviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    }
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution
  };
}

export async function createProductReviewMock({
  productId,
  title,
  content,
  rating,
  authorName,
  authorEmail
}: {
  productId: string;
  title: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail: string;
}): Promise<ProductReview> {
  const newReview: ProductReview = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    content,
    rating,
    author: {
      name: authorName,
      email: authorEmail
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'APPROVED'
  };

  const existingReviews = mockReviews.get(productId) || [];
  mockReviews.set(productId, [...existingReviews, newReview]);

  return newReview;
}

export async function updateProductReviewMock({
  id,
  title,
  content,
  rating
}: {
  id: string;
  title?: string;
  content?: string;
  rating?: number;
}): Promise<ProductReview> {
  // Find and update the review in all products
  for (const [productId, reviews] of mockReviews.entries()) {
    const reviewIndex = reviews.findIndex(review => review.id === id);
    if (reviewIndex !== -1) {
      const existingReview = reviews[reviewIndex];
      if (!existingReview) {
        throw new Error('Review not found');
      }
      const updatedReview: ProductReview = {
        id: existingReview.id,
        title: title || existingReview.title,
        content: content || existingReview.content,
        rating: rating || existingReview.rating,
        author: existingReview.author,
        createdAt: existingReview.createdAt,
        updatedAt: new Date().toISOString(),
        status: existingReview.status
      };
      reviews[reviewIndex] = updatedReview;
      mockReviews.set(productId, reviews);
      return updatedReview;
    }
  }
  
  throw new Error('Review not found');
}

export async function deleteProductReviewMock(id: string): Promise<void> {
  // Find and delete the review from all products
  for (const [productId, reviews] of mockReviews.entries()) {
    const reviewIndex = reviews.findIndex(review => review.id === id);
    if (reviewIndex !== -1) {
      reviews.splice(reviewIndex, 1);
      mockReviews.set(productId, reviews);
      return;
    }
  }
  
  throw new Error('Review not found');
} 
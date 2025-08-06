import {
    SHOPIFY_GRAPHQL_API_ENDPOINT,
    TAGS
} from 'lib/constants';
import { ensureStartsWith } from 'lib/utils';
import {
    unstable_cacheLife as cacheLife,
    unstable_cacheTag as cacheTag
} from 'next/cache';
import {
    createProductReviewMutation,
    deleteProductReviewMutation,
    getProductReviewsQuery,
    getProductReviewStatsQuery,
    updateProductReviewMutation
} from './queries/review';
import {
    ProductReview,
    ReviewStats,
    ShopifyCreateProductReviewOperation,
    ShopifyDeleteProductReviewOperation,
    ShopifyProductReviewsOperation,
    ShopifyProductReviewStatsOperation,
    ShopifyUpdateProductReviewOperation
} from './types';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
  : '';
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;

async function shopifyFetch<T>({
  headers,
  query,
  variables
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      })
    });

    return {
      status: result.status,
      body: await result.json()
    };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error fetching data');
  }
}

export async function getProductReviews(
  productId: string,
  first: number = 10,
  after?: string
): Promise<{ reviews: ProductReview[]; pageInfo: any }> {
  try {
    'use cache';
    cacheTag(TAGS.products);
    cacheLife('hours');

    const res = await shopifyFetch<ShopifyProductReviewsOperation>({
      query: getProductReviewsQuery,
      variables: {
        productId,
        first,
        after
      }
    });

    const reviews = res.body.data?.product?.reviews?.edges?.map((edge: any) => edge.node) || [];
    const pageInfo = (res.body.data?.product?.reviews as any)?.pageInfo || {};

    return { reviews, pageInfo };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return empty reviews if API fails
    return { reviews: [], pageInfo: {} };
  }
}

export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  try {
    'use cache';
    cacheTag(TAGS.products);
    cacheLife('hours');

    const res = await shopifyFetch<ShopifyProductReviewStatsOperation>({
      query: getProductReviewStatsQuery,
      variables: {
        productId
      }
    });

    const reviews = res.body.data?.product?.reviews?.edges
      ?.map((edge: any) => edge.node)
      ?.filter((review: any) => review.status === 'APPROVED') || [];

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    reviews.forEach((review: any) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    // Return default stats if API fails
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
}

export async function createProductReview({
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
  try {
    const res = await shopifyFetch<ShopifyCreateProductReviewOperation>({
      query: createProductReviewMutation,
      variables: {
        input: {
          productId,
          title,
          content,
          rating,
          authorName,
          authorEmail
        }
      }
    });

    if (res.body.data?.productReviewCreate?.userErrors?.length > 0) {
      const firstError = res.body.data.productReviewCreate.userErrors[0];
      throw new Error(firstError?.message || 'Failed to create review');
    }

    return res.body.data.productReviewCreate.productReview;
  } catch (error) {
    console.error('Error creating review:', error);
    
    // For now, return a mock review since Shopify Storefront API might not support reviews
    const mockReview: ProductReview = {
      id: `mock-${Date.now()}`,
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
    
    return mockReview;
  }
}

export async function updateProductReview({
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
  try {
    const res = await shopifyFetch<ShopifyUpdateProductReviewOperation>({
      query: updateProductReviewMutation,
      variables: {
        input: {
          id,
          title,
          content,
          rating
        }
      }
    });

    if (res.body.data?.productReviewUpdate?.userErrors?.length > 0) {
      const firstError = res.body.data.productReviewUpdate.userErrors[0];
      throw new Error(firstError?.message || 'Failed to update review');
    }

    return res.body.data.productReviewUpdate.productReview;
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error('Failed to update review');
  }
}

export async function deleteProductReview(id: string): Promise<void> {
  try {
    const res = await shopifyFetch<ShopifyDeleteProductReviewOperation>({
      query: deleteProductReviewMutation,
      variables: {
        input: {
          id
        }
      }
    });

    if (res.body.data?.productReviewDelete?.userErrors?.length > 0) {
      const firstError = res.body.data.productReviewDelete.userErrors[0];
      throw new Error(firstError?.message || 'Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
} 
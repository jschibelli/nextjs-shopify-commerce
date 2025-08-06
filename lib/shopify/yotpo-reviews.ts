// Yotpo Reviews Integration
// This is an alternative to Shopify Admin API for product reviews

const YOTPO_APP_KEY = process.env.YOTPO_APP_KEY;
const YOTPO_SECRET_KEY = process.env.YOTPO_SECRET_KEY;

// Global in-memory storage for reviews during development
// Using a global variable to ensure persistence across API calls
declare global {
  var reviewStorage: Map<string, YotpoReview[]>;
}

// Initialize global storage if it doesn't exist
if (!global.reviewStorage) {
  global.reviewStorage = new Map<string, YotpoReview[]>();
}

// File-based storage as backup
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const STORAGE_FILE = join(process.cwd(), '.reviews-storage.json');

// Load stored reviews from file
function loadStoredReviewsFromFile(): Map<string, YotpoReview[]> {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.log('Yotpo Debug - Error loading reviews from file:', error);
  }
  return new Map();
}

// Save stored reviews to file
function saveStoredReviewsToFile(): void {
  try {
    const data = Object.fromEntries(global.reviewStorage);
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    console.log('Yotpo Debug - Saved reviews to file');
  } catch (error) {
    console.log('Yotpo Debug - Error saving reviews to file:', error);
  }
}

// Initialize storage from file
if (global.reviewStorage.size === 0) {
  const fileStorage = loadStoredReviewsFromFile();
  global.reviewStorage = fileStorage;
  console.log('Yotpo Debug - Loaded reviews from file:', global.reviewStorage.size, 'products');
}

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Yotpo Debug - APP_KEY:', YOTPO_APP_KEY ? 'SET' : 'NOT SET');
  console.log('Yotpo Debug - SECRET_KEY:', YOTPO_SECRET_KEY ? 'SET' : 'NOT SET');
  console.log('Yotpo Debug - STORE_DOMAIN:', process.env.SHOPIFY_STORE_DOMAIN);
}

export interface YotpoReview {
  id: number;
  product_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface YotpoReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export async function getProductReviewsYotpo(productId: string): Promise<YotpoReview[]> {
  if (!YOTPO_APP_KEY || !YOTPO_SECRET_KEY) {
    console.warn('Yotpo credentials not configured, returning stored reviews');
    return getStoredReviews(productId);
  }

  try {
    // Extract just the numeric product ID from the Shopify GID
    const numericProductId = productId.replace('gid://shopify/Product/', '');
    console.log('Yotpo Debug - Original product ID:', productId);
    console.log('Yotpo Debug - Numeric product ID:', numericProductId);
    
    // Use the correct Yotpo API endpoint for fetching reviews
    // Based on Yotpo API documentation: https://developers.yotpo.com/reference
    const url = `https://api.yotpo.com/v1/widget/${YOTPO_APP_KEY}/products/${numericProductId}/reviews`;
    console.log('Yotpo Debug - Fetching reviews from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Yotpo Debug - Response status:', response.status);
    console.log('Yotpo Debug - Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Yotpo Debug - Error response:', errorText);
      console.log('Yotpo API not available, using stored reviews');
      return getStoredReviews(productId);
    }
    
    const data = await response.json();
    console.log('Yotpo Debug - Response data:', data);
    
    // Combine API reviews with stored reviews
    const apiReviews = data.response?.reviews || [];
    const storedReviews = getStoredReviews(productId);
    const allReviews = [...storedReviews, ...apiReviews];
    
    console.log('Yotpo Debug - Combined reviews:', {
      apiReviews: apiReviews.length,
      storedReviews: storedReviews.length,
      totalReviews: allReviews.length
    });
    
    return allReviews;
  } catch (error) {
    console.log('Yotpo Debug - Fetch error:', error);
    console.log('Yotpo API not available, using stored reviews');
    return getStoredReviews(productId);
  }
}

// Get stored reviews for a product
function getStoredReviews(productId: string): YotpoReview[] {
  const reviews = global.reviewStorage.get(productId) || [];
  console.log('Yotpo Debug - Retrieved stored reviews for product:', productId, 'Count:', reviews.length);
  console.log('Yotpo Debug - All stored reviews:', Array.from(global.reviewStorage.entries()));
  return reviews;
}

// Store a review for a product
function storeReview(productId: string, review: YotpoReview): void {
  const existingReviews = global.reviewStorage.get(productId) || [];
  global.reviewStorage.set(productId, [...existingReviews, review]);
  console.log('Yotpo Debug - Stored review for product:', productId);
  console.log('Yotpo Debug - Review details:', {
    id: review.id,
    title: review.title,
    author: review.reviewer_name,
    rating: review.rating
  });
  console.log('Yotpo Debug - Total stored reviews for product:', global.reviewStorage.get(productId)?.length || 0);
  console.log('Yotpo Debug - All stored reviews after storing:', Array.from(global.reviewStorage.entries()));
  
  // Save to file
  saveStoredReviewsToFile();
}

// Moderation functions
export function approveReview(productId: string, reviewId: number): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1 && reviews[reviewIndex]) {
    reviews[reviewIndex].status = 'approved';
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    console.log('Yotpo Debug - Approved review:', reviewId);
    return true;
  }
  return false;
}

export function rejectReview(productId: string, reviewId: number): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1 && reviews[reviewIndex]) {
    reviews[reviewIndex].status = 'rejected';
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    console.log('Yotpo Debug - Rejected review:', reviewId);
    return true;
  }
  return false;
}

export function editReview(productId: string, reviewId: number, updates: {
  title?: string;
  content?: string;
  rating?: number;
}): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1) {
    const review = reviews[reviewIndex];
    reviews[reviewIndex] = {
      ...review,
      ...updates,
      updated_at: new Date().toISOString()
    } as YotpoReview;
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    console.log('Yotpo Debug - Edited review:', reviewId, updates);
    return true;
  }
  return false;
}

export function deleteReview(productId: string, reviewId: number): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const filteredReviews = reviews.filter(r => r.id !== reviewId);
  
  if (filteredReviews.length !== reviews.length) {
    global.reviewStorage.set(productId, filteredReviews);
    saveStoredReviewsToFile();
    console.log('Yotpo Debug - Deleted review:', reviewId);
    return true;
  }
  return false;
}

// Get all reviews for moderation (including pending and rejected)
export function getAllReviewsForModeration(): Array<{
  productId: string;
  reviews: YotpoReview[];
}> {
  const allReviews: Array<{ productId: string; reviews: YotpoReview[] }> = [];
  
  for (const [productId, reviews] of global.reviewStorage.entries()) {
    allReviews.push({ productId, reviews });
  }
  
  return allReviews;
}

// Get pending reviews for moderation
export function getPendingReviews(): Array<{
  productId: string;
  reviews: YotpoReview[];
}> {
  const pendingReviews: Array<{ productId: string; reviews: YotpoReview[] }> = [];
  
  for (const [productId, reviews] of global.reviewStorage.entries()) {
    const pending = reviews.filter(r => r.status === 'pending');
    if (pending.length > 0) {
      pendingReviews.push({ productId, reviews: pending });
    }
  }
  
  return pendingReviews;
}

// Debug function to test storage
export function debugStorage(): void {
  console.log('Yotpo Debug - Storage test - All stored reviews:', Array.from(global.reviewStorage.entries()));
  console.log('Yotpo Debug - Storage test - Storage size:', global.reviewStorage.size);
}

// Test Yotpo API connectivity
export async function testYotpoAPI(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!YOTPO_APP_KEY || !YOTPO_SECRET_KEY) {
    return {
      success: false,
      message: 'Yotpo credentials not configured'
    };
  }

  try {
    console.log('Yotpo Debug - Testing API connectivity...');
    console.log('Yotpo Debug - App Key:', YOTPO_APP_KEY);
    console.log('Yotpo Debug - Secret Key:', YOTPO_SECRET_KEY ? 'SET' : 'NOT SET');
    console.log('Yotpo Debug - Store Domain:', process.env.SHOPIFY_STORE_DOMAIN);

    // Test the widget endpoint (read-only)
    const testUrl = `https://api.yotpo.com/v1/widget/${YOTPO_APP_KEY}/products/9000437317865/reviews`;
    console.log('Yotpo Debug - Testing URL:', testUrl);

    const response = await fetch(testUrl, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Yotpo Debug - Test response status:', response.status);
    console.log('Yotpo Debug - Test response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('Yotpo Debug - Test response data:', data);
      return {
        success: true,
        message: 'API connectivity test successful',
        details: data
      };
    } else {
      const errorText = await response.text();
      console.log('Yotpo Debug - Test error response:', errorText);
      return {
        success: false,
        message: `API test failed: ${response.status} - ${errorText}`
      };
    }
  } catch (error) {
    console.log('Yotpo Debug - Test error:', error);
    return {
      success: false,
      message: `API test error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Mock reviews for fallback
function getMockReviews(productId: string): YotpoReview[] {
  return [
    {
      id: 1,
      product_id: productId,
      reviewer_name: 'John Doe',
      reviewer_email: 'john@example.com',
      rating: 5,
      title: 'Great Product!',
      content: 'This is exactly what I was looking for. High quality and fast shipping.',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved'
    },
    {
      id: 2,
      product_id: productId,
      reviewer_name: 'Jane Smith',
      reviewer_email: 'jane@example.com',
      rating: 4,
      title: 'Very Good',
      content: 'Good quality product, would recommend to others.',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved'
    }
  ];
}

export async function createProductReviewYotpo(reviewData: {
  productId: string;
  title: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail: string;
}): Promise<YotpoReview> {
  console.log('Yotpo Debug - createProductReviewYotpo called with:', reviewData);
  console.log('Yotpo Debug - APP_KEY exists:', !!YOTPO_APP_KEY);
  console.log('Yotpo Debug - SECRET_KEY exists:', !!YOTPO_SECRET_KEY);
  
  if (!YOTPO_APP_KEY || !YOTPO_SECRET_KEY) {
    console.warn('Yotpo credentials not configured, creating stored review');
    const mockReview = createMockReview(reviewData);
    storeReview(reviewData.productId, mockReview);
    return mockReview;
  }

  try {
    // Extract just the numeric product ID from the Shopify GID
    const numericProductId = reviewData.productId.replace('gid://shopify/Product/', '');
    console.log('Yotpo Debug - Create review - Original product ID:', reviewData.productId);
    console.log('Yotpo Debug - Create review - Numeric product ID:', numericProductId);
    
    // Try to send to Yotpo API first
    console.log('Yotpo Debug - Attempting to send review to Yotpo API...');
    
    // Use the Yotpo API endpoint for creating reviews
    // Based on Yotpo API documentation, try different endpoints
    const apiUrl = 'https://api.yotpo.com/v1/reviews';
    const requestBody = {
      app_key: YOTPO_APP_KEY,
      domain: process.env.SHOPIFY_STORE_DOMAIN,
      product_id: numericProductId,
      reviewer_name: reviewData.authorName,
      reviewer_email: reviewData.authorEmail,
      review_title: reviewData.title,
      review_content: reviewData.content,
      review_score: reviewData.rating,
      utoken: YOTPO_SECRET_KEY
    };
    
    console.log('Yotpo Debug - API URL:', apiUrl);
    console.log('Yotpo Debug - Request body:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Yotpo Debug - API response status:', response.status);
    console.log('Yotpo Debug - API response ok:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('Yotpo Debug - API response data:', data);
      
      // Create a review object from the API response
      const apiReview: YotpoReview = {
        id: Date.now(), // Use timestamp as ID since API might not return one
        product_id: reviewData.productId,
        reviewer_name: reviewData.authorName,
        reviewer_email: reviewData.authorEmail,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'approved' // API reviews are typically approved
      };
      
      // Store the review locally as well
      storeReview(reviewData.productId, apiReview);
      console.log('Yotpo Debug - Review successfully sent to Yotpo API and stored locally');
      return apiReview;
    } else {
      const errorText = await response.text();
      console.log('Yotpo Debug - API error response:', errorText);
      
      // Try alternative endpoint if first one fails
      console.log('Yotpo Debug - Trying alternative endpoint...');
      const altApiUrl = 'https://api.yotpo.com/v1/reviews/dynamic_create';
      const altResponse = await fetch(altApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Yotpo Debug - Alternative API response status:', altResponse.status);
      console.log('Yotpo Debug - Alternative API response ok:', altResponse.ok);
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Yotpo Debug - Alternative API response data:', altData);
        
        const apiReview: YotpoReview = {
          id: Date.now(),
          product_id: reviewData.productId,
          reviewer_name: reviewData.authorName,
          reviewer_email: reviewData.authorEmail,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'approved'
        };
        
        storeReview(reviewData.productId, apiReview);
        console.log('Yotpo Debug - Review successfully sent to alternative Yotpo API and stored locally');
        return apiReview;
      } else {
        const altErrorText = await altResponse.text();
        console.log('Yotpo Debug - Alternative API error response:', altErrorText);
        
        // If both APIs fail, fall back to stored review
        console.log('Yotpo Debug - Both APIs failed, creating stored review as fallback');
        const mockReview = createMockReview(reviewData);
        storeReview(reviewData.productId, mockReview);
        return mockReview;
      }
    }
    
  } catch (error) {
    console.log('Yotpo Debug - Create review error:', error);
    
    // If API call fails completely, fall back to stored review
    console.log('Yotpo Debug - API call failed, creating stored review as fallback');
    const mockReview = createMockReview(reviewData);
    storeReview(reviewData.productId, mockReview);
    return mockReview;
  }
}

// Mock review creation for fallback
function createMockReview(reviewData: {
  productId: string;
  title: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail: string;
}): YotpoReview {
  const mockReview: YotpoReview = {
    id: Date.now(),
    product_id: reviewData.productId,
    reviewer_name: reviewData.authorName,
    reviewer_email: reviewData.authorEmail,
    rating: reviewData.rating,
    title: reviewData.title,
    content: reviewData.content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'approved'
  };
  
  return mockReview;
}

export async function getProductReviewStatsYotpo(productId: string): Promise<YotpoReviewStats> {
  const reviews = await getProductReviewsYotpo(productId);
  
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    }
  });

  return {
    averageRating,
    totalReviews,
    ratingDistribution
  };
} 
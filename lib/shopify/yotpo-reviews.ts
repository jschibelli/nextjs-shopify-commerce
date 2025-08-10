// Yotpo Reviews Integration
// This is an alternative to Shopify Admin API for product reviews

const YOTPO_APP_KEY = process.env.YOTPO_APP_KEY;
const YOTPO_SECRET_KEY = process.env.YOTPO_SECRET_KEY;

// Reduce noisy logs in production builds
const YOTPO_DEBUG = process.env.YOTPO_DEBUG === 'true';
const ylog = (...args: any[]) => {
  if (YOTPO_DEBUG) console.log(...args);
};

// Global in-memory storage for reviews during development
// Using a global variable to ensure persistence across API calls
declare global {
  var reviewStorage: Map<string, YotpoReview[]>;
  var reviewModerationLog: Array<ModerationAction>;
}

// Initialize global storage if it doesn't exist
if (!global.reviewStorage) {
  global.reviewStorage = new Map<string, YotpoReview[]>();
}

if (!global.reviewModerationLog) {
  global.reviewModerationLog = [];
}

// File-based storage as backup
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const STORAGE_FILE = join(process.cwd(), '.reviews-storage.json');
const MODERATION_LOG_FILE = join(process.cwd(), '.reviews-moderation-log.json');

// Enhanced review interface with better status tracking
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
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
}

// Moderation action tracking
export interface ModerationAction {
  id: string;
  reviewId: number;
  productId: string;
  action: 'approve' | 'reject' | 'delete' | 'edit';
  moderator: string;
  timestamp: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface YotpoReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  moderationStats: {
    pending: number;
    approved: number;
    rejected: number;
    deleted: number;
  };
}

// Load stored reviews from file
function loadStoredReviewsFromFile(): Map<string, YotpoReview[]> {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    ylog('Yotpo Debug - Error loading reviews from file:', error);
  }
  return new Map();
}

// Load moderation log from file
function loadModerationLogFromFile(): Array<ModerationAction> {
  try {
    if (existsSync(MODERATION_LOG_FILE)) {
      const data = readFileSync(MODERATION_LOG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    ylog('Yotpo Debug - Error loading moderation log from file:', error);
  }
  return [];
}

// Save stored reviews to file
function saveStoredReviewsToFile(): void {
  try {
    const data = Object.fromEntries(global.reviewStorage);
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    ylog('Yotpo Debug - Saved reviews to file');
  } catch (error) {
    ylog('Yotpo Debug - Error saving reviews to file:', error);
  }
}

// Save moderation log to file
function saveModerationLogToFile(): void {
  try {
    writeFileSync(MODERATION_LOG_FILE, JSON.stringify(global.reviewModerationLog, null, 2));
    ylog('Yotpo Debug - Saved moderation log to file');
  } catch (error) {
    ylog('Yotpo Debug - Error saving moderation log to file:', error);
  }
}

// Initialize storage from file
if (global.reviewStorage.size === 0) {
  const fileStorage = loadStoredReviewsFromFile();
  global.reviewStorage = fileStorage;
  ylog('Yotpo Debug - Loaded reviews from file:', global.reviewStorage.size, 'products');
}

if (global.reviewModerationLog.length === 0) {
  const fileLog = loadModerationLogFromFile();
  global.reviewModerationLog = fileLog;
  ylog('Yotpo Debug - Loaded moderation log from file:', global.reviewModerationLog.length, 'actions');
}

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  ylog('Yotpo Debug - APP_KEY:', YOTPO_APP_KEY ? 'SET' : 'NOT SET');
  ylog('Yotpo Debug - SECRET_KEY:', YOTPO_SECRET_KEY ? 'SET' : 'NOT SET');
  ylog('Yotpo Debug - STORE_DOMAIN:', process.env.SHOPIFY_STORE_DOMAIN);
}

export async function getProductReviewsYotpo(productId: string): Promise<YotpoReview[]> {
  if (!YOTPO_APP_KEY || !YOTPO_SECRET_KEY) {
    console.warn('Yotpo credentials not configured, returning stored reviews');
    return getStoredReviews(productId);
  }

  try {
    // Extract just the numeric product ID from the Shopify GID
    const numericProductId = productId.replace('gid://shopify/Product/', '');
    ylog('Yotpo Debug - Original product ID:', productId);
    ylog('Yotpo Debug - Numeric product ID:', numericProductId);
    
    // Use the correct Yotpo API endpoint for fetching reviews
    // Based on Yotpo API documentation: https://developers.yotpo.com/reference
    const url = `https://api.yotpo.com/v1/widget/${YOTPO_APP_KEY}/products/${numericProductId}/reviews`;
    ylog('Yotpo Debug - Fetching reviews from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    ylog('Yotpo Debug - Response status:', response.status);
    ylog('Yotpo Debug - Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      ylog('Yotpo Debug - Error response:', errorText);
      console.log('Yotpo API not available, using stored reviews');
      return getStoredReviews(productId);
    }
    
    const data = await response.json();
    ylog('Yotpo Debug - Response data:', data);
    
    // Combine API reviews with stored reviews
    const apiReviews = data.response?.reviews || [];
    const storedReviews = getStoredReviews(productId);
    const allReviews = [...storedReviews, ...apiReviews];
    
    ylog('Yotpo Debug - Combined reviews:', {
      apiReviews: apiReviews.length,
      storedReviews: storedReviews.length,
      totalReviews: allReviews.length
    });
    
    return allReviews;
  } catch (error) {
    ylog('Yotpo Debug - Fetch error:', error);
    console.log('Yotpo API not available, using stored reviews');
    return getStoredReviews(productId);
  }
}

// Get stored reviews for a product (excluding deleted reviews)
function getStoredReviews(productId: string): YotpoReview[] {
  const reviews = global.reviewStorage.get(productId) || [];
  // Filter out deleted reviews for public display
  const activeReviews = reviews.filter(review => review.status !== 'deleted');
  ylog('Yotpo Debug - Retrieved stored reviews for product:', productId, 'Count:', activeReviews.length);
  return activeReviews;
}

// Get all stored reviews for a product (including deleted for moderation)
function getAllStoredReviews(productId: string): YotpoReview[] {
  const reviews = global.reviewStorage.get(productId) || [];
  ylog('Yotpo Debug - Retrieved all stored reviews for product:', productId, 'Count:', reviews.length);
  return reviews;
}

// Store a review for a product
function storeReview(productId: string, review: YotpoReview): void {
  const existingReviews = global.reviewStorage.get(productId) || [];
  global.reviewStorage.set(productId, [...existingReviews, review]);
  ylog('Yotpo Debug - Stored review for product:', productId);
  ylog('Yotpo Debug - Review details:', {
    id: review.id,
    title: review.title,
    author: review.reviewer_name,
    rating: review.rating,
    status: review.status
  });
  ylog('Yotpo Debug - Total stored reviews for product:', global.reviewStorage.get(productId)?.length || 0);
  
  // Save to file
  saveStoredReviewsToFile();
}

// Enhanced moderation functions with logging
export function approveReview(productId: string, reviewId: number, moderator: string = 'admin', notes?: string): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1 && reviews[reviewIndex]) {
    const previousStatus = reviews[reviewIndex].status;
    reviews[reviewIndex].status = 'approved';
    reviews[reviewIndex].moderated_by = moderator;
    reviews[reviewIndex].moderated_at = new Date().toISOString();
    if (notes) {
      reviews[reviewIndex].moderation_notes = notes;
    }
    
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    
    // Log the moderation action
    logModerationAction({
      id: `${Date.now()}-${Math.random()}`,
      reviewId,
      productId,
      action: 'approve',
      moderator,
      timestamp: new Date().toISOString(),
      notes,
      previousStatus,
      newStatus: 'approved'
    });
    
    ylog('Yotpo Debug - Approved review:', reviewId);
    return true;
  }
  return false;
}

export function rejectReview(productId: string, reviewId: number, moderator: string = 'admin', notes?: string): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1 && reviews[reviewIndex]) {
    const previousStatus = reviews[reviewIndex].status;
    reviews[reviewIndex].status = 'rejected';
    reviews[reviewIndex].moderated_by = moderator;
    reviews[reviewIndex].moderated_at = new Date().toISOString();
    if (notes) {
      reviews[reviewIndex].moderation_notes = notes;
    }
    
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    
    // Log the moderation action
    logModerationAction({
      id: `${Date.now()}-${Math.random()}`,
      reviewId,
      productId,
      action: 'reject',
      moderator,
      timestamp: new Date().toISOString(),
      notes,
      previousStatus,
      newStatus: 'rejected'
    });
    
    ylog('Yotpo Debug - Rejected review:', reviewId);
    return true;
  }
  return false;
}

export function deleteReview(productId: string, reviewId: number, moderator: string = 'admin', notes?: string): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1 && reviews[reviewIndex]) {
    const previousStatus = reviews[reviewIndex].status;
    reviews[reviewIndex].status = 'deleted';
    reviews[reviewIndex].moderated_by = moderator;
    reviews[reviewIndex].moderated_at = new Date().toISOString();
    if (notes) {
      reviews[reviewIndex].moderation_notes = notes;
    }
    
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    
    // Log the moderation action
    logModerationAction({
      id: `${Date.now()}-${Math.random()}`,
      reviewId,
      productId,
      action: 'delete',
      moderator,
      timestamp: new Date().toISOString(),
      notes,
      previousStatus,
      newStatus: 'deleted'
    });
    
    ylog('Yotpo Debug - Deleted review:', reviewId);
    return true;
  }
  return false;
}

export function editReview(productId: string, reviewId: number, updates: {
  title?: string;
  content?: string;
  rating?: number;
}, moderator: string = 'admin', notes?: string): boolean {
  const reviews = global.reviewStorage.get(productId) || [];
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1) {
    const review = reviews[reviewIndex];
    reviews[reviewIndex] = {
      ...review,
      ...updates,
      updated_at: new Date().toISOString(),
      moderated_by: moderator,
      moderated_at: new Date().toISOString()
    } as YotpoReview;
    
    if (notes) {
      reviews[reviewIndex].moderation_notes = notes;
    }
    
    global.reviewStorage.set(productId, reviews);
    saveStoredReviewsToFile();
    
    // Log the moderation action
    logModerationAction({
      id: `${Date.now()}-${Math.random()}`,
      reviewId,
      productId,
      action: 'edit',
      moderator,
      timestamp: new Date().toISOString(),
      notes,
      previousStatus: review?.status,
      newStatus: review?.status
    });
    
    ylog('Yotpo Debug - Edited review:', reviewId, updates);
    return true;
  }
  return false;
}

// Log moderation actions
function logModerationAction(action: ModerationAction): void {
  global.reviewModerationLog.push(action);
  saveModerationLogToFile();
  ylog('Yotpo Debug - Logged moderation action:', action);
}

// Get moderation log
export function getModerationLog(): ModerationAction[] {
  return global.reviewModerationLog;
}

// Get all reviews for moderation (excluding deleted reviews from main view)
export function getAllReviewsForModeration(): Array<{
  productId: string;
  reviews: YotpoReview[];
}> {
  const allReviews: Array<{ productId: string; reviews: YotpoReview[] }> = [];
  
  for (const [productId, reviews] of global.reviewStorage.entries()) {
    // Filter out deleted reviews from moderation view
    const activeReviews = reviews.filter(r => r.status !== 'deleted');
    if (activeReviews.length > 0) {
      allReviews.push({ productId, reviews: activeReviews });
    }
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

// Get reviews by status for moderation
export function getReviewsByStatus(status: 'pending' | 'approved' | 'rejected' | 'deleted'): Array<{
  productId: string;
  reviews: YotpoReview[];
}> {
  const filteredReviews: Array<{ productId: string; reviews: YotpoReview[] }> = [];
  
  for (const [productId, reviews] of global.reviewStorage.entries()) {
    const filtered = reviews.filter(r => r.status === status);
    if (filtered.length > 0) {
      filteredReviews.push({ productId, reviews: filtered });
    }
  }
  
  return filteredReviews;
}

// Get moderation statistics
export function getModerationStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
} {
  let total = 0;
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let deleted = 0;
  
  for (const reviews of global.reviewStorage.values()) {
    total += reviews.length;
    reviews.forEach(review => {
      switch (review.status) {
        case 'pending':
          pending++;
          break;
        case 'approved':
          approved++;
          break;
        case 'rejected':
          rejected++;
          break;
        case 'deleted':
          deleted++;
          break;
      }
    });
  }
  
  return { total, pending, approved, rejected, deleted };
}

// Bulk moderation actions
export function bulkApproveReviews(reviewIds: Array<{ productId: string; reviewId: number }>, moderator: string = 'admin'): {
  success: number;
  failed: number;
  errors: string[];
} {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  reviewIds.forEach(({ productId, reviewId }) => {
    if (approveReview(productId, reviewId, moderator)) {
      success++;
    } else {
      failed++;
      errors.push(`Failed to approve review ${reviewId} for product ${productId}`);
    }
  });
  
  return { success, failed, errors };
}

export function bulkRejectReviews(reviewIds: Array<{ productId: string; reviewId: number }>, moderator: string = 'admin'): {
  success: number;
  failed: number;
  errors: string[];
} {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  reviewIds.forEach(({ productId, reviewId }) => {
    if (rejectReview(productId, reviewId, moderator)) {
      success++;
    } else {
      failed++;
      errors.push(`Failed to reject review ${reviewId} for product ${productId}`);
    }
  });
  
  return { success, failed, errors };
}

export function bulkDeleteReviews(reviewIds: Array<{ productId: string; reviewId: number }>, moderator: string = 'admin'): {
  success: number;
  failed: number;
  errors: string[];
} {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  reviewIds.forEach(({ productId, reviewId }) => {
    if (deleteReview(productId, reviewId, moderator)) {
      success++;
    } else {
      failed++;
      errors.push(`Failed to delete review ${reviewId} for product ${productId}`);
    }
  });
  
  return { success, failed, errors };
}

// Debug function to test storage
export function debugStorage(): void {
  ylog('Yotpo Debug - Storage test - All stored reviews:', Array.from(global.reviewStorage.entries()));
  ylog('Yotpo Debug - Storage test - Storage size:', global.reviewStorage.size);
  ylog('Yotpo Debug - Moderation log size:', global.reviewModerationLog.length);
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
    ylog('Yotpo Debug - Testing API connectivity...');
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
        status: 'pending' // New reviews start as pending for moderation
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
          status: 'pending'
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
    status: 'pending' // New reviews start as pending for moderation
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

  // Get moderation stats for this product
  const productReviews = getAllStoredReviews(productId);
  const moderationStats = {
    pending: productReviews.filter(r => r.status === 'pending').length,
    approved: productReviews.filter(r => r.status === 'approved').length,
    rejected: productReviews.filter(r => r.status === 'rejected').length,
    deleted: productReviews.filter(r => r.status === 'deleted').length,
  };

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
    moderationStats
  };
}

// Get stats for only approved reviews (for public display)
export async function getProductReviewStatsPublic(productId: string): Promise<YotpoReviewStats> {
  const allReviews = await getProductReviewsYotpo(productId);
  
  // Filter to only approved reviews for public display
  const approvedReviews = allReviews.filter(review => review.status === 'approved');
  
  const totalReviews = approvedReviews.length;
  const averageRating = totalReviews > 0 
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedReviews.forEach(review => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    }
  });

  // Get moderation stats for this product (for admin reference)
  const productReviews = getAllStoredReviews(productId);
  const moderationStats = {
    pending: productReviews.filter(r => r.status === 'pending').length,
    approved: productReviews.filter(r => r.status === 'approved').length,
    rejected: productReviews.filter(r => r.status === 'rejected').length,
    deleted: productReviews.filter(r => r.status === 'deleted').length,
  };

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
    moderationStats
  };
} 
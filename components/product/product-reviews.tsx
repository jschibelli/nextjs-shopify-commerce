'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createProductReviewClient, getProductReviewsClient, getProductReviewStatsClient } from 'lib/shopify/reviews-client';
import { ProductReview, ReviewStats } from 'lib/shopify/types';
import { useAuth } from 'lib/use-auth';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReviewForm } from './review-form';
import { ReviewItem } from './review-item';
import { ReviewSummary } from './review-summary';

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  className?: string;
}

export function ProductReviews({ productId, productTitle, className }: ProductReviewsProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        getProductReviewsClient(productId, 10),
        getProductReviewStatsClient(productId)
      ]);
      
      setReviews(reviewsData.reviews);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Don't show error toast since we have fallback mock data
      // The API will return mock data even if Yotpo fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData: {
    title: string;
    content: string;
    rating: number;
    authorName: string;
    authorEmail: string;
  }) => {
    try {
      setIsSubmitting(true);
      await createProductReviewClient({
        productId,
        ...reviewData
      });
      
      setShowReviewForm(false);
      
      // Show success message about moderation
      toast({
        title: 'Review Submitted Successfully!',
        description: 'Thank you for your review. It has been submitted and is pending approval by our moderation team. You will see it appear on the product page once it has been approved.',
      });
      
      // Note: We don't reload reviews here because the new review is pending
      // and won't show up in the public reviews list until approved
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the form handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to write a review.',
        variant: 'destructive'
      });
      return;
    }
    setShowReviewForm(true);
  };

  if (isLoading || authLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              disabled={isSubmitting}
              onClick={handleWriteReviewClick}
            >
              {isSubmitting ? 'Submitting...' : 'Write a Review'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              productTitle={productTitle}
              onSubmit={handleSubmitReview}
            />
          </DialogContent>
        </Dialog>
      </div>

      {stats && stats.totalReviews > 0 ? (
        <>
          <ReviewSummary stats={stats} />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </h3>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <p className="text-lg font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
          {isAuthenticated ? (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Write the First Review'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <ReviewForm
                  productId={productId}
                  productTitle={productTitle}
                  onSubmit={handleSubmitReview}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <LogIn className="h-4 w-4" />
                <span className="text-sm">Login required to write reviews</span>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Log In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = '/signup'}
                >
                  Create Account
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
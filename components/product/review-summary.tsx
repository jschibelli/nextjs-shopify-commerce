'use client';

import { ReviewStats } from 'lib/shopify/types';
import { ReviewStars } from './review-stars';

interface ReviewSummaryProps {
  stats: ReviewStats;
  className?: string;
}

export function ReviewSummary({ stats, className }: ReviewSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <ReviewStars rating={averageRating} size="lg" />
          <div className="text-sm text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-4">{rating}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
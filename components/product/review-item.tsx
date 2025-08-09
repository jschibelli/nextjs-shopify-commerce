'use client';

import { formatDistanceToNow } from 'date-fns';
import { ProductReview } from 'lib/shopify/types';
import { ReviewStars } from './review-stars';

interface ReviewItemProps {
  review: ProductReview;
  className?: string;
}

export function ReviewItem({ review, className }: ReviewItemProps) {
  const { title, content, rating, author, createdAt } = review;
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className={`border-b border-gray-200 py-4 last:border-b-0 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {author.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-sm">{author.name}</div>
            <div className="text-xs text-muted-foreground">{formattedDate}</div>
          </div>
        </div>
        <ReviewStars rating={rating} size="sm" />
      </div>
      
      {title && (
        <h4 className="font-medium text-sm mb-1">{title}</h4>
      )}
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {content}
      </p>
    </div>
  );
} 
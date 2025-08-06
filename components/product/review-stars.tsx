'use client';

import { cn } from 'lib/utils';
import { Star } from 'lucide-react';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  className?: string;
}

export function ReviewStars({ 
  rating, 
  size = 'md', 
  showRating = false, 
  className 
}: ReviewStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          )}
        />
      ))}
      {showRating && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
} 
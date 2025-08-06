'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  onSubmit: (review: {
    title: string;
    content: string;
    rating: number;
    authorName: string;
    authorEmail: string;
  }) => Promise<void>;
  className?: string;
}

export function ReviewForm({ productId, productTitle, onSubmit, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating for this product.',
        variant: 'destructive'
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write your review.',
        variant: 'destructive'
      });
      return;
    }

    if (!authorName.trim() || !authorEmail.trim()) {
      toast({
        title: 'Contact Information Required',
        description: 'Please provide your name and email.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        rating,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim()
      });

      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setAuthorName('');
      setAuthorEmail('');

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review! It will be visible once approved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share your experience with {productTitle}
        </p>
      </div>

      {/* Rating */}
      <div>
        <Label htmlFor="rating">Rating *</Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Review Title (Optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="mt-2"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Review *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="mt-2"
          required
        />
      </div>

      {/* Author Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorName">Name *</Label>
          <Input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="authorEmail">Email *</Label>
          <Input
            id="authorEmail"
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="mt-2"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
} 
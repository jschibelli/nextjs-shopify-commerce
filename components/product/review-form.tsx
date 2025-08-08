'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from 'lib/use-auth';
import { LogIn, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Debug authentication state
  console.log('ReviewForm - Auth State:', { isAuthenticated, isLoading, user: user?.email });

  // Auto-populate user information when authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setAuthorName(fullName || '');
      setAuthorEmail(user.email || '');
    }
  }, [user, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to write a review.',
        variant: 'destructive'
      });
      return;
    }

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

      toast({
        title: 'Review Submitted Successfully!',
        description: 'Thank you for your review. It has been submitted and is pending approval by our moderation team. You can view your reviews in your account dashboard.',
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

  // Show loading state while checking authentication
  if (isLoading) {
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

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Login Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be logged in to write a review for {productTitle}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="w-full"
            >
              Log In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/signup'} 
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share your experience with {productTitle}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All reviews are moderated before being published. Your review will be visible on the product page once it has been approved by our team.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            <strong>Welcome back, {user?.firstName || 'User'}!</strong> Your account information has been pre-filled for your convenience.
          </p>
        </div>
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

      {/* Author Info - Read-only for authenticated users */}
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
            readOnly
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
} 
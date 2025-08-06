'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Check, Edit, Star, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Review {
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

interface ProductReviews {
  productId: string;
  reviews: Review[];
}

export function ModerationDashboard() {
  const [reviews, setReviews] = useState<ProductReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<{
    productId: string;
    reviewId: number;
    title: string;
    content: string;
    rating: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/moderate/list');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (productId: string, reviewId: number) => {
    try {
      const response = await fetch('/api/reviews/moderate/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reviewId })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Review approved' });
        loadReviews();
      } else {
        throw new Error('Failed to approve review');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve review',
        variant: 'destructive'
      });
    }
  };

  const rejectReview = async (productId: string, reviewId: number) => {
    try {
      const response = await fetch('/api/reviews/moderate/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reviewId })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Review rejected' });
        loadReviews();
      } else {
        throw new Error('Failed to reject review');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject review',
        variant: 'destructive'
      });
    }
  };

  const editReview = async (updates: {
    title?: string;
    content?: string;
    rating?: number;
  }) => {
    if (!editingReview) return;

    try {
      const response = await fetch('/api/reviews/moderate/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingReview.productId,
          reviewId: editingReview.reviewId,
          updates
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Review updated' });
        setEditingReview(null);
        loadReviews();
      } else {
        throw new Error('Failed to update review');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive'
      });
    }
  };

  const deleteReview = async (productId: string, reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch('/api/reviews/moderate/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reviewId })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Review deleted' });
        loadReviews();
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-4">Loading reviews...</div>;
  }

  const totalReviews = reviews.reduce((sum, product) => sum + product.reviews.length, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <div className="text-sm text-muted-foreground">
          {totalReviews} total reviews
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No reviews to moderate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((product) => (
            <Card key={product.productId}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Product: {product.productId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.reviewer_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {review.reviewer_email}
                          </span>
                          {getStatusBadge(review.status)}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.title && (
                        <h3 className="font-medium">{review.title}</h3>
                      )}

                      <p className="text-sm text-muted-foreground">{review.content}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created: {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {review.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveReview(product.productId, review.id)}
                                className="h-6 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectReview(product.productId, review.id)}
                                className="h-6 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingReview({
                              productId: product.productId,
                              reviewId: review.id,
                              title: review.title || '',
                              content: review.content,
                              rating: review.rating
                            })}
                            className="h-6 px-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReview(product.productId, review.id)}
                            className="h-6 px-2 text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({
                    ...editingReview,
                    title: e.target.value
                  })}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={editingReview.content}
                  onChange={(e) => setEditingReview({
                    ...editingReview,
                    content: e.target.value
                  })}
                  className="w-full p-2 border rounded mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <select
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({
                    ...editingReview,
                    rating: parseInt(e.target.value)
                  })}
                  className="w-full p-2 border rounded mt-1"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => editReview({
                    title: editingReview.title,
                    content: editingReview.content,
                    rating: editingReview.rating
                  })}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingReview(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Clock, Edit, ExternalLink, Package, Star, Trash2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProductInfo {
  id: string;
  title: string;
  handle: string;
  featuredImage?: string;
  price?: string;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  created_at: string;
  updated_at: string;
  moderated_by?: string;
  moderated_at?: string;
  moderation_notes?: string;
}

interface ProductReviews {
  productId: string;
  productInfo?: ProductInfo;
  reviews: Review[];
}

interface UserReviewsResponse {
  reviews: ProductReviews[];
  totalReviews: number;
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    rating: 5
  });
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/reviews');
      if (response.ok) {
        const data: UserReviewsResponse = await response.json();
        setReviews(data.reviews);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load your reviews',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your reviews',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      title: review.title || '',
      content: review.content,
      rating: review.rating
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;

    try {
      const response = await fetch(`/api/account/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: reviews.find(p => p.reviews.some(r => r.id === editingReview.id))?.productId,
          ...editForm
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Review updated successfully',
        });
        setEditingReview(null);
        loadReviews(); // Reload to get updated data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update review',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReview) return;

    try {
      const response = await fetch(`/api/account/reviews/${deletingReview.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Review deleted successfully',
        });
        setDeletingReview(null);
        loadReviews(); // Reload to get updated data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete review',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'deleted':
        return <Badge variant="outline" className="flex items-center gap-1">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const allReviews = reviews.flatMap(product => 
    product.reviews.map(review => ({ ...review, productId: product.productId, productInfo: product.productInfo }))
  );

  // Calculate review statistics
  const reviewStats = {
    total: allReviews.length,
    pending: allReviews.filter(r => r.status === 'pending').length,
    approved: allReviews.filter(r => r.status === 'approved').length,
    rejected: allReviews.filter(r => r.status === 'rejected').length,
    deleted: allReviews.filter(r => r.status === 'deleted').length,
    averageRating: allReviews.length > 0 
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0'
  };

  if (allReviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 mb-4">You haven't written any reviews yet. Start by browsing our products and sharing your experience!</p>
            <Button asChild>
              <Link href="/search">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground">Manage your product reviews and ratings</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {allReviews.length} review{allReviews.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{reviewStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{reviewStats.averageRating}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{reviewStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{reviewStats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{reviewStats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        {allReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Product Information */}
                  {review.productInfo && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      {review.productInfo.featuredImage && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={review.productInfo.featuredImage}
                            alt={review.productInfo.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {review.productInfo.title}
                        </h3>
                        {review.productInfo.price && (
                          <p className="text-sm text-gray-600">
                            ${parseFloat(review.productInfo.price).toFixed(2)}
                          </p>
                        )}
                        <Link 
                          href={`/product/${review.productInfo.handle}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Product
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Review Status and Date */}
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(review.status)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="text-lg font-semibold mb-2">{review.title}</h4>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {(review.status === 'pending' || review.status === 'approved') && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title (optional)</Label>
                            <Input
                              id="title"
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Review title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="content">Review</Label>
                            <Textarea
                              id="content"
                              value={editForm.content}
                              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Write your review"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rating">Rating</Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      star <= editForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingReview(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSaveEdit}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {review.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingReview(review)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteReview}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">{review.content}</p>
              
              {/* Moderation Information */}
              {review.moderation_notes && review.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Moderation Note:</strong> {review.moderation_notes}
                  </p>
                </div>
              )}

              {/* Last Updated Info */}
              {review.updated_at !== review.created_at && (
                <p className="text-xs text-gray-500 mt-3">
                  Last updated: {formatDate(review.updated_at)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
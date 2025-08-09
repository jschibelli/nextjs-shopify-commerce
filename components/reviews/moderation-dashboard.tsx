'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertTriangle,
    BarChart3,
    Check,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Loader2,
    MessageSquare,
    RefreshCw,
    Star,
    Trash2,
    X,
    XCircle
} from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
}

interface ProductReviews {
  productId: string;
  reviews: Review[];
}

interface ModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  deleted: number;
}

interface ModerationAction {
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

export function ModerationDashboard() {
  const [reviews, setReviews] = useState<ProductReviews[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [moderationLog, setModerationLog] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReview, setEditingReview] = useState<{
    productId: string;
    reviewId: number;
    title: string;
    content: string;
    rating: number;
  } | null>(null);
  const [bulkActionNotes, setBulkActionNotes] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('stats', 'true');

      const response = await fetch(`/api/reviews/moderate/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
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

  const loadModerationLog = async () => {
    try {
      const response = await fetch('/api/reviews/moderate/stats?log=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setModerationLog(data.log || []);
      }
    } catch (error) {
      console.error('Error loading moderation log:', error);
    }
  };

  const performModerationAction = async (
    action: 'approve' | 'reject' | 'delete' | 'edit',
    productId: string,
    reviewId: number,
    notes?: string
  ) => {
    try {
      let response;
      const moderator = 'admin'; // In a real app, get from auth context

      switch (action) {
        case 'approve':
          response = await fetch('/api/reviews/moderate/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, reviewId, moderator, notes })
          });
          break;
        case 'reject':
          response = await fetch('/api/reviews/moderate/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, reviewId, moderator, notes })
          });
          break;
        case 'delete':
          response = await fetch('/api/reviews/moderate/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, reviewId, moderator, notes })
          });
          break;
        case 'edit':
          if (!editingReview) return;
          response = await fetch('/api/reviews/moderate/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              reviewId,
              updates: {
                title: editingReview.title,
                content: editingReview.content,
                rating: editingReview.rating
              },
              moderator,
              notes
            })
          });
          break;
      }

      if (response?.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: data.message });
        setEditingReview(null);
        setSelectedReviews(new Set());
        loadReviews();
        loadModerationLog();
      } else {
        throw new Error('Moderation action failed');
      }
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} review`,
        variant: 'destructive'
      });
    }
  };

  const performBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReviews.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select reviews to perform bulk action',
        variant: 'destructive'
      });
      return;
    }

    try {
      const reviewIds = Array.from(selectedReviews).map(id => {
        const [productId, reviewId] = id.split('-');
        return { productId: productId || '', reviewId: parseInt(reviewId || '0') };
      });

      const moderator = 'admin';
      let response;

      switch (action) {
        case 'approve':
          response = await fetch('/api/reviews/moderate/bulk-approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewIds, moderator, notes: bulkActionNotes })
          });
          break;
        case 'reject':
          response = await fetch('/api/reviews/moderate/bulk-reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewIds, moderator, notes: bulkActionNotes })
          });
          break;
        case 'delete':
          response = await fetch('/api/reviews/moderate/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewIds, moderator, notes: bulkActionNotes })
          });
          break;
      }

      if (response?.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: data.message });
        setSelectedReviews(new Set());
        setBulkActionNotes('');
        loadReviews();
        loadModerationLog();
      } else {
        throw new Error('Bulk action failed');
      }
    } catch (error) {
      console.error(`Error bulk ${action}ing reviews:`, error);
      toast({
        title: 'Error',
        description: `Failed to bulk ${action} reviews`,
        variant: 'destructive'
      });
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    const newSelection = new Set(selectedReviews);
    if (newSelection.has(reviewId)) {
      newSelection.delete(reviewId);
    } else {
      newSelection.add(reviewId);
    }
    setSelectedReviews(newSelection);
  };

  const selectAllReviews = () => {
    const allReviewIds = new Set<string>();
    reviews.forEach(product => {
      product.reviews.forEach(review => {
        allReviewIds.add(`${product.productId}-${review.id}`);
      });
    });
    setSelectedReviews(allReviewIds);
  };

  const clearSelection = () => {
    setSelectedReviews(new Set());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'deleted':
        return <Badge className="bg-gray-500"><Trash2 className="h-3 w-3 mr-1" />Deleted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredReviews = reviews.filter(product => {
    const filteredProductReviews = product.reviews.filter(review => {
      const matchesSearch = 
        review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      const matchesDeleted = showDeleted ? true : review.status !== 'deleted';
      
      return matchesSearch && matchesStatus && matchesDeleted;
    });

    return filteredProductReviews.length > 0;
  }).map(product => ({
    ...product,
    reviews: product.reviews.filter(review => {
      const matchesSearch = 
        review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      const matchesDeleted = showDeleted ? true : review.status !== 'deleted';
      
      return matchesSearch && matchesStatus && matchesDeleted;
    })
  }));

  const totalFilteredReviews = filteredReviews.reduce((sum, product) => sum + product.reviews.length, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Moderation</h1>
          <p className="text-muted-foreground">
            Manage and moderate product reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadReviews}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deleted</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.deleted}</p>
                </div>
                <Trash2 className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Reviews</Label>
              <Input
                id="search"
                placeholder="Search by reviewer name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleted(!showDeleted)}
                className={showDeleted ? 'bg-red-50 border-red-200' : ''}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDeleted ? 'Hide' : 'Show'} Deleted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReviews.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedReviews.size} review{selectedReviews.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Bulk action notes (optional)"
                  value={bulkActionNotes}
                  onChange={(e) => setBulkActionNotes(e.target.value)}
                  className="w-64"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => performBulkAction('approve')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => performBulkAction('reject')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Selected
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Reviews</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedReviews.size} review{selectedReviews.size !== 1 ? 's' : ''}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => performBulkAction('delete')}>
                            Delete Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No reviews to moderate.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllReviews}>
                  Select All ({totalFilteredReviews})
                </Button>
                {selectedReviews.size > 0 && (
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {totalFilteredReviews} review{totalFilteredReviews !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Reviews */}
            {filteredReviews.map((product) => (
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
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedReviews.has(`${product.productId}-${review.id}`)}
                              onChange={() => toggleReviewSelection(`${product.productId}-${review.id}`)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.reviewer_name}</span>
                              <span className="text-sm text-muted-foreground">
                                {review.reviewer_email}
                              </span>
                              {getStatusBadge(review.status)}
                            </div>
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
                            {review.moderated_at && (
                              <span className="ml-2">
                                • Moderated: {new Date(review.moderated_at).toLocaleDateString()}
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {review.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => performModerationAction('approve', product.productId, review.id)}
                                  className="h-6 px-2"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => performModerationAction('reject', product.productId, review.id)}
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-red-600"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
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
                                  <AlertDialogAction onClick={() => performModerationAction('delete', product.productId, review.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {review.moderation_notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <strong>Moderation Notes:</strong> {review.moderation_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update review content and rating
            </DialogDescription>
          </DialogHeader>
          {editingReview && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({
                    ...editingReview,
                    title: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingReview.content}
                  onChange={(e) => setEditingReview({
                    ...editingReview,
                    content: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-rating">Rating</Label>
                                 <Select
                   value={editingReview.rating.toString()}
                   onValueChange={(value: string) => setEditingReview({
                     ...editingReview,
                     rating: parseInt(value || '1')
                   })}
                 >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingReview) {
                performModerationAction('edit', editingReview.productId, editingReview.reviewId);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
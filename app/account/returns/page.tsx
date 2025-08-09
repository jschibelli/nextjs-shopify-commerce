'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Package, Plus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReturnItem {
  lineItemId: string;
  quantity: number;
  reason: string;
  description?: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  items: ReturnItem[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewReturnForm, setShowNewReturnForm] = useState(false);
  const [newReturn, setNewReturn] = useState({
    orderId: '',
    reason: '',
    items: [{ lineItemId: '', quantity: 1, reason: '', description: '' }]
  });

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/account/returns');
      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch returns');
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturn.orderId.trim() || !newReturn.reason.trim()) return;

    // Validate items
    const validItems = newReturn.items.filter(item => 
      item.lineItemId.trim() && item.quantity > 0 && item.reason.trim()
    );

    if (validItems.length === 0) {
      setError('Please add at least one item to return');
      return;
    }

    try {
      const response = await fetch('/api/account/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newReturn.orderId,
          reason: newReturn.reason,
          items: validItems
        })
      });

      if (response.ok) {
        setSuccess('Return request created successfully!');
        setNewReturn({
          orderId: '',
          reason: '',
          items: [{ lineItemId: '', quantity: 1, reason: '', description: '' }]
        });
        setShowNewReturnForm(false);
        fetchReturns();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create return request');
      }
    } catch (error) {
      console.error('Error creating return request:', error);
      setError('Failed to create return request');
    }
  };

  const addItem = () => {
    setNewReturn(prev => ({
      ...prev,
      items: [...prev.items, { lineItemId: '', quantity: 1, reason: '', description: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (newReturn.items.length > 1) {
      setNewReturn(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: keyof ReturnItem, value: string | number) => {
    setNewReturn(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Returns & Refunds</h1>
          <p className="text-gray-600">
            Request returns and track the status of your refunds
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Return Requests</h2>
          <Button onClick={() => setShowNewReturnForm(!showNewReturnForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>

        {/* New Return Form */}
        {showNewReturnForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Return Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createReturn} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={newReturn.orderId}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, orderId: e.target.value }))}
                      placeholder="e.g., #1001"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reason">Return Reason</Label>
                    <Select
                      value={newReturn.reason}
                      onValueChange={(value) => setNewReturn(prev => ({ ...prev, reason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defective">Defective Product</SelectItem>
                        <SelectItem value="wrong_size">Wrong Size</SelectItem>
                        <SelectItem value="not_as_described">Not As Described</SelectItem>
                        <SelectItem value="damaged">Damaged in Shipping</SelectItem>
                        <SelectItem value="changed_mind">Changed Mind</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Items to Return</Label>
                  <div className="space-y-3">
                    {newReturn.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Line Item ID</Label>
                            <Input
                              value={item.lineItemId}
                              onChange={(e) => updateItem(index, 'lineItemId', e.target.value)}
                              placeholder="e.g., gid://shopify/LineItem/123"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label>Reason</Label>
                            <Select
                              value={item.reason}
                              onValueChange={(value) => updateItem(index, 'reason', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="defective">Defective</SelectItem>
                                <SelectItem value="wrong_size">Wrong Size</SelectItem>
                                <SelectItem value="not_as_described">Not As Described</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label>Description (Optional)</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Additional details about this item..."
                            rows={2}
                          />
                        </div>
                        
                        {newReturn.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="mt-2"
                          >
                            Remove Item
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="mt-2"
                  >
                    Add Another Item
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit">
                    Create Return Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewReturnForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Returns List */}
        <div className="space-y-4">
          {returns.length > 0 ? (
            returns.map((returnRequest) => (
              <Card key={returnRequest.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(returnRequest.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Return for Order {returnRequest.orderId}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(returnRequest.status)}>
                            {returnRequest.status}
                          </Badge>
                          <Badge variant="outline">
                            {returnRequest.items.length} item(s)
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(returnRequest.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <strong>Reason:</strong> {returnRequest.reason}
                  </div>
                  
                  <div className="space-y-2">
                    <strong>Items:</strong>
                    {returnRequest.items.map((item, index) => (
                      <div key={index} className="ml-4 text-sm">
                        • {item.lineItemId} (Qty: {item.quantity}) - {item.reason}
                        {item.description && (
                          <div className="ml-4 text-gray-600">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-4">
                    Last updated: {formatDate(returnRequest.updatedAt)}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No return requests found.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create your first return request if you need to return any items.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
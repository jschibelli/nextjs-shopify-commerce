'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Loader2,
    Package,
    Search,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  name: string;
  email: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  order_status_url: string;
  created_at: string;
  updated_at: string;
  processed_at: string;
  cancelled_at?: string;
  cancel_reason?: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
    variant_title?: string;
  }>;
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
}

interface OrderStats {
  total: number;
  totalRevenue: string;
  pending: number;
  paid: number;
  fulfilled: number;
  cancelled: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(data.stats || null);
        if (data.orders?.length === 0) {
          setSuccess('No orders found.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFulfillmentColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unfulfilled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer?.first_name + ' ' + order.customer?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Loading orders from Shopify...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage your store orders
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Order Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by name, email, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{order.name}</h3>
                    <Badge className={getStatusColor(order.financial_status)}>
                      {getStatusIcon(order.financial_status)}
                      <span className="ml-1">{order.financial_status}</span>
                    </Badge>
                    <Badge className={getFulfillmentColor(order.fulfillment_status || 'unfulfilled')}>
                      {order.fulfillment_status || 'unfulfilled'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {order.customer?.first_name} {order.customer?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${order.total_price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {order.line_items && order.line_items.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.line_items.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item.title} (x{item.quantity})
                          </Badge>
                        ))}
                        {order.line_items.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{order.line_items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog open={isOrderDialogOpen && selectedOrder?.id === order.id} onOpenChange={setIsOrderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openOrderDialog(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details - {selectedOrder?.name}</DialogTitle>
                        <DialogDescription>
                          Complete order information and customer details
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-6">
                          {/* Order Summary */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Order Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                                <p><strong>Status:</strong> {selectedOrder.financial_status}</p>
                                <p><strong>Fulfillment:</strong> {selectedOrder.fulfillment_status || 'unfulfilled'}</p>
                                <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                <p><strong>Updated:</strong> {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Financial Summary</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Subtotal:</strong> ${selectedOrder.subtotal_price}</p>
                                <p><strong>Tax:</strong> ${selectedOrder.total_tax}</p>
                                <p><strong>Total:</strong> ${selectedOrder.total_price}</p>
                                <p><strong>Currency:</strong> {selectedOrder.currency}</p>
                              </div>
                            </div>
                          </div>

                          {/* Customer Information */}
                          {selectedOrder.customer && (
                            <div>
                              <h4 className="font-semibold mb-2">Customer Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Name:</strong> {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}</p>
                                <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                              </div>
                            </div>
                          )}

                          {/* Shipping Address */}
                          {selectedOrder.shipping_address && (
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              <div className="text-sm">
                                <p>{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</p>
                                <p>{selectedOrder.shipping_address.address1}</p>
                                {selectedOrder.shipping_address.address2 && (
                                  <p>{selectedOrder.shipping_address.address2}</p>
                                )}
                                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province} {selectedOrder.shipping_address.zip}</p>
                                <p>{selectedOrder.shipping_address.country}</p>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          {selectedOrder.line_items && selectedOrder.line_items.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {selectedOrder.line_items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                                    <div>
                                      <p className="font-medium">{item.title}</p>
                                      {item.variant_title && (
                                        <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">${item.price}</p>
                                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No orders have been placed yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
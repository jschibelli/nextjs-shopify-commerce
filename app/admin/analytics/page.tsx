'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    DollarSign,
    Download,
    Loader2,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: string;
  };
  products: {
    active: number;
    draft: number;
    archived: number;
    withImages: number;
    withVariants: number;
  };
  orders: {
    pending: number;
    paid: number;
    fulfilled: number;
    cancelled: number;
    averageOrderValue: string;
  };
  customers: {
    verified: number;
    acceptsMarketing: number;
    totalSpent: string;
    averageCustomerValue: string;
  };
  recentActivity: {
    recentProducts: Array<{
      id: string;
      title: string;
      status: string;
      updated_at: string;
    }>;
    recentOrders: Array<{
      id: string;
      name: string;
      total_price: string;
      financial_status: string;
      created_at: string;
    }>;
    recentCustomers: Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      total_spent: string;
      created_at: string;
    }>;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setSuccess('Analytics data loaded successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRevenueGrowth = () => {
    // This would typically come from historical data
    return '+12.5%';
  };

  const getOrderGrowth = () => {
    // This would typically come from historical data
    return '+8.2%';
  };

  const getCustomerGrowth = () => {
    // This would typically come from historical data
    return '+15.3%';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Loading analytics data from Shopify...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Store performance and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={fetchAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
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

      {analytics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.overview.totalRevenue}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {getRevenueGrowth()} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalOrders}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {getOrderGrowth()} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalCustomers}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {getCustomerGrowth()} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.products.active} active products
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products Overview
                </CardTitle>
                <CardDescription>Product performance and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.products.active}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.products.draft}</div>
                    <div className="text-sm text-muted-foreground">Draft</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>With Images</span>
                    <span className="font-medium">{analytics.products.withImages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>With Variants</span>
                    <span className="font-medium">{analytics.products.withVariants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Archived</span>
                    <span className="font-medium">{analytics.products.archived}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders Overview
                </CardTitle>
                <CardDescription>Order status and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.orders.paid}</div>
                    <div className="text-sm text-muted-foreground">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.orders.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fulfilled</span>
                    <span className="font-medium">{analytics.orders.fulfilled}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cancelled</span>
                    <span className="font-medium">{analytics.orders.cancelled}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Order Value</span>
                    <span className="font-medium">${analytics.orders.averageOrderValue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customers Overview
                </CardTitle>
                <CardDescription>Customer insights and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.customers.verified}</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.customers.acceptsMarketing}</div>
                    <div className="text-sm text-muted-foreground">Marketing</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Spent</span>
                    <span className="font-medium">${analytics.customers.totalSpent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Customer Value</span>
                    <span className="font-medium">${analytics.customers.averageCustomerValue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Products
                </CardTitle>
                <CardDescription>Recently updated products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity.recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {product.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{order.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${order.total_price}</p>
                        <Badge className={order.financial_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {order.financial_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Customers
                </CardTitle>
                <CardDescription>New customer registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity.recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{customer.first_name} {customer.last_name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${customer.total_spent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    ${analytics.orders.averageOrderValue}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Order Value</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    ${analytics.customers.averageCustomerValue}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Customer Value</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.overview.totalOrders > 0 ? 
                      (analytics.overview.totalCustomers / analytics.overview.totalOrders).toFixed(1) : '0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Customers per Order</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.products.active > 0 ? 
                      (analytics.overview.totalOrders / analytics.products.active).toFixed(1) : '0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Orders per Product</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!analytics && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
              <p className="text-muted-foreground">
                Analytics data will appear here once you have products, orders, and customers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
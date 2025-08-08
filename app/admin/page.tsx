'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Loader2,
    MessageSquare,
    Package,
    ShoppingCart,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardData {
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

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.analytics);
        setSuccess('Dashboard data loaded successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRevenueGrowth = () => {
    // This would typically come from historical data comparison
    return '+12.5%';
  };

  const getOrderGrowth = () => {
    // This would typically come from historical data comparison
    return '+8.2%';
  };

  const getCustomerGrowth = () => {
    // This would typically come from historical data comparison
    return '+15.3%';
  };

  const getProductGrowth = () => {
    // This would typically come from historical data comparison
    return '+2';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Loading dashboard data from Shopify...
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your store.
        </p>
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

      {dashboardData && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.overview.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{getRevenueGrowth()}</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.overview.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{getOrderGrowth()}</span> from last month
                </p>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.overview.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">{getProductGrowth()}</span> new this month
                </p>
              </CardContent>
            </Card>

            {/* Customers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.overview.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{getCustomerGrowth()}</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/products">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Products
                    </Button>
                  </Link>
                  
                  <Link href="/admin/reviews">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Moderate Reviews
                    </Button>
                  </Link>
                  
                  <Link href="/admin/customers">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      View Customers
                    </Button>
                  </Link>
                  
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Process Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivity.recentOrders.slice(0, 4).map((order, index) => (
                    <div key={order.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New order received</p>
                        <p className="text-xs text-muted-foreground">{order.name} - ${order.total_price}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  
                  {dashboardData.recentActivity.recentProducts.slice(0, 2).map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Product updated</p>
                        <p className="text-xs text-muted-foreground">"{product.title}" - Status: {product.status}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(product.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  
                  {dashboardData.recentActivity.recentCustomers.slice(0, 2).map((customer, index) => (
                    <div key={customer.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New customer registered</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="text-sm font-medium">${dashboardData.overview.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                    <span className="text-sm font-medium">{dashboardData.overview.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Order Value</span>
                    <span className="text-sm font-medium">${dashboardData.orders.averageOrderValue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Badge variant="default">{dashboardData.products.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Draft</span>
                    <Badge variant="secondary">{dashboardData.products.draft}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Archived</span>
                    <Badge variant="outline">{dashboardData.products.archived}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paid</span>
                    <Badge variant="default">{dashboardData.orders.paid}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <Badge variant="destructive">{dashboardData.orders.pending}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fulfilled</span>
                    <Badge variant="outline">{dashboardData.orders.fulfilled}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current status of your store systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Shopify API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Payment Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Inventory System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Review System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!dashboardData && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No dashboard data</h3>
              <p className="text-muted-foreground">
                Dashboard data will appear here once you have products, orders, and customers.
              </p>
              <Button onClick={fetchDashboardData} className="mt-4">
                <Activity className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
'use client';

import { Badge } from 'components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Activity, BarChart3, Calendar, DollarSign, Gift, ShoppingBag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Analytics {
  customerId: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string | null;
  loyaltyPoints: number;
  activityCount: number;
  referralStats: {
    code: string | null;
    discountPercentage: number;
    uses: number;
  };
  createdAt: string;
  acceptsMarketing: boolean;
  verifiedEmail: boolean;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/account/analytics');
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Analytics</h1>
          <p className="text-muted-foreground">
            View your account statistics and performance
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Analytics</h1>
          <p className="text-muted-foreground">
            View your account statistics and performance
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Analytics</h1>
          <p className="text-muted-foreground">
            View your account statistics and performance
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Analytics</h1>
        <p className="text-muted-foreground">
          View your account statistics and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              Total orders placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.loyaltyPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activityCount}</div>
            <p className="text-xs text-muted-foreground">
              Account activities
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm">{formatDate(analytics.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Order</p>
                <p className="text-sm">
                  {analytics.lastOrderDate ? formatDate(analytics.lastOrderDate) : 'No orders yet'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <Badge variant={analytics.verifiedEmail ? "default" : "secondary"}>
                  {analytics.verifiedEmail ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marketing</p>
                <Badge variant={analytics.acceptsMarketing ? "default" : "secondary"}>
                  {analytics.acceptsMarketing ? 'Subscribed' : 'Unsubscribed'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral Program
            </CardTitle>
            <CardDescription>
              Your referral statistics and earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.referralStats.code ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referral Code</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{analytics.referralStats.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Discount</p>
                    <p className="text-sm">{analytics.referralStats.discountPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uses</p>
                    <p className="text-sm">{analytics.referralStats.uses}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No referral code generated yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Generate a referral code to start earning rewards
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            Key metrics and insights about your account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.ordersCount > 0 ? formatCurrency(analytics.totalSpent / analytics.ordersCount) : '$0'}
              </div>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.ordersCount > 0 ? Math.round(analytics.loyaltyPoints / analytics.ordersCount) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Points per Order</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.activityCount > 0 ? Math.round(analytics.activityCount / 30) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg. Monthly Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
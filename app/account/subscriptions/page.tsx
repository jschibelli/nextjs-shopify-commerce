import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { getAuth } from 'lib/auth';
import { Gift, Pause, Play, Plus, Settings, Trash2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function SubscriptionsPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/login');
  }

  const auth = getAuth();
  await auth.initializeFromCookies();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // For now, use empty subscriptions array
  // This will be populated when customers actually have subscriptions
  const subscriptions: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your recurring orders and subscriptions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {subscriptions.length > 0 ? (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      {subscription.name}
                    </CardTitle>
                    <CardDescription>
                      {subscription.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Subscription Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">${subscription.price}/{subscription.frequency.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Delivery</p>
                      <p className="font-medium">{new Date(subscription.nextDelivery).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Delivery</p>
                      <p className="font-medium">{new Date(subscription.lastDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Subscription Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    <div className="space-y-2">
                      {subscription.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {subscription.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-6">
              Explore our subscription options to get started
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Browse Subscriptions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SubscriptionsPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="space-y-4"><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /></div></div>}>
      <SubscriptionsPage />
    </Suspense>
  );
} 
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { getAuth } from 'lib/auth';
import { Eye, Package } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function OrdersList() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/account/login');
  }

  const auth = getAuth();
  const user = await auth.getCurrentUser();
  const orders = await auth.getCustomerOrders();

  if (!user) {
    redirect('/account/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">
          View and track your order history
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {order.name}
                    </CardTitle>
                    <CardDescription>
                      Order #{order.orderNumber} • {new Date(order.processedAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                    </p>
                    <Badge 
                      variant={order.fulfillmentStatus === 'FULFILLED' ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {order.fulfillmentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.lineItems.edges.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.node.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.node.quantity}
                              {item.node.variant?.title && ` • ${item.node.variant.title}`}
                            </p>
                          </div>
                          <p className="font-medium">
                            {item.node.variant?.price} {order.totalPriceSet.shopMoney.currencyCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <p className="font-medium">{order.financialStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fulfillment</p>
                      <p className="font-medium">{order.fulfillmentStatus}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
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
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button asChild>
              <a href="/search">Start Shopping</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="space-y-4"><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /></div></div>}>
      <OrdersList />
    </Suspense>
  );
} 
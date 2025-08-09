import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { getAuth } from 'lib/auth';
import { AlertCircle, ArrowLeft, CreditCard, MapPin, Package, Truck } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/account/login');
  }

  const auth = getAuth();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect('/account/login');
  }

  let order: any = null;
  let error: string | null = null;

  try {
    order = await auth.getOrder(id);
  } catch (err) {
    console.error('Error fetching order:', err);
    error = 'Failed to load order details. Please try again later.';
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Order</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/account/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'FULFILLED':
        return 'default';
      case 'PARTIALLY_FULFILLED':
        return 'secondary';
      case 'UNFULFILLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getFinancialStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REFUNDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/account/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="text-muted-foreground">
          Order #{order.orderNumber} • {new Date(order.processedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Items</h4>
                <div className="space-y-3">
                  {order.lineItems?.edges?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      {item.node.variant?.image && (
                        <img 
                          src={item.node.variant.image.url} 
                          alt={item.node.variant.image.altText || item.node.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.node.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.node.quantity}
                          {item.node.variant?.title && ` • ${item.node.variant.title}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.node.originalTotalSet?.shopMoney?.amount} {order.totalPriceSet?.shopMoney?.currencyCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{order.subtotalPriceSet?.shopMoney?.amount} {order.subtotalPriceSet?.shopMoney?.currencyCode}</span>
                  </div>
                  {order.totalShippingPriceSet?.shopMoney?.amount && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{order.totalShippingPriceSet.shopMoney.amount} {order.totalShippingPriceSet.shopMoney.currencyCode}</span>
                    </div>
                  )}
                  {order.totalTaxSet?.shopMoney?.amount && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{order.totalTaxSet.shopMoney.amount} {order.totalTaxSet.shopMoney.currencyCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{order.totalPriceSet?.shopMoney?.amount} {order.totalPriceSet?.shopMoney?.currencyCode}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Tracking */}
          {order.fulfillments && order.fulfillments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.fulfillments.map((fulfillment: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Fulfillment #{index + 1}</h5>
                        <Badge variant={getStatusColor(fulfillment.status)}>
                          {fulfillment.status}
                        </Badge>
                      </div>
                      {fulfillment.trackingInfo && fulfillment.trackingInfo.length > 0 && (
                        <div className="space-y-2">
                          {fulfillment.trackingInfo.map((tracking: any, trackIndex: number) => (
                            <div key={trackIndex} className="text-sm">
                              {tracking.number && (
                                <p><strong>Tracking #:</strong> {tracking.number}</p>
                              )}
                              {tracking.company && (
                                <p><strong>Carrier:</strong> {tracking.company}</p>
                              )}
                              {tracking.url && (
                                <a 
                                  href={tracking.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  Track Package
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Status & Addresses */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Financial Status</p>
                <Badge variant={getFinancialStatusColor(order.financialStatus)}>
                  {order.financialStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fulfillment Status</p>
                <Badge variant={getStatusColor(order.fulfillmentStatus)}>
                  {order.fulfillmentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                  {order.billingAddress.company && <p>{order.billingAddress.company}</p>}
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>{order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.zip}</p>
                  <p>{order.billingAddress.country}</p>
                  {order.billingAddress.phone && <p>{order.billingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded" />
        <div className="space-y-4">
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    }>
      <OrderDetails params={params} />
    </Suspense>
  );
} 
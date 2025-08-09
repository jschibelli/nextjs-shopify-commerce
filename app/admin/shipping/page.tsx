'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Edit, Eye, Loader2, MapPin, Package, Plus, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShippingZone {
  id: number;
  name: string;
  countries: any[];
  weight_based_shipping_rates: any[];
  price_based_shipping_rates: any[];
}

interface Fulfillment {
  id: number;
  order_id: number;
  status: string;
  tracking_company: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

interface CarrierService {
  id: number;
  name: string;
  service_discovery: boolean;
  carrier_service_type: string;
  active: boolean;
}

interface ShippingData {
  shippingZones: ShippingZone[];
  fulfillments: Fulfillment[];
  carrierServices: CarrierService[];
  stats: {
    totalZones: number;
    totalFulfillments: number;
    pendingFulfillments: number;
    completedFulfillments: number;
    totalCarrierServices: number;
  };
}

export default function ShippingPage() {
  const [data, setData] = useState<ShippingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateFulfillmentOpen, setIsCreateFulfillmentOpen] = useState(false);
  const [newFulfillment, setNewFulfillment] = useState({
    orderId: '',
    lineItems: [],
    trackingCompany: '',
    trackingNumber: '',
    notifyCustomer: true
  });

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/shipping');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipping data');
      }
      
      const shippingData = await response.json();
      setData(shippingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createFulfillment = async () => {
    try {
      const response = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFulfillment),
      });

      if (!response.ok) {
        throw new Error('Failed to create fulfillment');
      }

      setIsCreateFulfillmentOpen(false);
      setNewFulfillment({
        orderId: '',
        lineItems: [],
        trackingCompany: '',
        trackingNumber: '',
        notifyCustomer: true
      });
      await fetchShippingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fulfillment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredFulfillments = data?.fulfillments.filter(fulfillment => {
    const matchesSearch = fulfillment.tracking_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fulfillment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fulfillment.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Fulfillment</h1>
          <p className="text-muted-foreground">
            Manage shipping zones, fulfillments, and carrier services
          </p>
        </div>
        <Dialog open={isCreateFulfillmentOpen} onOpenChange={setIsCreateFulfillmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Fulfillment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Fulfillment</DialogTitle>
              <DialogDescription>
                Create a new fulfillment for an order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="number"
                  value={newFulfillment.orderId}
                  onChange={(e) => setNewFulfillment({...newFulfillment, orderId: e.target.value})}
                  placeholder="Enter order ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trackingCompany">Shipping Company</Label>
                <Input
                  id="trackingCompany"
                  value={newFulfillment.trackingCompany}
                  onChange={(e) => setNewFulfillment({...newFulfillment, trackingCompany: e.target.value})}
                  placeholder="e.g., FedEx, UPS, USPS"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={newFulfillment.trackingNumber}
                  onChange={(e) => setNewFulfillment({...newFulfillment, trackingNumber: e.target.value})}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={newFulfillment.notifyCustomer}
                  onChange={(e) => setNewFulfillment({...newFulfillment, notifyCustomer: e.target.checked})}
                />
                <Label htmlFor="notifyCustomer">Notify customer</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFulfillmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createFulfillment}>Create Fulfillment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipping Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalZones || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fulfillments</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.stats.totalFulfillments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data?.stats.pendingFulfillments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.stats.completedFulfillments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrier Services</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data?.stats.totalCarrierServices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Fulfillments</Label>
          <Input
            id="search"
            placeholder="Search by tracking company or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fulfillments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fulfillments</CardTitle>
          <CardDescription>
            {filteredFulfillments.length} fulfillments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipping Company</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFulfillments.map((fulfillment) => (
                  <TableRow key={fulfillment.id}>
                    <TableCell className="font-medium">
                      #{fulfillment.order_id}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(fulfillment.status)}
                    </TableCell>
                    <TableCell>
                      {fulfillment.tracking_company || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {fulfillment.tracking_number || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {new Date(fulfillment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Zones</CardTitle>
          <CardDescription>
            Configure shipping rates for different regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.shippingZones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{zone.name}</h3>
                  <Badge variant="outline">
                    {zone.countries?.length || 0} countries
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Weight-based rates: {zone.weight_based_shipping_rates?.length || 0}</div>
                  <div>Price-based rates: {zone.price_based_shipping_rates?.length || 0}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carrier Services */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Services</CardTitle>
          <CardDescription>
            Available shipping carriers and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.carrierServices.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{service.name}</h3>
                  <Badge variant={service.active ? 'default' : 'secondary'}>
                    {service.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Type: {service.carrier_service_type}</div>
                  <div>Service Discovery: {service.service_discovery ? 'Yes' : 'No'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredFulfillments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No fulfillments found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first fulfillment to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
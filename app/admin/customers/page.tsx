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
    CheckCircle,
    DollarSign,
    Eye,
    Filter,
    Loader2,
    Mail,
    Search,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  verified_email: boolean;
  accepts_marketing: boolean;
  total_spent: string;
  orders_count: number;
  tags: string;
  note?: string;
  created_at: string;
  updated_at: string;
  default_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
}

interface CustomerStats {
  total: number;
  verified: number;
  acceptsMarketing: number;
  totalSpent: string;
  averageOrderValue: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setStats(data.stats || null);
        if (data.customers?.length === 0) {
          setSuccess('No customers found.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(true);
  };

  const getCustomerValue = (totalSpent: string) => {
    const spent = parseFloat(totalSpent || '0');
    if (spent >= 1000) return 'high';
    if (spent >= 100) return 'medium';
    return 'low';
  };

  const getValueColor = (value: string) => {
    switch (value) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.first_name + ' ' + customer.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">
              Loading customers from Shopify...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading customers...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your store customers
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

      {/* Customer Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Email</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.averageOrderValue}</div>
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
                placeholder="Search customers by name or email..."
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

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {customer.verified_email && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={getValueColor(getCustomerValue(customer.total_spent))}>
                    {getCustomerValue(customer.total_spent)} value
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Spent:</span>
                  <span className="font-medium">${customer.total_spent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Orders:</span>
                  <span className="font-medium">{customer.orders_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span className="font-medium">{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                {customer.accepts_marketing && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Accepts marketing</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Dialog open={isCustomerDialogOpen && selectedCustomer?.id === customer.id} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => openCustomerDialog(customer)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Customer Details - {selectedCustomer?.first_name} {selectedCustomer?.last_name}</DialogTitle>
                      <DialogDescription>
                        Complete customer information and order history
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedCustomer && (
                      <div className="space-y-6">
                        {/* Customer Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Customer Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Name:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                              <p><strong>Email:</strong> {selectedCustomer.email}</p>
                              {selectedCustomer.phone && (
                                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                              )}
                              <p><strong>Verified Email:</strong> {selectedCustomer.verified_email ? 'Yes' : 'No'}</p>
                              <p><strong>Accepts Marketing:</strong> {selectedCustomer.accepts_marketing ? 'Yes' : 'No'}</p>
                              <p><strong>Member Since:</strong> {new Date(selectedCustomer.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Order Summary</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Total Spent:</strong> ${selectedCustomer.total_spent}</p>
                              <p><strong>Orders Count:</strong> {selectedCustomer.orders_count}</p>
                              <p><strong>Average Order Value:</strong> ${selectedCustomer.orders_count > 0 ? (parseFloat(selectedCustomer.total_spent) / selectedCustomer.orders_count).toFixed(2) : '0.00'}</p>
                              <p><strong>Customer Value:</strong> {getCustomerValue(selectedCustomer.total_spent)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Default Address */}
                        {selectedCustomer.default_address && (
                          <div>
                            <h4 className="font-semibold mb-2">Default Address</h4>
                            <div className="text-sm">
                              <p>{selectedCustomer.default_address.first_name} {selectedCustomer.default_address.last_name}</p>
                              <p>{selectedCustomer.default_address.address1}</p>
                              {selectedCustomer.default_address.address2 && (
                                <p>{selectedCustomer.default_address.address2}</p>
                              )}
                              <p>{selectedCustomer.default_address.city}, {selectedCustomer.default_address.province} {selectedCustomer.default_address.zip}</p>
                              <p>{selectedCustomer.default_address.country}</p>
                              {selectedCustomer.default_address.phone && (
                                <p>Phone: {selectedCustomer.default_address.phone}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Customer Note */}
                        {selectedCustomer.note && (
                          <div>
                            <h4 className="font-semibold mb-2">Customer Note</h4>
                            <p className="text-sm">{selectedCustomer.note}</p>
                          </div>
                        )}

                        {/* Tags */}
                        {selectedCustomer.tags && (
                          <div>
                            <h4 className="font-semibold mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCustomer.tags.split(',').map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No customers have registered yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
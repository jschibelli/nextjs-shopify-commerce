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
import { Calendar, Copy, DollarSign, Edit, Loader2, Percent, Plus, Tags, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PriceRule {
  id: number;
  title: string;
  target_type: string;
  target_selection: string;
  allocation_method: string;
  value_type: string;
  value: string;
  customer_selection: string;
  starts_at: string;
  ends_at: string;
  usage_limit: number;
  status: string;
}

interface DiscountCode {
  id: number;
  code: string;
  price_rule_id: number;
  usage_count: number;
  created_at: string;
}

interface DiscountsData {
  priceRules: PriceRule[];
  discountCodes: DiscountCode[];
  stats: {
    totalPriceRules: number;
    totalDiscountCodes: number;
    activeDiscounts: number;
    expiredDiscounts: number;
    scheduledDiscounts: number;
  };
}

export default function DiscountsPage() {
  const [data, setData] = useState<DiscountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    title: '',
    target_type: 'line_item',
    target_selection: 'all',
    allocation_method: 'across',
    value_type: 'percentage',
    value: '',
    customer_selection: 'all',
    starts_at: '',
    ends_at: '',
    usage_limit: '',
    discount_codes: [{ code: '', usage_limit: '' }]
  });

  useEffect(() => {
    fetchDiscountsData();
  }, []);

  const fetchDiscountsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/discounts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch discounts data');
      }
      
      const discountsData = await response.json();
      setData(discountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async () => {
    try {
      const response = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiscount),
      });

      if (!response.ok) {
        throw new Error('Failed to create discount');
      }

      setIsCreateDialogOpen(false);
      setNewDiscount({
        title: '',
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: '',
        customer_selection: 'all',
        starts_at: '',
        ends_at: '',
        usage_limit: '',
        discount_codes: [{ code: '', usage_limit: '' }]
      });
      await fetchDiscountsData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discount');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPriceRules = data?.priceRules.filter(rule => {
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
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
          <h1 className="text-3xl font-bold tracking-tight">Discounts & Promotions</h1>
          <p className="text-muted-foreground">
            Manage your store's discounts, promotions, and discount codes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>
                Create a new discount rule with optional discount codes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newDiscount.title}
                  onChange={(e) => setNewDiscount({...newDiscount, title: e.target.value})}
                  placeholder="Enter discount title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="value_type">Type</Label>
                  <Select 
                    value={newDiscount.value_type} 
                    onValueChange={(value) => setNewDiscount({...newDiscount, value_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                    placeholder={newDiscount.value_type === 'percentage' ? '10' : '5.00'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="starts_at">Start Date</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={newDiscount.starts_at}
                    onChange={(e) => setNewDiscount({...newDiscount, starts_at: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ends_at">End Date</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={newDiscount.ends_at}
                    onChange={(e) => setNewDiscount({...newDiscount, ends_at: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount_code">Discount Code (Optional)</Label>
                <Input
                  id="discount_code"
                  value={newDiscount.discount_codes[0].code}
                  onChange={(e) => setNewDiscount({
                    ...newDiscount, 
                    discount_codes: [{...newDiscount.discount_codes[0], code: e.target.value}]
                  })}
                  placeholder="SUMMER2024"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createDiscount}>Create Discount</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalPriceRules || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount Codes</CardTitle>
            <Tags className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.stats.totalDiscountCodes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Tags className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.stats.activeDiscounts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data?.stats.scheduledDiscounts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Tags className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.stats.expiredDiscounts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Discounts</Label>
          <Input
            id="search"
            placeholder="Search by title..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Rules</CardTitle>
          <CardDescription>
            {filteredPriceRules.length} rules found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPriceRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {rule.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {rule.value_type === 'percentage' ? (
                          <Percent className="h-4 w-4 text-blue-500" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-500" />
                        )}
                        <span className="capitalize">{rule.value_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.value_type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(rule.status)}
                    </TableCell>
                    <TableCell>
                      {rule.usage_limit ? `${rule.usage_limit} uses` : 'Unlimited'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Start: {new Date(rule.starts_at).toLocaleDateString()}</div>
                        {rule.ends_at && (
                          <div>End: {new Date(rule.ends_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
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

      {/* Discount Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
          <CardDescription>
            {data?.discountCodes.length || 0} codes available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.discountCodes.map((code) => (
              <div key={code.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {code.code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Usage: {code.usage_count}</div>
                  <div>Created: {new Date(code.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredPriceRules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tags className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No discounts found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first discount to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
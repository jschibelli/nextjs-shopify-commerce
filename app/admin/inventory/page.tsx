'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Loader2, MapPin, Package, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InventoryData {
  locations: any[];
  inventoryLevels: any[];
  inventoryItems: any[];
  stats: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalLocations: number;
  };
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<{ itemId: string; locationId: string; title: string } | null>(null);
  const [editAvailable, setEditAvailable] = useState<number>(0);
  const router = useRouter();
  const { toast, toasts } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const inventoryData = await response.json();
      setData(inventoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryLevel = async (inventoryItemId: string, locationId: string, available: number) => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryItemId,
          locationId,
          available,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Refresh data after update
      await fetchInventoryData();
      toast({ title: 'Inventory updated', description: `${editing?.title || 'Item'}: ${available} available` });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
      toast({ title: 'Inventory update failed', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  const filteredItems = data?.inventoryItems.filter(item => {
    const matchesSearch = item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || 
                          item.inventory_levels?.some((level: any) => level.location_id.toString() === selectedLocation);
    return matchesSearch && matchesLocation;
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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your product inventory across all locations
          </p>
        </div>
        <Button onClick={fetchInventoryData} variant="outline">
          <Package className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data?.stats.lowStockItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.stats.outOfStockItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalLocations || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Items</Label>
          <Input
            id="search"
            placeholder="Search by SKU or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="location">Location</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {data?.locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredItems.length} items found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.title || 'Untitled Item'}
                    </TableCell>
                    <TableCell>{item.sku || 'No SKU'}</TableCell>
                    <TableCell>
                      {item.inventory_levels?.map((level: any, index: number) => {
                        const location = data?.locations.find(loc => loc.id === level.location_id);
                        return (
                          <div key={index} className="text-sm">
                            {location?.name || 'Unknown Location'}
                          </div>
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      {item.inventory_levels?.map((level: any, index: number) => (
                        <div key={index} className="text-sm">
                          {level.available}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {item.inventory_levels?.map((level: any, index: number) => {
                        let status = 'In Stock';
                        let variant = 'default';
                        
                        if (level.available === 0) {
                          status = 'Out of Stock';
                          variant = 'destructive';
                        } else if (level.available < 10) {
                          status = 'Low Stock';
                          variant = 'secondary';
                        }
                        
                        return (
                          <Badge key={index} variant={variant as any}>
                            {status}
                          </Badge>
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // choose first level for quick edit; in real UI you'd list levels
                          const level = item.inventory_levels?.[0];
                          if (!level) return;
                          setEditing({ itemId: item.id, locationId: level.location_id?.toString?.() || level.location_id, title: item.title || 'Untitled Item' });
                          setEditAvailable(level.available || 0);
                          setIsEditOpen(true);
                        }}
                        aria-label={`Edit ${item.title || 'item'}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>
            Manage your inventory locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.locations.map((location) => (
              <div key={location.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address1}, {location.city}
                    </p>
                  </div>
                  <Badge variant={location.active ? 'default' : 'secondary'}>
                    {location.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Inventory Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
            <DialogDescription>
              {editing?.title} — Update available quantity for the selected location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Label htmlFor="available">Available</Label>
            <Input
              id="available"
              type="number"
              value={editAvailable}
              onChange={(e) => setEditAvailable(parseInt(e.target.value) || 0)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editing) return;
                await updateInventoryLevel(editing.itemId, editing.locationId, editAvailable);
                setIsEditOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`min-w-[240px] rounded border p-3 shadow bg-white ${t.variant === 'destructive' ? 'border-red-300' : 'border-gray-200'}`}>
            <div className="font-medium">{t.title}</div>
            {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
} 
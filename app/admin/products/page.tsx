'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    Bug,
    Check,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Eye,
    Filter,
    Image as ImageIcon,
    Loader2,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: any[];
  images: any[];
  created_at: string;
  updated_at: string;
  published_at: string;
  body_html?: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
}

interface ProductFormData {
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  tags: string;
  status: string;
  price: string;
  compare_at_price: string;
  inventory_quantity: number;
  sku: string;
  barcode: string;
  weight: string;
  weight_unit: string;
  requires_shipping: boolean;
  taxable: boolean;
  seo_title: string;
  seo_description: string;
  handle: string;
  images: Array<{
    id?: string;
    src: string;
    alt?: string;
    position?: number;
  }>;
}

const DEMO_CREATED_KEY = 'demo_products_created';
const DEMO_UPDATED_KEY = 'demo_products_updated'; // id -> partial product
const DEMO_DELETED_KEY = 'demo_products_deleted'; // string[]

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [originalImages, setOriginalImages] = useState<any[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    vendor: '',
    product_type: '',
    tags: '',
    status: 'draft',
    price: '0.00',
    compare_at_price: '',
    inventory_quantity: 0,
    sku: '',
    barcode: '',
    weight: '',
    weight_unit: 'kg',
    requires_shipping: true,
    taxable: true,
    seo_title: '',
    seo_description: '',
    handle: '',
    images: []
  });

  useEffect(() => {
    // Detect demo admin session via API
    const detect = async () => {
      try {
        const res = await fetch('/api/auth/check-session');
        if (res.ok) {
          const data = await res.json();
          const demo = !!data.isDemo && !!data.isStaffMember; // demo admin only
          setIsDemo(demo);
          fetchProducts(demo);
          return;
        }
      } catch {}
      setIsDemo(false);
      fetchProducts(false);
    };
    detect();
  }, []);

  const testAuth = async () => {
    try {
      const response = await fetch('/api/admin/test-auth');
      const data = await response.json();
      setDebugInfo(data);
      console.log('Auth test result:', data);
    } catch (error) {
      console.error('Auth test error:', error);
      setDebugInfo({ error: 'Failed to test authentication' });
    }
  };

  const overlayWithDemoData = (base: Product[]): Product[] => {
    if (!isDemo) return base;
    const created = readJson<Product[]>(DEMO_CREATED_KEY, []);
    const updated = readJson<Record<string, Partial<Product>>>(DEMO_UPDATED_KEY, {});
    const deleted = readJson<string[]>(DEMO_DELETED_KEY, []);

    // Filter deleted
    const filtered = base.filter(p => !deleted.includes(p.id));
    // Apply updates
    const merged = filtered.map(p => (updated[p.id] ? { ...p, ...updated[p.id] } as Product : p));
    // Append created
    return [...created, ...merged];
  };

  const fetchProducts = async (demoFlag = isDemo) => {
    setIsLoading(true);
    setError(null);
    try {
      let response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        const list = data.products || [];
        const overlaid = demoFlag ? overlayWithDemoData(list) : list;
        setProducts(overlaid);
        if (overlaid.length === 0) {
          setSuccess('No products found. Create your first product to get started!');
        }
        return;
      }
      if (response.status === 403) {
        console.log('Admin API failed, trying read-only Storefront API...');
        response = await fetch('/api/admin/products/readonly');
        if (response.ok) {
          const data = await response.json();
          const list = data.products || [];
          const overlaid = demoFlag ? overlayWithDemoData(list) : list;
          setProducts(overlaid);
          setSuccess(data.message || 'Products loaded in read-only mode. Set up Admin API permissions for full functionality.');
          return;
        }
      }
      const errorData = await response.json();
      if (response.status === 403) {
        setError('API permissions required. Please ensure your Shopify app has the following scopes: read_products, write_products.');
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(errorData.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const persistCreateDemo = (product: Product) => {
    const created = readJson<Product[]>(DEMO_CREATED_KEY, []);
    writeJson(DEMO_CREATED_KEY, [product, ...created]);
  };

  const persistUpdateDemo = (product: Product) => {
    const updated = readJson<Record<string, Partial<Product>>>(DEMO_UPDATED_KEY, {});
    updated[product.id] = { ...updated[product.id], ...product };
    writeJson(DEMO_UPDATED_KEY, updated);
  };

  const persistDeleteDemo = (productId: string) => {
    // Remove from created if it was a demo-created product
    const created = readJson<Product[]>(DEMO_CREATED_KEY, []);
    const remainingCreated = created.filter(p => p.id !== productId);
    writeJson(DEMO_CREATED_KEY, remainingCreated);
    // Mark as deleted (so base products are hidden)
    const deleted = readJson<string[]>(DEMO_DELETED_KEY, []);
    if (!deleted.includes(productId)) {
      deleted.push(productId);
      writeJson(DEMO_DELETED_KEY, deleted);
    }
    // Remove any pending updates for this id
    const updated = readJson<Record<string, Partial<Product>>>(DEMO_UPDATED_KEY, {});
    if (updated[productId]) {
      delete updated[productId];
      writeJson(DEMO_UPDATED_KEY, updated);
    }
  };

  const handleCreateProduct = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          vendor: '',
          product_type: '',
          tags: '',
          status: 'draft',
          price: '0.00',
          compare_at_price: '',
          inventory_quantity: 0,
          sku: '',
          barcode: '',
          weight: '',
          weight_unit: 'kg',
          requires_shipping: true,
          taxable: true,
          seo_title: '',
          seo_description: '',
          handle: '',
          images: []
        });
        setSuccess(`Product "${data.product.title}" created successfully!`);
        if (data.demo || isDemo) {
          persistCreateDemo(data.product as Product);
          setProducts(prev => [data.product as Product, ...prev]);
        } else {
          fetchProducts();
        }
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('API permissions required. Please ensure your Shopify app has write_products scope.');
        } else {
          setError(errorData.error || 'Failed to create product');
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    setError(null);
    try {
      const { images, ...productUpdateData } = formData;
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productUpdateData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        const data = await response.json();

        // handle images omitted in demo overlay for simplicity
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        setOriginalImages([]);
        setFormData({
          title: '',
          description: '',
          vendor: '',
          product_type: '',
          tags: '',
          status: 'draft',
          price: '0.00',
          compare_at_price: '',
          inventory_quantity: 0,
          sku: '',
          barcode: '',
          weight: '',
          weight_unit: 'kg',
          requires_shipping: true,
          taxable: true,
          seo_title: '',
          seo_description: '',
          handle: '',
          images: []
        });
        setSuccess(`Product "${data.product.title}" updated successfully!`);
        if (data.demo || isDemo) {
          const updated = data.product as Product;
          persistUpdateDemo(updated);
          setProducts(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
        } else {
          fetchProducts();
        }
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('API permissions required. Please ensure your Shopify app has write_products scope.');
        } else {
          setError(errorData.error || 'Failed to update product');
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(`Product "${productTitle}" deleted successfully!`);
        if ((await response.clone().json().catch(() => ({}))).demo || isDemo) {
          persistDeleteDemo(productId);
          setProducts(prev => prev.filter(p => p.id !== productId));
        } else {
          fetchProducts();
        }
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('API permissions required. Please ensure your Shopify app has write_products scope.');
        } else {
          setError(errorData.error || 'Failed to delete product');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Network error. Please try again.');
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    const firstVariant = product.variants?.[0] || {};
    const originalProductImages = (product.images || []).map((img: any) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || '',
      position: img.position || 0
    }));
    setOriginalImages(originalProductImages);
    setFormData({
      title: product.title,
      description: product.body_html || product.description || '',
      vendor: product.vendor || '',
      product_type: product.product_type || '',
      tags: product.tags || '',
      status: product.status,
      price: firstVariant.price || '0.00',
      compare_at_price: firstVariant.compare_at_price || '',
      inventory_quantity: firstVariant.inventory_quantity || 0,
      sku: firstVariant.sku || '',
      barcode: firstVariant.barcode || '',
      weight: firstVariant.weight || '',
      weight_unit: firstVariant.weight_unit || 'kg',
      requires_shipping: firstVariant.requires_shipping !== false,
      taxable: firstVariant.taxable !== false,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      handle: product.handle || '',
      images: originalProductImages
    });
    setIsEditDialogOpen(true);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(p => p.id));
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Loading products from Shopify...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store products{isDemo ? ' (Demo Mode: changes are simulated and stored locally)' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testAuth}>
            <Bug className="h-4 w-4 mr-2" />
            Test Auth
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/test-image-upload');
                const data = await response.json();
                console.log('Image upload test result:', data);
                setDebugInfo(data);
              } catch (error) {
                console.error('Image upload test error:', error);
                setDebugInfo({ error: 'Failed to test image upload' });
              }
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Test Image Upload
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your store
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const res = await fetch('/api/ai/generate-description', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: formData.title,
                            vendor: formData.vendor,
                            productType: formData.product_type,
                            tags: formData.tags
                          })
                        })
                        const json = await res.json()
                        if (json.description) {
                          setFormData(prev => ({ ...prev, description: json.description }))
                        }
                      }}
                    >
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product_type">Product Type</Label>
                    <Input
                      id="product_type"
                      value={formData.product_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Authentication Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold text-gray-600">
                  {products.filter(p => p.status === 'archived').length}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Package className="h-4 w-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            selectedProducts.forEach(productId => {
                              const product = products.find(p => p.id === productId);
                              if (product) {
                                handleDeleteProduct(productId, product.title);
                              }
                            });
                            setSelectedProducts([]);
                          }}>
                            Delete Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden border">
                        <img
                          src={product.images[0].src}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{product.title}</div>
                      {product.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.tags.split(',').slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                          {product.tags.split(',').length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.tags.split(',').length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.vendor || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.product_type || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.variants?.length || 0} variants
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id, product.title)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                </span>
                <div className="flex items-center gap-2">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-input bg-background px-2 py-1 text-sm rounded"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProducts.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first product.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Product title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-description">Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const res = await fetch('/api/ai/generate-description', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: formData.title,
                            vendor: formData.vendor,
                            productType: formData.product_type,
                            tags: formData.tags
                          })
                        })
                        const json = await res.json()
                        if (json.description) {
                          setFormData(prev => ({ ...prev, description: json.description }))
                        }
                      }}
                    >
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-vendor">Vendor</Label>
                    <Input
                      id="edit-vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      placeholder="Product vendor"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-product_type">Product Type</Label>
                    <Input
                      id="edit-product_type"
                      value={formData.product_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
                      placeholder="e.g., Shirt, Book, etc."
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Comma-separated tags"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-handle">URL Handle</Label>
                  <Input
                    id="edit-handle"
                    value={formData.handle}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder="product-url-handle"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Price *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-compare-price">Compare at Price</Label>
                    <Input
                      id="edit-compare-price"
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                      placeholder="Original price"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-inventory">Inventory Quantity</Label>
                    <Input
                      id="edit-inventory"
                      type="number"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, inventory_quantity: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Stock keeping unit"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-barcode">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Barcode (ISBN, UPC, etc.)"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-weight">Weight</Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-weight-unit">Weight Unit</Label>
                    <select
                      id="edit-weight-unit"
                      value={formData.weight_unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-requires-shipping"
                    checked={formData.requires_shipping}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_shipping: checked }))}
                  />
                  <Label htmlFor="edit-requires-shipping">This product requires shipping</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-taxable"
                    checked={formData.taxable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: checked }))}
                  />
                  <Label htmlFor="edit-taxable">This product is taxable</Label>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Engine Optimization</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-seo-title">Page Title</Label>
                  <Input
                    id="edit-seo-title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO page title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-seo-description">Meta Description</Label>
                  <Textarea
                    id="edit-seo-description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="SEO meta description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Product Status</Label>
                  <select
                    id="edit-status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Images</h3>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="grid gap-2">
                  <Label>Add Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file, index) => {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const newImage = {
                              src: e.target?.result as string,
                              alt: file.name,
                              position: formData.images.length + index
                            };
                            setFormData(prev => ({
                              ...prev,
                              images: [...prev.images, newImage]
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Trigger file input
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          files.forEach((file, index) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const newImage = {
                                src: e.target?.result as string,
                                alt: file.name,
                                position: formData.images.length + index
                              };
                              setFormData(prev => ({
                                ...prev,
                                images: [...prev.images, newImage]
                              }));
                            };
                            reader.readAsDataURL(file);
                          });
                        };
                        input.click();
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Image Gallery */}
                {formData.images.length > 0 && (
                  <div className="space-y-3">
                    <Label>Product Images ({formData.images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                            <img
                              src={image.src}
                              alt={image.alt || `Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Image Controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                // Move image up
                                if (index > 0) {
                                  const newImages = [...formData.images];
                                  const temp = newImages[index];
                                  const prevImage = newImages[index - 1];
                                  if (temp && prevImage) {
                                    newImages[index] = prevImage;
                                    newImages[index - 1] = temp;
                                    setFormData(prev => ({ ...prev, images: newImages }));
                                  }
                                }
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                // Move image down
                                if (index < formData.images.length - 1) {
                                  const newImages = [...formData.images];
                                  const temp = newImages[index];
                                  const nextImage = newImages[index + 1];
                                  if (temp && nextImage) {
                                    newImages[index] = nextImage;
                                    newImages[index + 1] = temp;
                                    setFormData(prev => ({ ...prev, images: newImages }));
                                  }
                                }
                              }}
                              disabled={index === formData.images.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                // Remove image
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          
                          {/* Position Badge */}
                          <div className="absolute top-1 left-1">
                            <Badge variant="secondary" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Drag images to reorder. The first image will be the main product image.
                    </p>
                  </div>
                )}

                {/* No Images State */}
                {formData.images.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">No images uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      Upload product images to showcase your product
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
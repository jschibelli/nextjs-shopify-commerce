'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Eye, EyeOff, FolderOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Collection {
  id: number;
  title: string;
  body_html: string;
  collection_type: 'manual' | 'smart';
  published_at: string | null;
  products_count: number;
  handle: string;
  updated_at: string;
}

interface CollectionsData {
  collections: Collection[];
  stats: {
    total: number;
    manual: number;
    automated: number;
    published: number;
    draft: number;
  };
}

export default function CollectionsPage() {
  const [data, setData] = useState<CollectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    collection_type: 'manual',
    published: false,
    template_suffix: ''
  });

  useEffect(() => {
    fetchCollectionsData();
  }, []);

  const fetchCollectionsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/collections');
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections data');
      }
      
      const collectionsData = await response.json();
      setData(collectionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    try {
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCollection),
      });

      if (!response.ok) {
        throw new Error('Failed to create collection');
      }

      setIsCreateDialogOpen(false);
      setNewCollection({
        title: '',
        description: '',
        collection_type: 'manual',
        published: false,
        template_suffix: ''
      });
      await fetchCollectionsData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    }
  };

  const filteredCollections = data?.collections.filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || collection.collection_type === filterType;
    return matchesSearch && matchesType;
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
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Organize your products into collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Add a new collection to organize your products.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newCollection.title}
                  onChange={(e) => setNewCollection({...newCollection, title: e.target.value})}
                  placeholder="Enter collection title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                  placeholder="Enter collection description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newCollection.collection_type} 
                  onValueChange={(value) => setNewCollection({...newCollection, collection_type: value as 'manual' | 'smart'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="smart">Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={newCollection.published}
                  onChange={(e) => setNewCollection({...newCollection, published: e.target.checked})}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCollection}>Create Collection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.stats.manual || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.stats.automated || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.stats.published || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <EyeOff className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{data?.stats.draft || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Collections</Label>
          <Input
            id="search"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="type">Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="smart">Automated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{collection.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={collection.collection_type === 'manual' ? 'default' : 'secondary'}>
                    {collection.collection_type === 'manual' ? 'Manual' : 'Automated'}
                  </Badge>
                  <Badge variant={collection.published_at ? 'default' : 'secondary'}>
                    {collection.published_at ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {collection.products_count} products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {collection.body_html ? collection.body_html.replace(/<[^>]*>/g, '') : 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Handle: {collection.handle}</span>
                  <span>Updated: {new Date(collection.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first collection to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
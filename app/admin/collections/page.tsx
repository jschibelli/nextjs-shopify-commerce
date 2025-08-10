'use client';

import DataTable, { Column, Pagination } from '@/components/admin/DataTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialogContent as ADContent, AlertDialogDescription as ADDescription, AlertDialogFooter as ADFooter, AlertDialogHeader as ADHeader, AlertDialogTitle as ADTitle, AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { EyeOff, FolderOpen, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Collection {
  id: number | string;
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

const DEMO_COLLECTIONS_CREATED = 'demo_collections_created';
const DEMO_COLLECTIONS_EDITED = 'demo_collections_edited';
const DEMO_COLLECTIONS_DELETED = 'demo_collections_deleted';

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
    collection_type: 'manual' as 'manual' | 'smart',
    published: false,
    template_suffix: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { toast, toasts } = useToast();

  // Session flags
  const [isDemo, setIsDemo] = useState(false);
  const [isStaffMember, setIsStaffMember] = useState(false);

  // Edit modal state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', published: false, templateSuffix: '', seoTitle: '', seoDescription: '' });

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/check-session');
        const info = res.ok ? await res.json() : { isDemo: false, isStaffMember: false };
        setIsDemo(!!info.isDemo);
        setIsStaffMember(!!info.isStaffMember);
      } catch {}
      await fetchCollectionsData();
    };
    init();
  }, []);

  const applyDemoOverlay = (collections: Collection[]): Collection[] => {
    if (!(isDemo && !isStaffMember)) return collections;
    const created = readJson<Collection[]>(DEMO_COLLECTIONS_CREATED, []);
    const edited = readJson<Record<string, Partial<Collection>> | Array<any>>(DEMO_COLLECTIONS_EDITED, {});
    const deleted = new Set(readJson<Array<string | number>>(DEMO_COLLECTIONS_DELETED, []));

    // Normalize edited map
    const editedMap: Record<string, Partial<Collection>> = Array.isArray(edited)
      ? Object.fromEntries((edited as any[]).map((e) => [String(e.id), e]))
      : (edited as Record<string, Partial<Collection>>);

    // Combine
    const combined = [...created, ...collections];

    // Apply edits
    const withEdits = combined.map((c) => {
      const patch = editedMap[String(c.id)];
      if (!patch) return c;
      return {
        ...c,
        ...patch,
        updated_at: new Date().toISOString(),
        // If published boolean was toggled, reflect into published_at
        published_at: (patch as any).published === undefined
          ? (patch.published_at !== undefined ? patch.published_at! : c.published_at)
          : ((patch as any).published ? new Date().toISOString() : null),
      } as Collection;
    });

    // Apply deletes
    const filtered = withEdits.filter((c) => !deleted.has(c.id));
    return filtered;
  };

  const fetchCollectionsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/collections');
      if (!response.ok) throw new Error('Failed to fetch collections data');
      const collectionsData = await response.json();
      const overlaid = applyDemoOverlay(collectionsData.collections || []);
      setData({ ...collectionsData, collections: overlaid });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    try {
      // Demo non-staff: simulate locally
      if (isDemo && !isStaffMember) {
        const now = Date.now();
        const createdCollection: Collection = {
          id: now,
          title: newCollection.title,
          body_html: newCollection.description || '',
          collection_type: newCollection.collection_type,
          published_at: newCollection.published ? new Date(now).toISOString() : null,
          products_count: 0,
          handle: (newCollection.title || 'demo-collection').toLowerCase().replace(/\s+/g, '-'),
          updated_at: new Date(now).toISOString(),
        };
        const existing = readJson<Collection[]>(DEMO_COLLECTIONS_CREATED, []);
        writeJson(DEMO_COLLECTIONS_CREATED, [createdCollection, ...existing]);
        setIsCreateDialogOpen(false);
        setNewCollection({ title: '', description: '', collection_type: 'manual', published: false, template_suffix: '' });
        // Update view without refetch
        setData((prev) => (prev ? { ...prev, collections: [createdCollection, ...(prev.collections || [])] } : prev));
        toast({ title: 'Collection created', description: createdCollection.title });
        return;
      }

      // Admin/staff: call API
      const response = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection),
      });
      if (!response.ok) throw new Error('Failed to create collection');
      setIsCreateDialogOpen(false);
      setNewCollection({ title: '', description: '', collection_type: 'manual', published: false, template_suffix: '' });
      await fetchCollectionsData();
      toast({ title: 'Collection created' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      toast({ title: 'Create failed', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    }
  };

  const filteredCollectionsAll = (data?.collections || []).filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || collection.collection_type === filterType;
    return matchesSearch && matchesType;
  });
  const start = (page - 1) * pageSize;
  const filteredCollections = filteredCollectionsAll.slice(start, start + pageSize);
  const pagination: Pagination = { page, pageSize, total: filteredCollectionsAll.length };
  
  const columns: Column<Collection>[] = [
    { key: 'title', header: 'Title' },
    { key: 'handle', header: 'Handle' },
    { key: 'products_count', header: 'Product Count' },
    { key: 'updated_at', header: 'Updated', render: c => new Date(c.updated_at).toLocaleDateString() },
  ];

  const handleEdit = async (row: Collection) => {
    setEditingCollection(row);
    setEditForm({
      title: row.title,
      description: row.body_html || '',
      published: !!row.published_at,
      templateSuffix: '',
      seoTitle: '',
      seoDescription: ''
    });
    setIsEditDialogOpen(true);
  };
  
  const submitEdit = async () => {
    if (!editingCollection) return;
    try {
      // Demo non-staff: persist to local edited map
      if (isDemo && !isStaffMember) {
        const edited = readJson<Record<string, Partial<Collection>>>(DEMO_COLLECTIONS_EDITED, {});
        const patch: Partial<Collection> = {
          title: editForm.title,
          body_html: editForm.description,
          published_at: editForm.published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
        edited[String(editingCollection.id)] = patch;
        writeJson(DEMO_COLLECTIONS_EDITED, edited);
        // Update UI
        setData((prev) => {
          if (!prev) return prev;
          const overlaid = applyDemoOverlay(prev.collections || []);
          return { ...prev, collections: overlaid };
        });
        toast({ title: 'Collection updated', description: editForm.title });
        setIsEditDialogOpen(false);
        setEditingCollection(null);
        return;
      }

      // Admin/staff: call API
      const body: any = {
        title: editForm.title,
        body_html: editForm.description,
        published: editForm.published,
      };
      if (editForm.templateSuffix) body.template_suffix = editForm.templateSuffix;
      if (editForm.seoTitle || editForm.seoDescription) {
        body.seo = { title: editForm.seoTitle || undefined, description: editForm.seoDescription || undefined };
      }

      const res = await fetch(`/api/admin/collections/${editingCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await res.json().catch(() => ({} as any));

      if (!res.ok) throw new Error(payload.error || 'Update failed');

      await fetchCollectionsData();
      toast({ title: 'Collection updated', description: editForm.title });
      setIsEditDialogOpen(false);
      setEditingCollection(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };
  
  const handleDelete = async (row: Collection) => {
    setCollectionToDelete(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!collectionToDelete) return;
    try {
      // Demo non-staff: mutate local storage
      if (isDemo && !isStaffMember) {
        // If it was a created item, remove it from created list
        const created = readJson<Collection[]>(DEMO_COLLECTIONS_CREATED, []);
        const remainingCreated = created.filter((c) => c.id !== collectionToDelete.id);
        writeJson(DEMO_COLLECTIONS_CREATED, remainingCreated);
        // Mark as deleted otherwise
        if (created.length === remainingCreated.length) {
          const deleted = new Set(readJson<Array<string | number>>(DEMO_COLLECTIONS_DELETED, []));
          deleted.add(collectionToDelete.id);
          writeJson(DEMO_COLLECTIONS_DELETED, Array.from(deleted));
        }
        // Remove any edit patches
        const edited = readJson<Record<string, Partial<Collection>>>(DEMO_COLLECTIONS_EDITED, {});
        if (edited[String(collectionToDelete.id)]) {
          delete edited[String(collectionToDelete.id)];
          writeJson(DEMO_COLLECTIONS_EDITED, edited);
        }
        // Update UI
        setData((prev) => prev ? { ...prev, collections: (prev.collections || []).filter((c) => c.id !== collectionToDelete.id) } : prev);
        toast({ title: 'Collection deleted', description: collectionToDelete.title });
        setIsDeleteOpen(false);
        setCollectionToDelete(null);
        return;
      }

      // Admin/staff: call API
      const res = await fetch(`/api/admin/collections/${collectionToDelete.id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(payload.error || 'Delete failed');

      await fetchCollectionsData();
      toast({ title: 'Collection deleted', description: collectionToDelete.title });
      setIsDeleteOpen(false);
      setCollectionToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };

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
                <Input id="title" value={newCollection.title} onChange={(e) => setNewCollection({...newCollection, title: e.target.value})} placeholder="Enter collection title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={newCollection.description} onChange={(e) => setNewCollection({...newCollection, description: e.target.value})} placeholder="Enter collection description" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newCollection.collection_type} onValueChange={(value) => setNewCollection({...newCollection, collection_type: value as 'manual' | 'smart'})}>
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
                <input type="checkbox" id="published" checked={newCollection.published} onChange={(e) => setNewCollection({...newCollection, published: e.target.checked})} />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
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
            <EyeOff className="h-4 w-4 text-green-500" />
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
          <Input id="search" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      {/* Collections Table */}
      <DataTable<Collection>
        columns={columns}
        data={filteredCollections}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearchTerm}
        searchPlaceholder="Search by title or handle"
      />

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingCollection(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>Update the collection details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={editingCollection?.collection_type || 'manual'} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="smart">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-template">Template suffix</Label>
              <Input id="edit-template" placeholder="e.g. custom" value={editForm.templateSuffix} onChange={(e) => setEditForm({ ...editForm, templateSuffix: e.target.value })} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="edit-published" checked={editForm.published} onChange={(e) => setEditForm({ ...editForm, published: e.target.checked })} />
              <Label htmlFor="edit-published">Published</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-seo-title">SEO Title</Label>
              <Input id="edit-seo-title" value={editForm.seoTitle} onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-seo-description">SEO Description</Label>
              <Textarea id="edit-seo-description" rows={3} value={editForm.seoDescription} onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingCollection(null); }}>Cancel</Button>
            <Button onClick={submitEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => { setIsDeleteOpen(open); if (!open) setCollectionToDelete(null); }}>
        <ADContent>
          <ADHeader>
            <ADTitle>Delete collection</ADTitle>
            <ADDescription>
              Are you sure you want to delete{collectionToDelete ? ` "${collectionToDelete.title}"` : ''}? This action cannot be undone.
            </ADDescription>
          </ADHeader>
          <ADFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </ADFooter>
        </ADContent>
      </AlertDialog>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`min-w-[240px] rounded border p-3 shadow bg-white ${t.variant === 'destructive' ? 'border-red-300' : 'border-gray-200'}`}>
            <div className="font-medium">{t.title}</div>
            {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
          </div>
        ))}
      </div>

      {filteredCollections.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters' : 'Create your first collection to get started'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
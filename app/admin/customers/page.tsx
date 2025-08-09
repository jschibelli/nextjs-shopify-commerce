'use client';

import DataTable, { Column, Pagination } from '@/components/admin/DataTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  verified_email: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { toast, toasts, dismiss } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      const mapped = (data.customers || []).map((c: any) => ({
        id: String(c.id),
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        verified_email: !!c.verified_email,
        created_at: c.created_at,
      }));
      setRows(mapped);
      setTotal(mapped.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = q
      ? rows.filter(r => `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
      : rows;
    setTotal(all.length);
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }, [rows, search, page, pageSize]);

  const columns: Column<CustomerRow>[] = [
    { key: 'first_name', header: 'Name', render: r => `${r.first_name} ${r.last_name}` },
    { key: 'email', header: 'Email' },
    { key: 'created_at', header: 'Created', render: r => new Date(r.created_at).toLocaleDateString() },
    { key: 'verified_email', header: 'Status', render: r => (r.verified_email ? 'Verified' : 'Unverified') },
  ];

  const pagination: Pagination = { page, pageSize, total };

  const handleEdit = async (row: CustomerRow) => {
    try {
      const res = await fetch(`/api/admin/customers/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: row.first_name, last_name: row.last_name }),
      });
      const payload = await res.json().catch(() => ({}));
      if (payload.demo) return; // simulated
      if (!res.ok) throw new Error(payload.error || 'Update failed');
      // success: refresh
      fetchCustomers();
      toast({ title: 'Customer updated', description: `${row.first_name} ${row.last_name}` });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (row: CustomerRow) => {
    try {
      const res = await fetch(`/api/admin/customers/${row.id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({}));
      if (payload.demo || res.ok) {
        setRows(prev => prev.filter(r => r.id !== row.id));
        setTotal(prev => Math.max(0, prev - 1));
        toast({ title: 'Customer deleted', description: row.email });
        return;
      }
      if (!res.ok) throw new Error(payload.error || 'Delete failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading customers...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page size</span>
          <Input className="w-20" type="number" value={pageSize} onChange={(e) => setPageSize(Math.max(1, parseInt(e.target.value) || 10))} />
        </div>
      </div>
      <DataTable<CustomerRow>
        columns={columns}
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search by name or email"
      />
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
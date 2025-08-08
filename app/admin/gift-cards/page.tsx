'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    Calendar,
    CreditCard,
    DollarSign,
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface GiftCard {
  id: string;
  code: string;
  initial_value: string;
  balance: string;
  note?: string;
  expires_on?: string;
  disabled_at?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface GiftCardStats {
  total: number;
  active: number;
  disabled: number;
  expired: number;
  depleted: number;
  totalValue: number;
  totalIssued: number;
}

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [stats, setStats] = useState<GiftCardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Create gift card form state
  const [createForm, setCreateForm] = useState({
    initial_value: '',
    note: '',
    expires_on: '',
    customer_id: '',
    send_email: false
  });

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/gift-cards?${params}`);
      if (!response.ok) throw new Error('Failed to fetch gift cards');

      const data = await response.json();
      setGiftCards(data.gift_cards);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gift cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, [statusFilter, searchTerm]);

  const handleCreateGiftCard = async () => {
    try {
      setIsCreateLoading(true);
      const response = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) throw new Error('Failed to create gift card');

      setIsCreateDialogOpen(false);
      setCreateForm({
        initial_value: '',
        note: '',
        expires_on: '',
        customer_id: '',
        send_email: false
      });
      fetchGiftCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift card');
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleGiftCardAction = async (id: string, action: string) => {
    try {
      const response = await fetch('/api/admin/gift-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} gift card`);
      fetchGiftCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} gift card`);
    }
  };

  const getStatusBadge = (card: GiftCard) => {
    if (card.disabled_at) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (card.expires_on && new Date(card.expires_on) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (parseFloat(card.balance) === 0) {
      return <Badge variant="outline">Depleted</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-muted-foreground">
            Manage gift cards, track balances, and monitor usage
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Gift Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Gift Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initial_value">Initial Value</Label>
                <Input
                  id="initial_value"
                  type="number"
                  placeholder="50.00"
                  value={createForm.initial_value}
                  onChange={(e) => setCreateForm({...createForm, initial_value: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Holiday gift card for valued customer"
                  value={createForm.note}
                  onChange={(e) => setCreateForm({...createForm, note: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_on">Expiry Date (Optional)</Label>
                <Input
                  id="expires_on"
                  type="date"
                  value={createForm.expires_on}
                  onChange={(e) => setCreateForm({...createForm, expires_on: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer ID (Optional)</Label>
                <Input
                  id="customer_id"
                  type="number"
                  placeholder="Customer ID to assign this gift card"
                  value={createForm.customer_id}
                  onChange={(e) => setCreateForm({...createForm, customer_id: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="send_email"
                  checked={createForm.send_email}
                  onCheckedChange={(checked) => setCreateForm({...createForm, send_email: checked})}
                />
                <Label htmlFor="send_email">Send email notification to customer</Label>
              </div>

              <Button 
                onClick={handleCreateGiftCard} 
                disabled={isCreateLoading || !createForm.initial_value}
                className="w-full"
              >
                {isCreateLoading ? 'Creating...' : 'Create Gift Card'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gift Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active, {stats.disabled} disabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Remaining on active cards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalIssued)}</div>
              <p className="text-xs text-muted-foreground">
                All-time gift card value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalIssued > 0 
                  ? Math.round(((stats.totalIssued - stats.totalValue) / stats.totalIssued) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.depleted} fully redeemed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gift Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, note, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading gift cards...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Initial Value</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giftCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono text-sm">
                      {card.code}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(card)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(card.balance)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(card.initial_value)}
                    </TableCell>
                    <TableCell>
                      {card.customer ? (
                        <div>
                          <div className="font-medium">
                            {card.customer.first_name} {card.customer.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {card.customer.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(card.created_at)}
                    </TableCell>
                    <TableCell>
                      {card.expires_on ? formatDate(card.expires_on) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {card.disabled_at ? (
                            <DropdownMenuItem 
                              onClick={() => handleGiftCardAction(card.id, 'enable')}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Enable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleGiftCardAction(card.id, 'disable')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Disable
                            </DropdownMenuItem>
                          )}
                          {card.customer && (
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Customer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {giftCards.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No gift cards found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
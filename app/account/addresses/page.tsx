'use client';

import AddressForm from 'components/address-form';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent } from 'components/ui/card';
import { Building, Edit, Home, MapPin, Plus, Trash2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const [isLocalStorage, setIsLocalStorage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses');
      const data = await response.json();
      
      if (response.ok) {
        setAddresses(data.addresses || []);
        // Show message if using local storage
        if (data.message) {
          console.log('Address API message:', data.message);
          setIsLocalStorage(true);
          setStatusMessage(data.message);
        } else {
          setIsLocalStorage(false);
          setStatusMessage('');
        }
      } else {
        setError(data.error || 'Failed to fetch addresses');
      }
    } catch (error) {
      setError('Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        } else if (data.error === 'DEFAULT_ADDRESS_DELETE_ERROR') {
          // Show user-friendly message for default address deletion
          alert('Cannot delete default address. Please set another address as default first.');
          return;
        }
      } else {
        setError(data.error || 'Failed to delete address');
      }
    } catch (error) {
      setError('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}/default`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh addresses to show the updated default status
        fetchAddresses();
        alert('Default address updated successfully!');
      } else {
        setError(data.error || 'Failed to set default address');
      }
    } catch (error) {
      setError('Failed to set default address');
    }
  };

  const handleSaveAddress = (address: Address) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => 
        prev.map(addr => addr.id === editingAddress.id ? address : addr)
      );
    } else {
      // Add new address
      setAddresses(prev => [...prev, address]);
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Addresses</h1>
            <p className="text-muted-foreground">
              Manage your shipping and billing addresses
            </p>
          </div>
          <Button variant="outline" onClick={handleCancelForm}>
            Back to Addresses
          </Button>
        </div>
        <AddressForm
          address={editingAddress || undefined}
          onSave={handleSaveAddress}
          onCancel={handleCancelForm}
          isEditing={!!editingAddress}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button onClick={handleAddAddress}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {isLocalStorage && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
          <p className="text-sm text-primary">
            💡 {statusMessage || 'Addresses are stored locally. They will be available during your session but won\'t sync with Shopify.'}
          </p>
        </div>
      )}

      {!isLocalStorage && addresses.length > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            ✅ Addresses are synced with Shopify
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium">
                        {address.firstName} {address.lastName}
                      </h3>
                      {address.company && (
                        <Badge variant="secondary">
                          <Building className="w-3 h-3 mr-1" />
                          Business
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {address.company && (
                        <p>{address.company}</p>
                      )}
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.province} {address.zip}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>Phone: {address.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {address.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(address.id!)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your shipping and billing addresses to speed up checkout
            </p>
            <Button onClick={handleAddAddress}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AddressesPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <AddressesPage />
    </Suspense>
  );
} 
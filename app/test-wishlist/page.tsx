'use client';

import { Button } from 'components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { useWishlist } from 'components/wishlist/wishlist-context';
import { useState } from 'react';

export default function TestWishlistPage() {
  const { wishlistItems, wishlistCount, addToWishlist, removeFromWishlist, isAuthenticated, refreshWishlist } = useWishlist();
  const [testResult, setTestResult] = useState<string>('');
  const [authDebug, setAuthDebug] = useState<any>(null);

  const testAuth = async () => {
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setAuthDebug(data);
      setTestResult(`Auth test result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Auth test error: ${error}`);
    }
  };

  const testRefreshWishlist = async () => {
    try {
      await refreshWishlist();
      setTestResult('Wishlist refreshed manually');
    } catch (error) {
      setTestResult(`Error refreshing wishlist: ${error}`);
    }
  };

  const testClearAllWishlists = async () => {
    try {
      const response = await fetch('/api/test-wishlist-clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear-all' }),
      });
      
      const data = await response.json();
      setTestResult(`Clear all result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const testAddToWishlist = async () => {
    try {
      await addToWishlist('gid://shopify/Product/123456789');
      setTestResult('Added test product to wishlist');
    } catch (error) {
      setTestResult(`Error adding to wishlist: ${error}`);
    }
  };

  const testRemoveFromWishlist = async () => {
    if (wishlistItems.length > 0) {
      try {
        await removeFromWishlist(wishlistItems[0].id);
        setTestResult('Removed first item from wishlist');
      } catch (error) {
        setTestResult(`Error removing from wishlist: ${error}`);
      }
    } else {
      setTestResult('No items in wishlist to remove');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wishlist Test Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Wishlist Context Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            {authDebug && (
              <div className="mt-4">
                <p><strong>Auth Debug:</strong></p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                  {JSON.stringify(authDebug, null, 2)}
                </pre>
              </div>
            )}
            <Button onClick={testAuth} className="mt-4">
              Test Authentication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wishlist Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Wishlist Count:</strong> {wishlistCount}</p>
            <p><strong>Items:</strong></p>
            <ul className="list-disc list-inside">
              {wishlistItems.map((item, index) => (
                <li key={index}>
                  {item.name} - ${item.price} (ID: {item.id})
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testAddToWishlist} variant="outline">
                Add Test Item
              </Button>
              <Button onClick={testRemoveFromWishlist} variant="outline">
                Remove First Item
              </Button>
              <Button onClick={testClearAllWishlists} variant="destructive">
                Clear All Wishlists
              </Button>
              <Button onClick={testRefreshWishlist} variant="outline">
                Refresh Wishlist
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <pre className="text-sm">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Login to your account</li>
              <li>Add some items to your wishlist</li>
              <li>Logout from your account</li>
              <li>Check that the wishlist appears empty (client-side cleared)</li>
              <li>Login again and verify the wishlist items are restored</li>
              <li><strong>Note:</strong> Wishlist data persists on the server between sessions</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
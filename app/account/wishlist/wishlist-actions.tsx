'use client';

import { Button } from 'components/ui/button';
import { useWishlist } from 'components/wishlist/wishlist-context';
import {
    Eye,
    ShoppingCart,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface WishlistActionsProps {
  item: {
    id: string;
    title: string;
    handle: string;
    featuredImage: {
      url: string;
      altText: string;
    };
    priceRange: {
      maxVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}

export default function WishlistActions({ item }: WishlistActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { removeFromWishlist } = useWishlist();

  const handleAddToCart = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Added to cart successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await removeFromWishlist(item.id);
      setMessage('Removed from wishlist');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button 
          size="sm" 
          disabled={isLoading}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Add to Cart
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-red-600 hover:text-red-700"
        onClick={handleRemoveFromWishlist}
        disabled={isLoading}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      {message && (
        <div className={`absolute top-0 right-0 p-2 rounded text-xs ${
          message.includes('successfully') || message.includes('Removed') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 
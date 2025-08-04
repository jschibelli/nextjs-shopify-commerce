'use client';

import { Button } from 'components/ui/button';
import { Product } from 'lib/shopify/types';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddToWishlistProps {
  product: Product;
  onWishlistUpdate?: (count: number) => void;
}

export function AddToWishlist({ product, onWishlistUpdate }: AddToWishlistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [message, setMessage] = useState('');

  // Check if product is already in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch('/api/account/wishlist');
        if (response.ok) {
          const data = await response.json();
          const isInWishlist = data.wishlistItems?.some((item: any) => item.id === product.id);
          setIsInWishlist(isInWishlist);
        }
      } catch (error) {
        console.error('Failed to check wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  const handleWishlistToggle = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/account/wishlist?itemId=${product.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          setIsInWishlist(false);
          setMessage('Removed from wishlist!');
          setTimeout(() => setMessage(''), 3000);
          
          // Update navbar count
          if (onWishlistUpdate) {
            const currentResponse = await fetch('/api/account/wishlist');
            if (currentResponse.ok) {
              const currentData = await currentResponse.json();
              onWishlistUpdate(currentData.wishlistItems?.length || 0);
            }
          }
        } else {
          setMessage(data.error || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/account/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsInWishlist(true);
          setMessage('Added to wishlist!');
          setTimeout(() => setMessage(''), 3000);
          
          // Update navbar count
          if (onWishlistUpdate) {
            const currentResponse = await fetch('/api/account/wishlist');
            if (currentResponse.ok) {
              const currentData = await currentResponse.json();
              onWishlistUpdate(currentData.wishlistItems?.length || 0);
            }
          }
        } else {
          setMessage(data.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={`w-full ${isInWishlist ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}`}
        onClick={handleWishlistToggle}
        disabled={isLoading}
      >
        <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
        {isLoading ? 'Loading...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
      {message && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-2 rounded text-xs text-center ${
          message.includes('Added') || message.includes('Removed')
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 
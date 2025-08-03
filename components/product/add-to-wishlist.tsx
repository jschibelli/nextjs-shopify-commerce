'use client';

import { Button } from 'components/ui/button';
import { Product } from 'lib/shopify/types';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface AddToWishlistProps {
  product: Product;
}

export function AddToWishlist({ product }: AddToWishlistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToWishlist = async () => {
    setIsLoading(true);
    setMessage('');

    try {
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
      } else {
        setMessage(data.error || 'Failed to add to wishlist');
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
        className="w-full"
        onClick={handleAddToWishlist}
        disabled={isLoading}
      >
        <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
        {isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
      </Button>
      {message && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-2 rounded text-xs text-center ${
          message.includes('Added') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 
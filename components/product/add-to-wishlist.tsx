'use client';

import { Button } from 'components/ui/button';
import { Product } from 'lib/shopify/types';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useWishlist } from '../wishlist/wishlist-context';

interface AddToWishlistProps {
  product: Product;
}

export function AddToWishlist({ product }: AddToWishlistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useWishlist();

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setMessage('Please log in to manage your wishlist');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      if (isInWishlist(product.id)) {
        // Remove from wishlist
        await removeFromWishlist(product.id);
        setMessage('Removed from wishlist!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Add to wishlist - convert product to wishlist item format
        const wishlistItem = {
          id: product.id,
          title: product.title,
          handle: product.handle,
          featuredImage: product.featuredImage,
          priceRange: product.priceRange
        };
        await addToWishlist(wishlistItem);
        setMessage('Added to wishlist!');
        setTimeout(() => setMessage(''), 3000);
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
        className={`w-full ${isInWishlist(product.id) ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}`}
        onClick={handleWishlistToggle}
        disabled={isLoading}
      >
        <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
        {isLoading ? 'Loading...' : isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
      </Button>
      {message && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-2 rounded text-xs text-center ${
          message.includes('Added') || message.includes('Removed')
            ? 'bg-green-100 text-green-800' 
            : message.includes('log in')
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 
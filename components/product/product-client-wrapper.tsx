'use client';

import { Product } from 'lib/shopify/types';
import { useEffect, useState } from 'react';
import { ProductDescription } from './product-description';

interface ProductClientWrapperProps {
  product: Product;
}

export function ProductClientWrapper({ product }: ProductClientWrapperProps) {
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch initial wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const response = await fetch('/api/account/wishlist');
        if (response.ok) {
          const data = await response.json();
          setWishlistCount(data.wishlistItems?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist count:', error);
      }
    };

    fetchWishlistCount();
  }, []);

  const handleWishlistUpdate = (count: number) => {
    setWishlistCount(count);
  };

  return (
    <ProductDescription 
      product={product} 
      onWishlistUpdate={handleWishlistUpdate}
    />
  );
} 
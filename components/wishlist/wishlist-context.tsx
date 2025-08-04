'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  addedDate: string;
  category: string;
  handle: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlistItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/wishlist');
      if (response.ok) {
        const data = await response.json();
        const items = data.wishlistItems || [];
        setWishlistItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const addToWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        // Refresh the wishlist to get the updated data
        await fetchWishlistItems();
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/account/wishlist?itemId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the wishlist to get the updated data
        await fetchWishlistItems();
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlistItems();
  };

  // Fetch wishlist items on component mount
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 
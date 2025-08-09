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
  isAuthenticated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/account/wishlist');
      if (response.status === 401) {
        // User is not authenticated
        setIsAuthenticated(false);
        setWishlistItems([]); // Clear wishlist for logged out users
        return false;
      } else if (response.ok) {
        // User is authenticated
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
      setWishlistItems([]);
      return false;
    }
    return false;
  };

  const fetchWishlistItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/wishlist');
      
      if (response.status === 401) {
        // User is not authenticated
        setIsAuthenticated(false);
        setWishlistItems([]);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        const items = data.wishlistItems || [];
        setWishlistItems(items);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setIsAuthenticated(false);
      setWishlistItems([]);
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

      if (response.status === 401) {
        // User is not authenticated, clear wishlist
        setIsAuthenticated(false);
        setWishlistItems([]);
        return;
      }

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

      if (response.status === 401) {
        // User is not authenticated, clear wishlist
        setIsAuthenticated(false);
        setWishlistItems([]);
        return;
      }

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

  // Check authentication status and fetch wishlist on component mount
  useEffect(() => {
    const initializeWishlist = async () => {
      const isAuth = await checkAuthStatus();
      if (isAuth) {
        await fetchWishlistItems();
      }
    };

    initializeWishlist();
  }, []);

  // Listen for authentication changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customer_token' || e.key === null) {
        // Token was added or removed, refresh wishlist
        setTimeout(() => {
          refreshWishlist();
        }, 100);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, check auth status
        setTimeout(() => {
          refreshWishlist();
        }, 100);
      }
    };

    // Listen for storage changes (cross-tab logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for page visibility changes (user navigated back)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    refreshWishlist,
    isLoading,
    isAuthenticated,
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
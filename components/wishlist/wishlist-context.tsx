"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface WishlistItem {
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
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (item: WishlistItem) => Promise<void>;
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
      const response = await fetch('/api/auth/check-session');
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          // Don't set authenticated for admin users - they don't have wishlists
          if (data.isStaffMember) {
            setIsAuthenticated(false);
            setWishlistItems([]);
            return false;
          }
          setIsAuthenticated(true);
          return true;
        } else {
          setIsAuthenticated(false);
          setWishlistItems([]);
          return false;
        }
      } else {
        setIsAuthenticated(false);
        setWishlistItems([]);
        return false;
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
      setWishlistItems([]);
      return false;
    }
  };

  const fetchWishlistItems = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items || []);
      } else if (response.status === 401) {
        // User is not authenticated
        setIsAuthenticated(false);
        setWishlistItems([]);
      } else {
        console.error('Failed to fetch wishlist items');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.id === productId);
  };

  const addToWishlist = async (item: WishlistItem): Promise<void> => {
    if (!isAuthenticated) {
      console.warn('User must be logged in to add items to wishlist');
      return;
    }

    if (isInWishlist(item.id)) {
      console.warn('Item already in wishlist');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        setWishlistItems(prev => [...prev, item]);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setWishlistItems([]);
      } else {
        console.error('Failed to add item to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!isAuthenticated) {
      console.warn('User must be logged in to remove items from wishlist');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setWishlistItems([]);
      } else {
        console.error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWishlist = async (): Promise<void> => {
    const isAuth = await checkAuthStatus();
    if (isAuth) {
      await fetchWishlistItems();
    }
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

    return () => {};
  }, [wishlistItems.length]);

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
        // Page became visible, check auth status and refresh wishlist
        setTimeout(async () => {
          const isAuth = await checkAuthStatus();
          if (isAuth) {
            await fetchWishlistItems();
          }
        }, 100);
      }
    };

    const handleLogoutSuccess = () => {
      // Clear client-side wishlist state on logout, but don't clear server data
      console.log('Wishlist: Logout event received, clearing client-side wishlist state');
      setIsAuthenticated(false);
      setWishlistItems([]);
    };

    const handleLoginSuccess = () => {
      // Refresh wishlist when user logs in
      console.log('Wishlist: Login success event received, refreshing wishlist');
      setTimeout(async () => {
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          await fetchWishlistItems();
        }
      }, 500); // Small delay to ensure session is set
    };

    // Listen for storage changes (cross-tab logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for page visibility changes (user navigated back)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for logout success event
    window.addEventListener('logout-success', handleLogoutSuccess);
    
    // Listen for login success event
    window.addEventListener('login-success', handleLoginSuccess);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('logout-success', handleLogoutSuccess);
      window.removeEventListener('login-success', handleLoginSuccess);
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
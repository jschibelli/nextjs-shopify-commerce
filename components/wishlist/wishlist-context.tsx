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
    try {
      setIsLoading(true);
      
      // First check if user is admin
      const authResponse = await fetch('/api/auth/check-session');
      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.isStaffMember) {
          // Admin users don't have wishlists
          setIsAuthenticated(false);
          setWishlistItems([]);
          return;
        }
      }
      
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

    // Set up periodic authentication check (every 30 seconds)
    const authCheckInterval = setInterval(async () => {
      const isAuth = await checkAuthStatus();
      if (isAuth && wishlistItems.length === 0) {
        // If authenticated but no wishlist items, try to fetch them
        await fetchWishlistItems();
      }
    }, 30000);

    return () => {
      clearInterval(authCheckInterval);
    };
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
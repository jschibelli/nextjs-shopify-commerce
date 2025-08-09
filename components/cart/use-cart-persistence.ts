'use client';

import { Cart } from 'lib/shopify/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface CartPersistenceOptions {
  storageKey?: string;
  enableLocalStorage?: boolean;
  enableSessionStorage?: boolean;
  autoRecover?: boolean;
}

interface CartPersistenceReturn {
  saveCart: (cart: Cart) => void;
  loadCart: () => Cart | null;
  clearStoredCart: () => void;
  hasStoredCart: boolean;
  lastSavedAt: Date | null;
}

export function useCartPersistence(options: CartPersistenceOptions = {}): CartPersistenceReturn {
  const {
    storageKey = 'shopify-cart',
    enableLocalStorage = true,
    enableSessionStorage = true,
    autoRecover = true
  } = options;

  const [hasStoredCart, setHasStoredCart] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Check if cart exists in storage on mount
  useEffect(() => {
    const checkStoredCart = () => {
      if (typeof window === 'undefined') return;

      const localCart = enableLocalStorage ? localStorage.getItem(storageKey) : null;
      const sessionCart = enableSessionStorage ? sessionStorage.getItem(storageKey) : null;
      
      setHasStoredCart(!!(localCart || sessionCart));
      
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setLastSavedAt(new Date(parsed.savedAt || Date.now()));
        } catch (error) {
          console.error('Error parsing stored cart:', error);
        }
      }
    };

    checkStoredCart();
  }, [storageKey, enableLocalStorage, enableSessionStorage]);

  const saveCart = useCallback((cart: Cart) => {
    if (typeof window === 'undefined') return;

    const cartData = {
      ...cart,
      savedAt: Date.now()
    };

    try {
      if (enableLocalStorage) {
        localStorage.setItem(storageKey, JSON.stringify(cartData));
      }
      
      if (enableSessionStorage) {
        sessionStorage.setItem(storageKey, JSON.stringify(cartData));
      }
      
      setHasStoredCart(true);
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [storageKey, enableLocalStorage, enableSessionStorage]);

  const loadCart = useCallback((): Cart | null => {
    if (typeof window === 'undefined') return null;

    try {
      // Try local storage first, then session storage
      let storedCart = enableLocalStorage ? localStorage.getItem(storageKey) : null;
      
      if (!storedCart && enableSessionStorage) {
        storedCart = sessionStorage.getItem(storageKey);
      }

      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        
        // Check if cart is not too old (optional: 24 hours)
        const cartAge = Date.now() - (parsed.savedAt || 0);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cartAge > maxAge) {
          console.log('Stored cart is too old, clearing...');
          clearStoredCart();
          return null;
        }

        return parsed;
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      clearStoredCart();
    }

    return null;
  }, [storageKey, enableLocalStorage, enableSessionStorage]);

  const clearStoredCart = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (enableLocalStorage) {
        localStorage.removeItem(storageKey);
      }
      
      if (enableSessionStorage) {
        sessionStorage.removeItem(storageKey);
      }
      
      setHasStoredCart(false);
      setLastSavedAt(null);
    } catch (error) {
      console.error('Error clearing stored cart:', error);
    }
  }, [storageKey, enableLocalStorage, enableSessionStorage]);

  return {
    saveCart,
    loadCart,
    clearStoredCart,
    hasStoredCart,
    lastSavedAt
  };
}

// Hook for cart recovery and synchronization
export function useCartRecovery(cart: Cart | undefined, onCartRecovered?: (recoveredCart: Cart) => void) {
  const { loadCart, saveCart, hasStoredCart } = useCartPersistence({
    autoRecover: true
  });

  useEffect(() => {
    // If we have a cart, save it
    if (cart && cart.lines.length > 0) {
      saveCart(cart);
    }
  }, [cart, saveCart]);

  const recoverCart = useCallback(() => {
    if (!hasStoredCart) return null;
    
    const recoveredCart = loadCart();
    if (recoveredCart && onCartRecovered) {
      onCartRecovered(recoveredCart);
    }
    
    return recoveredCart;
  }, [hasStoredCart, loadCart, onCartRecovered]);

  return {
    recoverCart,
    hasStoredCart
  };
}

// Hook for cart analytics and insights
export function useCartInsights(cart: Cart | undefined) {
  const insights = useMemo(() => {
    if (!cart || cart.lines.length === 0) {
      return {
        totalValue: 0,
        averageItemPrice: 0,
        mostExpensiveItem: null as any,
        leastExpensiveItem: null as any,
        itemCategories: {} as Record<string, number>,
        priceRange: { min: 0, max: 0, average: 0 }
      };
    }

    const totalValue = Number(cart.cost.totalAmount.amount);
    const totalItems = cart.totalQuantity;
    const averageItemPrice = totalValue / totalItems;

    // Calculate price range
    const prices = cart.lines.map(item => Number(item.cost.totalAmount.amount) / item.quantity);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Find most and least expensive items
    const sortedItems = [...cart.lines].sort((a, b) => {
      const aPrice = Number(a.cost.totalAmount.amount) / a.quantity;
      const bPrice = Number(b.cost.totalAmount.amount) / b.quantity;
      return bPrice - aPrice;
    });

    // Categorize items
    const itemCategories: Record<string, number> = {};
    cart.lines.forEach(item => {
      const title = item.merchandise.product.title.toLowerCase();
      let category = 'Other';
      
      if (title.includes('shirt') || title.includes('tank') || title.includes('top')) {
        category = 'Tops';
      } else if (title.includes('pant') || title.includes('short')) {
        category = 'Bottoms';
      } else if (title.includes('shoe') || title.includes('boot')) {
        category = 'Footwear';
      } else if (title.includes('jacket') || title.includes('hoodie')) {
        category = 'Outerwear';
      } else if (title.includes('accessory') || title.includes('bag')) {
        category = 'Accessories';
      }
      
      itemCategories[category] = (itemCategories[category] || 0) + item.quantity;
    });

    return {
      totalValue,
      averageItemPrice,
      mostExpensiveItem: sortedItems[0] || null,
      leastExpensiveItem: sortedItems[sortedItems.length - 1] || null,
      itemCategories,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        average: avgPrice
      }
    };
  }, [cart?.id, cart?.totalQuantity, cart?.cost.totalAmount.amount, cart?.lines]);

  return insights;
} 
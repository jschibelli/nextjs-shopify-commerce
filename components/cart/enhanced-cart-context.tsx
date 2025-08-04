'use client';

import type {
    Cart,
    CartItem,
    Product,
    ProductVariant
} from 'lib/shopify/types';
import React, {
    createContext,
    use,
    useCallback,
    useContext,
    useMemo,
    useOptimistic,
    useState
} from 'react';

type UpdateType = 'plus' | 'minus' | 'delete' | 'set';

type CartAction =
  | {
      type: 'UPDATE_ITEM';
      payload: { merchandiseId: string; updateType: UpdateType; quantity?: number };
    }
  | {
      type: 'ADD_ITEM';
      payload: { variant: ProductVariant; product: Product; quantity?: number };
    }
  | {
      type: 'REMOVE_ITEM';
      payload: { merchandiseId: string };
    }
  | {
      type: 'CLEAR_CART';
    }
  | {
      type: 'SET_CART';
      payload: { cart: Cart };
    };

type CartAnalytics = {
  totalItems: number;
  uniqueItems: number;
  averageItemPrice: number;
  mostExpensiveItem: CartItem | null;
  leastExpensiveItem: CartItem | null;
};

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
  analytics: CartAnalytics;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
  newQuantity?: number
): CartItem | null {
  if (updateType === 'delete') return null;

  let quantity: number;
  if (updateType === 'set' && newQuantity !== undefined) {
    quantity = newQuantity;
  } else {
    quantity = updateType === 'plus' ? item.quantity + 1 : item.quantity - 1;
  }

  if (quantity <= 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    quantity,
    singleItemAmount.toString()
  );

  return {
    ...item,
    quantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount
      }
    }
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  quantity: number = 1
): CartItem {
  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  const totalAmount = calculateItemCost(newQuantity, variant.price.amount);

  return {
    id: existingItem?.id,
    quantity: newQuantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode
      }
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage
      }
    }
  };
}

function updateCartTotals(
  lines: CartItem[]
): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode }
    }
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

function calculateCartAnalytics(cart: Cart | undefined): CartAnalytics {
  if (!cart || cart.lines.length === 0) {
    return {
      totalItems: 0,
      uniqueItems: 0,
      averageItemPrice: 0,
      mostExpensiveItem: null,
      leastExpensiveItem: null
    };
  }

  const totalItems = cart.totalQuantity;
  const uniqueItems = cart.lines.length;
  const totalValue = Number(cart.cost.totalAmount.amount);
  const averageItemPrice = totalValue / totalItems;

  const sortedItems = [...cart.lines].sort((a, b) => 
    Number(b.cost.totalAmount.amount) - Number(a.cost.totalAmount.amount)
  );

  return {
    totalItems,
    uniqueItems,
    averageItemPrice,
    mostExpensiveItem: sortedItems[0] || null,
    leastExpensiveItem: sortedItems[sortedItems.length - 1] || null
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case 'UPDATE_ITEM': {
      const { merchandiseId, updateType, quantity } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType, quantity)
            : item
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: '0' }
          }
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines
      };
    }
    case 'ADD_ITEM': {
      const { variant, product, quantity = 1 } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines
      };
    }
    case 'REMOVE_ITEM': {
      const { merchandiseId } = action.payload;
      const updatedLines = currentCart.lines.filter(
        (item) => item.merchandise.id !== merchandiseId
      );

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: '0' }
          }
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines
      };
    }
    case 'CLEAR_CART': {
      return createEmptyCart();
    }
    case 'SET_CART': {
      return action.payload.cart;
    }
    default:
      return currentCart;
  }
}

export function EnhancedCartProvider({
  children,
  cartPromise
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartPromise, 
      analytics: { totalItems: 0, uniqueItems: 0, averageItemPrice: 0, mostExpensiveItem: null, leastExpensiveItem: null },
      isLoading,
      error,
      clearError
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useEnhancedCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useEnhancedCart must be used within an EnhancedCartProvider');
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer
  );

  const analytics = useMemo(() => calculateCartAnalytics(optimisticCart), [optimisticCart]);

  const updateCartItem = useCallback((merchandiseId: string, updateType: UpdateType, quantity?: number) => {
    updateOptimisticCart({
      type: 'UPDATE_ITEM',
      payload: { merchandiseId, updateType, quantity }
    });
  }, [updateOptimisticCart]);

  const addCartItem = useCallback((variant: ProductVariant, product: Product, quantity?: number) => {
    updateOptimisticCart({ 
      type: 'ADD_ITEM', 
      payload: { variant, product, quantity } 
    });
  }, [updateOptimisticCart]);

  const removeCartItem = useCallback((merchandiseId: string) => {
    updateOptimisticCart({
      type: 'REMOVE_ITEM',
      payload: { merchandiseId }
    });
  }, [updateOptimisticCart]);

  const clearCart = useCallback(() => {
    updateOptimisticCart({ type: 'CLEAR_CART' });
  }, [updateOptimisticCart]);

  const setCart = useCallback((cart: Cart) => {
    updateOptimisticCart({ type: 'SET_CART', payload: { cart } });
  }, [updateOptimisticCart]);

  return useMemo(
    () => ({
      cart: optimisticCart,
      analytics,
      updateCartItem,
      addCartItem,
      removeCartItem,
      clearCart,
      setCart
    }),
    [optimisticCart, analytics, updateCartItem, addCartItem, removeCartItem, clearCart, setCart]
  );
} 
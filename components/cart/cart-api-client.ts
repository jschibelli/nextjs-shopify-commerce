'use client';

import { Cart } from 'lib/shopify/types';

interface CartApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cart?: Cart;
}

interface CartApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class CartApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(options: CartApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '/api/cart';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<CartApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        cart: data.cart,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<CartApiResponse<T>>,
    retryCount = 0
  ): Promise<CartApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount < this.retries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  async getCart(): Promise<CartApiResponse<Cart>> {
    return this.retryRequest(() => this.makeRequest<Cart>(this.baseUrl, { method: 'GET' }));
  }

  async addItem(
    merchandiseId: string,
    quantity: number = 1
  ): Promise<CartApiResponse<Cart>> {
    return this.retryRequest(() =>
      this.makeRequest<Cart>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          merchandiseId,
          quantity,
        }),
      })
    );
  }

  async updateItem(
    lineId: string,
    merchandiseId: string,
    quantity: number
  ): Promise<CartApiResponse<Cart>> {
    return this.retryRequest(() =>
      this.makeRequest<Cart>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          lineId,
          merchandiseId,
          quantity,
        }),
      })
    );
  }

  async removeItem(lineId: string): Promise<CartApiResponse<Cart>> {
    return this.retryRequest(() =>
      this.makeRequest<Cart>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'remove',
          lineId,
        }),
      })
    );
  }

  async clearCart(): Promise<CartApiResponse<void>> {
    return this.retryRequest(() =>
      this.makeRequest<void>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'clear',
        }),
      })
    );
  }

  async createCart(): Promise<CartApiResponse<Cart>> {
    return this.retryRequest(() =>
      this.makeRequest<Cart>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
        }),
      })
    );
  }

  // Batch operations
  async addMultipleItems(
    items: Array<{ merchandiseId: string; quantity: number }>
  ): Promise<CartApiResponse<Cart>> {
    // For now, we'll add items sequentially
    // In a real implementation, you might want to batch these
    let lastResponse: CartApiResponse<Cart> = { success: false, error: 'No items to add' };
    
    for (const item of items) {
      lastResponse = await this.addItem(item.merchandiseId, item.quantity);
      if (!lastResponse.success) {
        break;
      }
    }
    
    return lastResponse;
  }

  async updateMultipleItems(
    items: Array<{ lineId: string; merchandiseId: string; quantity: number }>
  ): Promise<CartApiResponse<Cart>> {
    // For now, we'll update items sequentially
    let lastResponse: CartApiResponse<Cart> = { success: false, error: 'No items to update' };
    
    for (const item of items) {
      lastResponse = await this.updateItem(item.lineId, item.merchandiseId, item.quantity);
      if (!lastResponse.success) {
        break;
      }
    }
    
    return lastResponse;
  }

  async removeMultipleItems(lineIds: string[]): Promise<CartApiResponse<Cart>> {
    // For now, we'll remove items sequentially
    let lastResponse: CartApiResponse<Cart> = { success: false, error: 'No items to remove' };
    
    for (const lineId of lineIds) {
      lastResponse = await this.removeItem(lineId);
      if (!lastResponse.success) {
        break;
      }
    }
    
    return lastResponse;
  }
}

// Create a singleton instance
export const cartApiClient = new CartApiClient();

// Hook for using the cart API client
export function useCartApi() {
  return {
    getCart: cartApiClient.getCart.bind(cartApiClient),
    addItem: cartApiClient.addItem.bind(cartApiClient),
    updateItem: cartApiClient.updateItem.bind(cartApiClient),
    removeItem: cartApiClient.removeItem.bind(cartApiClient),
    clearCart: cartApiClient.clearCart.bind(cartApiClient),
    createCart: cartApiClient.createCart.bind(cartApiClient),
    addMultipleItems: cartApiClient.addMultipleItems.bind(cartApiClient),
    updateMultipleItems: cartApiClient.updateMultipleItems.bind(cartApiClient),
    removeMultipleItems: cartApiClient.removeMultipleItems.bind(cartApiClient),
  };
}

// Utility functions for common cart operations
export const cartUtils = {
  // Calculate cart totals
  calculateTotals(cart: Cart) {
    const subtotal = Number(cart.cost.subtotalAmount.amount);
    const tax = Number(cart.cost.totalTaxAmount.amount);
    const total = Number(cart.cost.totalAmount.amount);
    
    return {
      subtotal,
      tax,
      total,
      itemCount: cart.totalQuantity,
      uniqueItems: cart.lines.length,
    };
  },

  // Check if cart is empty
  isEmpty(cart: Cart | undefined): boolean {
    return !cart || cart.lines.length === 0 || cart.totalQuantity === 0;
  },

  // Get cart item by merchandise ID
  getItemByMerchandiseId(cart: Cart, merchandiseId: string) {
    return cart.lines.find(item => item.merchandise.id === merchandiseId);
  },

  // Get cart item by line ID
  getItemByLineId(cart: Cart, lineId: string) {
    return cart.lines.find(item => item.id === lineId);
  },

  // Format cart for display
  formatCartForDisplay(cart: Cart) {
    return {
      itemCount: cart.totalQuantity,
      uniqueItems: cart.lines.length,
      total: cart.cost.totalAmount,
      items: cart.lines.map(item => ({
        id: item.id,
        merchandiseId: item.merchandise.id,
        title: item.merchandise.product.title,
        variant: item.merchandise.title,
        quantity: item.quantity,
        price: item.cost.totalAmount,
        image: item.merchandise.product.featuredImage,
      })),
    };
  },
}; 
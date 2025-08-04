'use server';

import { TAGS } from 'lib/constants';
import { revalidateTag } from 'next/cache';

export async function addItemToCart(
  merchandiseId: string,
  quantity: number = 1
): Promise<{ success: boolean; error?: string; cart?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        merchandiseId,
        quantity
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to add item to cart' };
    }

    revalidateTag(TAGS.cart);
    return { success: true, cart: data.cart };
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return { success: false, error: 'Failed to add item to cart' };
  }
}

export async function updateCartItemQuantity(
  lineId: string,
  merchandiseId: string,
  quantity: number
): Promise<{ success: boolean; error?: string; cart?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        lineId,
        merchandiseId,
        quantity
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update cart item' };
    }

    revalidateTag(TAGS.cart);
    return { success: true, cart: data.cart };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, error: 'Failed to update cart item' };
  }
}

export async function removeItemFromCart(
  lineId: string
): Promise<{ success: boolean; error?: string; cart?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove',
        lineId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to remove item from cart' };
    }

    revalidateTag(TAGS.cart);
    return { success: true, cart: data.cart };
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return { success: false, error: 'Failed to remove item from cart' };
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'clear'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to clear cart' };
    }

    revalidateTag(TAGS.cart);
    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
}

export async function getCartData(): Promise<{ success: boolean; error?: string; cart?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch cart' };
    }

    return { success: true, cart: data.cart };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { success: false, error: 'Failed to fetch cart' };
  }
}

export async function createNewCart(): Promise<{ success: boolean; error?: string; cart?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create cart' };
    }

    revalidateTag(TAGS.cart);
    return { success: true, cart: data.cart };
  } catch (error) {
    console.error('Error creating cart:', error);
    return { success: false, error: 'Failed to create cart' };
  }
} 
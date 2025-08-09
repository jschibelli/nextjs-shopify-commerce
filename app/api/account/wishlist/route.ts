import { getProducts } from 'lib/shopify';
import { getWishlistStorage } from 'lib/wishlist-utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const getCustomerIdFromToken = (tokenValue: string): string | null => {
  try {
    const token = JSON.parse(tokenValue);
    return token.customer_id || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID from token
    const customerId = getCustomerIdFromToken(tokenCookie.value);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get customer's wishlist items
    const wishlistStorage = getWishlistStorage();
    const customerWishlist = wishlistStorage.get(customerId) || new Set();
    
    if (customerWishlist.size === 0) {
      // Return empty wishlist for new customers
      return NextResponse.json({ items: [] });
    }

    // Fetch all products to get details for wishlist items
    const allProducts = await getProducts({ query: '', sortKey: 'CREATED_AT', reverse: true });
    
    // Create a map for quick product lookup
    const productMap = new Map(allProducts.map(product => [product.id, product]));
    
    // Get wishlist items with real product data
    const wishlistItems = Array.from(customerWishlist)
      .map(productId => {
        const product = productMap.get(productId);
        if (!product) return null;
        
        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          featuredImage: product.featuredImage,
          priceRange: product.priceRange
        };
      })
      .filter(item => item !== null);

    return NextResponse.json({ items: wishlistItems });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID from token
    const customerId = getCustomerIdFromToken(tokenCookie.value);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { id: productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Add item to customer's wishlist
    const wishlistStorage = getWishlistStorage();
    if (!wishlistStorage.has(customerId)) {
      wishlistStorage.set(customerId, new Set());
    }
    
    const customerWishlist = wishlistStorage.get(customerId)!;
    customerWishlist.add(productId);

    return NextResponse.json({ 
      success: true, 
      message: 'Item added to wishlist',
      itemCount: customerWishlist.size
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer ID from token
    const customerId = getCustomerIdFromToken(tokenCookie.value);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Remove item from customer's wishlist
    const wishlistStorage = getWishlistStorage();
    const customerWishlist = wishlistStorage.get(customerId);
    
    if (customerWishlist) {
      customerWishlist.delete(productId);
      
      // If wishlist is empty, remove the customer's entry
      if (customerWishlist.size === 0) {
        wishlistStorage.delete(customerId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from wishlist',
      itemCount: customerWishlist?.size || 0
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
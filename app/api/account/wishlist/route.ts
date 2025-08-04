import { getProducts } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for wishlist items (in production, this would be a database)
const wishlistStorage = new Map<string, Set<string>>();

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
    const customerWishlist = wishlistStorage.get(customerId) || new Set();
    
    if (customerWishlist.size === 0) {
      // Return empty wishlist for new customers
      return NextResponse.json({ wishlistItems: [] });
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
          name: product.title,
          price: parseFloat(product.priceRange.minVariantPrice.amount),
          originalPrice: parseFloat(product.priceRange.minVariantPrice.amount), // No simulated discount
          image: product.featuredImage?.url || '/api/placeholder/150/150',
          rating: 0, // No simulated ratings
          reviews: 0, // No simulated reviews
          inStock: product.availableForSale,
          addedDate: new Date().toISOString().split('T')[0], // Current date
          category: product.tags[0] || 'General',
          handle: product.handle
        };
      })
      .filter(item => item !== null);

    return NextResponse.json({ wishlistItems });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get customer ID from token
    const customerId = getCustomerIdFromToken(tokenCookie.value);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Initialize customer wishlist if it doesn't exist
    if (!wishlistStorage.has(customerId)) {
      wishlistStorage.set(customerId, new Set());
    }
    
    // Add product to wishlist
    wishlistStorage.get(customerId)!.add(productId);
    
    console.log('Add to wishlist:', { customerId, productId });

    return NextResponse.json({ 
      success: true, 
      message: 'Item added to wishlist' 
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Get customer ID from token
    const customerId = getCustomerIdFromToken(tokenCookie.value);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Remove product from wishlist
    const customerWishlist = wishlistStorage.get(customerId);
    if (customerWishlist) {
      customerWishlist.delete(itemId);
    }
    
    console.log('Remove from wishlist:', { customerId, itemId });

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from wishlist' 
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
} 
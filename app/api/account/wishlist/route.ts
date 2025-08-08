import { getAuth } from 'lib/auth';
import { getProducts } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for wishlist items (in production, this would be a database)
const wishlistStorage = new Map<string, Set<string>>();

// Function to clear wishlist data for a specific customer
export function clearWishlistForCustomer(customerId: string) {
  if (wishlistStorage.has(customerId)) {
    wishlistStorage.delete(customerId);
    console.log('Wishlist cleared for customer:', customerId);
  }
}

// Function to clear all wishlist data (useful for testing or admin purposes)
export function clearAllWishlistData() {
  const customerCount = wishlistStorage.size;
  wishlistStorage.clear();
  console.log('All wishlist data cleared. Customers affected:', customerCount);
  return customerCount;
}

export async function GET() {
  try {
    // Check if this is an admin session first
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        if (sessionData.isStaffMember) {
          // This is an admin session, return empty wishlist for admin
          return NextResponse.json({ wishlistItems: [] });
        }
      } catch (error) {
        // If session parsing fails, continue with customer auth
      }
    }
    
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get customer's wishlist items
    const customerWishlist = wishlistStorage.get(user.id) || new Set();
    
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
    // Check if this is an admin session first
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        if (sessionData.isStaffMember) {
          // This is an admin session, return error for admin
          return NextResponse.json({ error: 'Admin users cannot modify wishlist' }, { status: 403 });
        }
      } catch (error) {
        // If session parsing fails, continue with customer auth
      }
    }
    
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Initialize customer wishlist if it doesn't exist
    if (!wishlistStorage.has(user.id)) {
      wishlistStorage.set(user.id, new Set());
    }
    
    // Add product to wishlist
    wishlistStorage.get(user.id)!.add(productId);
    
    console.log('Add to wishlist:', { customerId: user.id, productId });

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
    // Check if this is an admin session first
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        if (sessionData.isStaffMember) {
          // This is an admin session, return error for admin
          return NextResponse.json({ error: 'Admin users cannot modify wishlist' }, { status: 403 });
        }
      } catch (error) {
        // If session parsing fails, continue with customer auth
      }
    }
    
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Remove product from wishlist
    const customerWishlist = wishlistStorage.get(user.id);
    if (customerWishlist) {
      customerWishlist.delete(itemId);
    }
    
    console.log('Remove from wishlist:', { customerId: user.id, itemId });

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
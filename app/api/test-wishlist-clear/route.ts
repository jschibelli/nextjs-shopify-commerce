import { clearAllWishlistData, clearWishlistForCustomer } from 'lib/wishlist-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, customerId } = await request.json();
    
    if (action === 'clear-all') {
      const customerCount = clearAllWishlistData();
      return NextResponse.json({
        success: true,
        message: `Cleared wishlist data for ${customerCount} customers`,
        customerCount
      });
    }
    
    if (action === 'clear-customer' && customerId) {
      clearWishlistForCustomer(customerId);
      return NextResponse.json({
        success: true,
        message: `Cleared wishlist data for customer: ${customerId}`,
        customerId
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "clear-all" or "clear-customer" with customerId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Test wishlist clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear wishlist' },
      { status: 500 }
    );
  }
} 
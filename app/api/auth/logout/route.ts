import { getAuth } from 'lib/auth';
import { clearWishlistForCustomer } from 'lib/wishlist-utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (user) {
      console.log('Logging out customer user:', user.email);
    }

    const cookieStore = await cookies();
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true';
    const demoRole = cookieStore.get('demo_role')?.value;

    // Clear the session cookie
    cookieStore.delete('customer_token');

    if (isDemo) {
      // Clear demo cookies
      cookieStore.delete('demo');
      cookieStore.delete('demo_role');

      // Clear ephemeral demo data for customer role
      if (demoRole !== 'admin') {
        const demoCustomerId = process.env.DEMO_CUSTOMER_ID || 'demo_customer';
        clearWishlistForCustomer(demoCustomerId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');
    cookieStore.delete('demo');
    cookieStore.delete('demo_role');
    
    return NextResponse.json(
      { error: 'Failed to logout. Please try again.' },
      { status: 500 }
    );
  }
} 
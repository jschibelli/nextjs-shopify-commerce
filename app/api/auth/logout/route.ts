import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    // Log the logout but don't clear wishlist data
    if (user) {
      console.log('Logging out customer user:', user.email);
    }

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');

    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear the cookie even if there's an error
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');
    
    return NextResponse.json(
      { error: 'Failed to logout. Please try again.' },
      { status: 500 }
    );
  }
} 
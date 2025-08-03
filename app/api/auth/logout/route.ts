import { getAuth } from 'lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    
    // Attempt to logout from Shopify (don't fail if this errors)
    try {
      await auth.logout();
    } catch (error) {
      console.error('Error during Shopify logout:', error);
      // Continue with local logout even if Shopify logout fails
    }

    // Get the redirect URL from the request body or use default
    const { redirectUrl = '/' } = await request.json().catch(() => ({}));

    // Create response with redirect
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully',
      redirectUrl 
    });

    // Set the cookie deletion in the response
    response.cookies.delete('customer_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, try to clear the cookie
    const response = NextResponse.json(
      { error: 'Failed to logout properly, but session cleared' },
      { status: 500 }
    );
    
    response.cookies.delete('customer_token');
    return response;
  }
} 
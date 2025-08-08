import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear the admin session cookie
    const response = NextResponse.json({ success: true });
    
    // Remove the customer token cookie (used for admin auth)
    response.cookies.delete('customer_token');
    
    // Remove any other admin-related cookies
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_token');
    
    return response;
  } catch (error) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        
        // If it's an admin session, we might need to clean up admin-specific data
        if (sessionData.isStaffMember) {
          console.log('Logging out admin user:', sessionData.email);
        } else {
          console.log('Logging out customer user:', sessionData.email);
        }
      } catch (error) {
        console.error('Error parsing session data during logout:', error);
      }
    }

    // Clear the session cookie
    cookieStore.delete('customer_token');

    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Failed to logout. Please try again.' },
      { status: 500 }
    );
  }
} 
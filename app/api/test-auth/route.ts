import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    console.log('Test Auth - Cookie found:', !!tokenCookie);
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        console.log('Test Auth - Session data:', {
          hasCustomerId: !!sessionData.customer_id,
          customerId: sessionData.customer_id,
          hasAccessToken: !!sessionData.access_token,
          isStaffMember: sessionData.isStaffMember || false
        });
      } catch (error) {
        console.error('Test Auth - Error parsing session data:', error);
      }
    }
    
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    console.log('Test Auth - User found:', !!user);
    if (user) {
      console.log('Test Auth - User details:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
    
    return NextResponse.json({
      hasCookie: !!tokenCookie,
      hasUser: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      } : null
    });
  } catch (error) {
    console.error('Test Auth error:', error);
    return NextResponse.json(
      { error: 'Failed to check auth' },
      { status: 500 }
    );
  }
} 
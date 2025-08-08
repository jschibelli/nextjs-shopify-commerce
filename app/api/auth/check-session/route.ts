import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    console.log('Session check - Cookie found:', !!tokenCookie);
    
    if (!tokenCookie) {
      console.log('Session check - No customer_token cookie found');
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false
      });
    }

    try {
      const sessionData = JSON.parse(tokenCookie.value);
      console.log('Session check - Session data parsed:', !!sessionData);
      
      const auth = getAuth();
      await auth.initializeFromCookies();
      const user = await auth.getCurrentUser();

      console.log('Session check - User found:', !!user);

      if (!user) {
        console.log('Session check - No user found, returning unauthenticated');
        return NextResponse.json({ 
          isAuthenticated: false,
          user: null,
          isStaffMember: false
        });
      }

      console.log('Session check - Returning authenticated user:', user.email);
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        isStaffMember: sessionData.isStaffMember || false
      });
    } catch (error) {
      console.error('Error parsing session data:', error);
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null,
      isStaffMember: false
    });
  }
} 
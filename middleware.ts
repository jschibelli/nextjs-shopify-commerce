import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('customer_token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?error=admin_access_denied', request.url));
    }

    try {
      // Parse the token to check if it's an admin session
      const sessionData = JSON.parse(token.value);
      
      // Check if this is actually an admin session
      if (!sessionData.isStaffMember) {
        console.log('Non-admin user attempting to access admin area:', sessionData.email);
        return NextResponse.redirect(new URL('/login?error=shopify_staff_access_denied', request.url));
      }
    } catch (error) {
      console.error('Error parsing admin session token:', error);
      return NextResponse.redirect(new URL('/login?error=admin_access_denied', request.url));
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account') && pathname !== '/account/login') {
    const token = request.cookies.get('customer_token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Parse the token to check if it's a valid session
      const sessionData = JSON.parse(token.value);
      
      // If this is an admin session, redirect to admin area
      if (sessionData.isStaffMember) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
      console.error('Error parsing customer session token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
}; 
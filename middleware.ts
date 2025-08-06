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
  }

  // Protect account routes
  if (pathname.startsWith('/account') && pathname !== '/account/login') {
    const token = request.cookies.get('customer_token');
    
    if (!token) {
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
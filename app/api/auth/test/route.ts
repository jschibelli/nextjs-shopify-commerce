import { getAuth } from 'lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = getAuth();
    const user = await auth.getCurrentUser();
    
    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          acceptsMarketing: user.acceptsMarketing,
          acceptsSMS: user.acceptsSMS,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      user: null,
      error: 'Authentication check failed'
    });
  }
} 
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.delete('customer_token');
    
    console.log('All sessions cleared for testing');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All sessions cleared successfully' 
    });
  } catch (error) {
    console.error('Session clear error:', error);
    
    return NextResponse.json(
      { error: 'Failed to clear sessions' },
      { status: 500 }
    );
  }
} 
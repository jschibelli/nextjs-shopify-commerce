import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    revalidateTag('products');
    revalidateTag('collections');
    console.log('✅ Cache revalidated successfully');
    
    return NextResponse.json({ 
      status: 200, 
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 500, 
      error: 'Failed to revalidate cache' 
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to manually revalidate cache',
    endpoint: '/api/revalidate-manual'
  });
} 
import { getProducts } from 'lib/shopify';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await getProducts({ query: '', sortKey: 'CREATED_AT', reverse: true });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 
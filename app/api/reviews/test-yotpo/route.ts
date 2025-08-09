import { testYotpoAPI } from 'lib/shopify/yotpo-reviews';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testYotpoAPI();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing Yotpo API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to test Yotpo API',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
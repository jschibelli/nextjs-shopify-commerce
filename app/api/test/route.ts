import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Server is working!' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST request received',
      data: body 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse JSON' }, { status: 400 });
  }
} 
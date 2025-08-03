import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Local customer storage
const localCustomers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, acceptsMarketing, acceptsSMS } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('Creating customer:', { 
      firstName, 
      lastName, 
      email, 
      phone, 
      acceptsMarketing,
      acceptsSMS,
      password: '***'
    });

    // Check if customer already exists locally
    const existingCustomer = localCustomers.find(c => c.email === email);
    if (existingCustomer) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Create customer locally
    const customer = {
      id: `customer_${Date.now()}`,
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      phone: phone || '',
      acceptsMarketing: acceptsMarketing || false,
      acceptsSMS: acceptsSMS || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: password
    };

    // Add to local storage
    localCustomers.push(customer);

    console.log('Customer created successfully:', customer.id);

    // Create a session token
    const sessionToken = {
      access_token: `local_token_${customer.id}`,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'customer_read_customers,customer_read_orders',
      customer_id: customer.id
    };

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('customer_token', JSON.stringify(sessionToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
} 
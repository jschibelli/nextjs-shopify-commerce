import { createCustomerAccessToken, createCustomerWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, acceptsMarketing, acceptsSMS } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('Creating customer in Shopify:', { 
      firstName, 
      lastName, 
      email, 
      phone, 
      acceptsMarketing,
      acceptsSMS,
      password: '***' // Never log passwords
    });

    let customer;
    let accessToken;

    try {
      // First, try to create the customer in Shopify using Admin API
      customer = await createCustomerWithAdminAPI({
        firstName,
        lastName,
        email,
        password,
        phone,
        acceptsMarketing,
        acceptsSMS
      });
      
      console.log('Customer created successfully in Shopify:', customer.id);

      // Now create an access token for the new customer using Storefront API
      accessToken = await createCustomerAccessToken({
        email,
        password
      });
      
      console.log('Access token created successfully');
      
    } catch (error) {
      console.error('Failed to create customer:', error);
      
      // Handle specific Shopify errors
      if (error instanceof Error) {
        if (error.message.includes('already been taken')) {
          return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
        }
        if (error.message.includes('password')) {
          return NextResponse.json({ error: 'Password must be at least 5 characters long' }, { status: 400 });
        }
        if (error.message.includes('email')) {
          return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
        }
        if (error.message.includes('SHOPIFY_ADMIN_ACCESS_TOKEN')) {
          return NextResponse.json({ 
            error: 'Server configuration error. Please contact support.' 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to create account. Please try again.' 
      }, { status: 500 });
    }

    // Create a session token that matches our auth system
    const sessionToken = {
      access_token: accessToken.accessToken,
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
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      redirect: '/account',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    
    if (!adminKey) {
      return NextResponse.json({ 
        error: 'SHOPIFY_ADMIN_ACCESS_TOKEN not set' 
      }, { status: 500 });
    }

    const adminEndpoint = `https://${domain}/admin/api/2023-01/customers.json`;
    
    // Test customer data
    const customerData = {
      customer: {
        first_name: "Test",
        last_name: "User",
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        phone: "1234567890",
        accepts_marketing: false,
        verified_email: true
      }
    };

    console.log('Testing customer creation with data:', {
      ...customerData,
      customer: { ...customerData.customer, password: '***' }
    });
    
    const response = await fetch(adminEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminKey
      },
      body: JSON.stringify(customerData)
    });

    console.log('Customer creation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Customer creation error:', errorText);
      return NextResponse.json({ 
        error: `Customer creation failed: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('Customer created successfully:', result.customer?.id);

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer: {
        id: result.customer?.id,
        email: result.customer?.email,
        firstName: result.customer?.first_name,
        lastName: result.customer?.last_name
      }
    });
  } catch (error) {
    console.error('Test customer creation error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 
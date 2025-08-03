import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Testing customer authentication for:', email);
    
    // Test if customer exists in Storefront API
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    
    if (!domain || !storefrontToken) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const graphqlEndpoint = `https://${domain}/api/2023-01/graphql.json`;
    
    // Try to create customer access token
    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            email,
            password
          }
        }
      })
    });

    const result = await response.json();
    console.log('Storefront API response:', result);

    if (result.errors) {
      return NextResponse.json({ 
        error: 'GraphQL error', 
        details: result.errors 
      }, { status: 500 });
    }

    const data = result.data.customerAccessTokenCreate;
    
    if (data.customerUserErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: data.customerUserErrors
      }, { status: 401 });
    }

    if (data.customerAccessToken) {
      return NextResponse.json({
        success: true,
        message: 'Customer authenticated successfully',
        accessToken: data.customerAccessToken.accessToken
      });
    }

    return NextResponse.json({ 
      error: 'No access token returned' 
    }, { status: 500 });
  } catch (error) {
    console.error('Test customer exists error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 
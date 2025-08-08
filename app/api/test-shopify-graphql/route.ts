import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured' },
        { status: 500 }
      );
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const results: any = {};

    // Test different GraphQL queries
    const queries = [
      {
        name: 'shop_info',
        query: `
          query {
            shop {
              id
              name
              email
              myshopifyDomain
              plan {
                displayName
                partnerDevelopment
              }
            }
          }
        `
      },
      {
        name: 'staff_members_basic',
        query: `
          query {
            shop {
              staffMembers(first: 10) {
                edges {
                  node {
                    id
                    email
                    firstName
                    lastName
                    active
                  }
                }
              }
            }
          }
        `
      },
      {
        name: 'staff_members_detailed',
        query: `
          query {
            shop {
              staffMembers(first: 10) {
                edges {
                  node {
                    id
                    email
                    firstName
                    lastName
                    active
                    # Try to get any available fields
                    __typename
                  }
                }
              }
            }
          }
        `
      },
      {
        name: 'shop_owner',
        query: `
          query {
            shop {
              id
              name
              email
              shopOwner
            }
          }
        `
      }
    ];

    for (const queryTest of queries) {
      try {
        console.log(`Testing GraphQL query: ${queryTest.name}`);
        const response = await fetch(`${baseUrl}/admin/api/2023-01/graphql.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: queryTest.query
          })
        });

        results[queryTest.name] = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
        results[queryTest.name] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      domain,
      adminKeyConfigured: !!adminKey,
      results
    });
  } catch (error) {
    console.error('Shopify GraphQL test error:', error);
    return NextResponse.json(
      { error: 'Failed to test Shopify GraphQL API' },
      { status: 500 }
    );
  }
} 
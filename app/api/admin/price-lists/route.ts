import { getAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== PRICE LISTS API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Fetch price lists from Shopify GraphQL
    const query = `
      query getPriceLists($first: Int!) {
        priceLists(first: $first) {
          edges {
            node {
              id
              name
              contextRule {
                countries
                customerTags
              }
              currency
              parent {
                adjustment {
                  type
                  value
                }
              }
              prices(first: 250) {
                edges {
                  node {
                    compareAtPrice {
                      amount
                    }
                    price {
                      amount
                    }
                    variant {
                      id
                      title
                      product {
                        id
                        title
                      }
                    }
                  }
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const graphqlResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: 250 }
      }),
    });

    if (!graphqlResponse.ok) {
      throw new Error(`Failed to fetch price lists: ${graphqlResponse.statusText}`);
    }

    const graphqlData = await graphqlResponse.json();
    let priceLists = graphqlData.data?.priceLists?.edges?.map((edge: any) => edge.node) || [];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      priceLists = priceLists.filter((list: any) => 
        list.name?.toLowerCase().includes(searchLower) ||
        list.contextRule?.countries?.some((country: string) => 
          country.toLowerCase().includes(searchLower)
        ) ||
        list.contextRule?.customerTags?.some((tag: string) => 
          tag.toLowerCase().includes(searchLower)
        )
      );
    }

    // Calculate statistics
    const stats = {
      total: priceLists.length,
      active: priceLists.filter((list: any) => list.contextRule).length,
      countries: [...new Set(priceLists.flatMap((list: any) => list.contextRule?.countries || []))].length,
      totalProducts: priceLists.reduce((sum: number, list: any) => 
        sum + (list.prices?.edges?.length || 0), 0
      ),
      currencies: [...new Set(priceLists.map((list: any) => list.currency))].length,
    };

    return NextResponse.json({
      price_lists: priceLists,
      stats,
      pagination: {
        page: 1,
        limit: 250,
        total: priceLists.length
      }
    });

  } catch (error) {
    console.error('Price lists fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch price lists',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, currency, countries, customer_tags, adjustment_type, adjustment_value, product_prices } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Create price list using GraphQL
    const mutation = `
      mutation priceListCreate($input: PriceListCreateInput!) {
        priceListCreate(input: $input) {
          priceList {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        name,
        currency,
        contextRule: {
          countries: countries || [],
          customerTags: customer_tags || []
        },
        parent: adjustment_type && adjustment_value ? {
          adjustment: {
            type: adjustment_type.toUpperCase(),
            value: parseFloat(adjustment_value)
          }
        } : undefined
      }
    };

    const createResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create price list: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();

    if (createData.data?.priceListCreate?.userErrors?.length > 0) {
      throw new Error(createData.data.priceListCreate.userErrors[0].message);
    }

    const priceListId = createData.data?.priceListCreate?.priceList?.id;

    // Add product prices if provided
    if (product_prices && product_prices.length > 0 && priceListId) {
      const pricesMutation = `
        mutation priceListFixedPricesAdd($priceListId: ID!, $prices: [PriceListPriceInput!]!) {
          priceListFixedPricesAdd(priceListId: $priceListId, prices: $prices) {
            prices {
              variant {
                id
              }
              price {
                amount
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const pricesVariables = {
        priceListId,
        prices: product_prices.map((price: any) => ({
          variantId: price.variant_id,
          price: {
            amount: price.price.toString(),
            currencyCode: currency
          },
          compareAtPrice: price.compare_at_price ? {
            amount: price.compare_at_price.toString(),
            currencyCode: currency
          } : undefined
        }))
      };

      await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: pricesMutation, variables: pricesVariables }),
      });
    }

    return NextResponse.json({
      price_list: createData.data?.priceListCreate?.priceList,
      success: true,
      message: 'Price list created successfully'
    });

  } catch (error) {
    console.error('Price list creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create price list',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
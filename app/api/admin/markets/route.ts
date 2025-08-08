import { getAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SHOPIFY MARKETS API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Fetch markets using GraphQL
    const query = `
      query getMarkets($first: Int!) {
        markets(first: $first) {
          edges {
            node {
              id
              name
              primary
              enabled
              handle
              currencySettings {
                baseCurrency {
                  currencyCode
                }
                localCurrencies
              }
              regions(first: 250) {
                edges {
                  node {
                    id
                    name
                    countryCode
                  }
                }
              }
              webPresence {
                defaultLocale {
                  isoCode
                }
                alternateLocales {
                  isoCode
                }
                domain {
                  host
                  sslEnabled
                  url
                }
                subfolderSuffix
              }
              priceList {
                id
                name
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const marketsResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
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

    if (!marketsResponse.ok) {
      throw new Error(`Failed to fetch markets: ${marketsResponse.statusText}`);
    }

    const marketsData = await marketsResponse.json();
    const markets = marketsData.data?.markets?.edges?.map((edge: any) => edge.node) || [];

    // Fetch market localization extensions
    const localizationQuery = `
      query getMarketLocalizations($first: Int!) {
        marketLocalizations(first: $first) {
          edges {
            node {
              market {
                id
              }
              key
              value
            }
          }
        }
      }
    `;

    const localizationResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: localizationQuery,
        variables: { first: 250 }
      }),
    });

    let localizations = [];
    if (localizationResponse.ok) {
      const localizationData = await localizationResponse.json();
      localizations = localizationData.data?.marketLocalizations?.edges?.map((edge: any) => edge.node) || [];
    }

    // Calculate statistics
    const stats = {
      total: markets.length,
      enabled: markets.filter((market: any) => market.enabled).length,
      disabled: markets.filter((market: any) => !market.enabled).length,
      primary: markets.filter((market: any) => market.primary).length,
      totalRegions: markets.reduce((sum: number, market: any) => 
        sum + (market.regions?.edges?.length || 0), 0
      ),
      currencies: [...new Set(markets.flatMap((market: any) => 
        market.currencySettings?.localCurrencies || []
      ))].length,
      domains: markets.filter((market: any) => 
        market.webPresence?.domain?.host
      ).length,
    };

    // Enrich markets with localization data
    const enrichedMarkets = markets.map((market: any) => ({
      ...market,
      localizations: localizations.filter((loc: any) => loc.market.id === market.id),
      regionCount: market.regions?.edges?.length || 0,
      currencyCount: market.currencySettings?.localCurrencies?.length || 0,
      localeCount: (market.webPresence?.alternateLocales?.length || 0) + 1, // +1 for default locale
    }));

    return NextResponse.json({
      markets: enrichedMarkets,
      stats,
      pagination: {
        page: 1,
        limit: 250,
        total: enrichedMarkets.length
      }
    });

  } catch (error) {
    console.error('Markets fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch markets',
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
    const { 
      name, 
      handle, 
      enabled, 
      regions, 
      currencies, 
      default_locale, 
      alternate_locales,
      domain_settings,
      price_list_id 
    } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Create market using GraphQL
    const mutation = `
      mutation marketCreate($input: MarketCreateInput!) {
        marketCreate(input: $input) {
          market {
            id
            name
            handle
            enabled
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
        handle,
        enabled: enabled !== false,
        regions: regions?.map((region: any) => ({
          countryCode: region.countryCode
        })) || [],
        currencySettings: currencies && currencies.length > 0 ? {
          localCurrencies: currencies
        } : undefined,
        webPresence: {
          defaultLocale: default_locale || 'EN',
          alternateLocales: alternate_locales || [],
          ...(domain_settings && {
            domain: {
              host: domain_settings.host,
              sslEnabled: domain_settings.ssl_enabled !== false
            },
            subfolderSuffix: domain_settings.subfolder_suffix
          })
        },
        ...(price_list_id && { priceListId: price_list_id })
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
      throw new Error(`Failed to create market: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();

    if (createData.data?.marketCreate?.userErrors?.length > 0) {
      throw new Error(createData.data.marketCreate.userErrors[0].message);
    }

    return NextResponse.json({
      market: createData.data?.marketCreate?.market,
      success: true,
      message: 'Market created successfully'
    });

  } catch (error) {
    console.error('Market creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create market',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, action, ...updateData } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    let mutation = '';
    let variables: any = {};

    if (action === 'enable' || action === 'disable') {
      mutation = `
        mutation marketUpdate($id: ID!, $input: MarketUpdateInput!) {
          marketUpdate(id: $id, input: $input) {
            market {
              id
              enabled
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        id,
        input: {
          enabled: action === 'enable'
        }
      };
    } else if (action === 'delete') {
      mutation = `
        mutation marketDelete($id: ID!) {
          marketDelete(id: $id) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = { id };
    } else {
      // Update market
      mutation = `
        mutation marketUpdate($id: ID!, $input: MarketUpdateInput!) {
          marketUpdate(id: $id, input: $input) {
            market {
              id
              name
              enabled
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        id,
        input: updateData
      };
    }

    const updateResponse = await fetch(`https://${domain}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update market: ${updateResponse.statusText}`);
    }

    const updateDataResponse = await updateResponse.json();

    if (action === 'delete') {
      if (updateDataResponse.data?.marketDelete?.userErrors?.length > 0) {
        throw new Error(updateDataResponse.data.marketDelete.userErrors[0].message);
      }
      return NextResponse.json({
        deleted_id: updateDataResponse.data?.marketDelete?.deletedId,
        success: true,
        message: 'Market deleted successfully'
      });
    } else {
      if (updateDataResponse.data?.marketUpdate?.userErrors?.length > 0) {
        throw new Error(updateDataResponse.data.marketUpdate.userErrors[0].message);
      }
      return NextResponse.json({
        market: updateDataResponse.data?.marketUpdate?.market,
        success: true,
        message: 'Market updated successfully'
      });
    }

  } catch (error) {
    console.error('Market update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update market',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
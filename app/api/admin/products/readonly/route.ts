import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== READONLY PRODUCTS API ===');
    
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    // Use Storefront API to get products (read-only)
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!domain || !storefrontToken) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const graphqlEndpoint = `${baseUrl}/api/2024-01/graphql.json`;

    console.log('Fetching products via Storefront API:', graphqlEndpoint);

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': storefrontToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 50) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  vendor
                  productType
                  tags
                  status
                  createdAt
                  updatedAt
                  publishedAt
                  images(first: 5) {
                    edges {
                      node {
                        id
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        price
                        compareAtPrice
                        availableForSale
                        quantityAvailable
                        sku
                        barcode
                        weight
                        weightUnit
                      }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    console.log('Storefront API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Storefront API error:', errorText);
      return NextResponse.json({
        error: 'Failed to fetch products via Storefront API',
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json({
        error: 'GraphQL query failed',
        details: data.errors
      }, { status: 500 });
    }

    // Transform Storefront API data to match Admin API format
    const products = data.data.products.edges.map((edge: any) => {
      const product = edge.node;
      return {
        id: product.id.split('/').pop(), // Extract ID from GraphQL ID
        title: product.title,
        handle: product.handle,
        description: product.description,
        body_html: product.description,
        vendor: product.vendor,
        product_type: product.productType,
        tags: product.tags.join(', '),
        status: product.status?.toLowerCase() || 'active',
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        published_at: product.publishedAt,
        images: product.images.edges.map((imgEdge: any) => ({
          id: imgEdge.node.id.split('/').pop(),
          src: imgEdge.node.url,
          alt: imgEdge.node.altText,
          width: imgEdge.node.width,
          height: imgEdge.node.height
        })),
        variants: product.variants.edges.map((variantEdge: any) => ({
          id: variantEdge.node.id.split('/').pop(),
          title: variantEdge.node.title,
          price: variantEdge.node.price,
          compare_at_price: variantEdge.node.compareAtPrice,
          available: variantEdge.node.availableForSale,
          inventory_quantity: variantEdge.node.quantityAvailable,
          sku: variantEdge.node.sku,
          barcode: variantEdge.node.barcode,
          weight: variantEdge.node.weight,
          weight_unit: variantEdge.node.weightUnit
        }))
      };
    });

    console.log(`Successfully fetched ${products.length} products via Storefront API`);

    return NextResponse.json({
      products,
      message: 'Products loaded via Storefront API (read-only mode)',
      note: 'To enable full CRUD operations, please set up Admin API permissions as described in SHOPIFY_APP_SETUP_GUIDE.md'
    });

  } catch (error) {
    console.error('Readonly products API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
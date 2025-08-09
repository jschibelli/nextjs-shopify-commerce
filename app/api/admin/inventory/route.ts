import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== FETCHING INVENTORY ===');
    
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      console.log('Admin access denied - no admin user');
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    console.log('Admin user authenticated:', adminUser.email);

    // Get Shopify API credentials
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      console.log('Missing Shopify configuration');
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    console.log('Using Shopify domain:', baseUrl);

    // Try to fetch locations first (simpler endpoint)
    console.log('Fetching locations...');
    const locationsResponse = await fetch(`${baseUrl}/admin/api/2024-01/locations.json`, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });

    if (!locationsResponse.ok) {
      const errorText = await locationsResponse.text();
      console.log('Locations fetch failed:', locationsResponse.status, errorText);
      return NextResponse.json({
        error: 'Failed to fetch locations',
        details: `Status: ${locationsResponse.status}, Response: ${errorText}`
      }, { status: 500 });
    }

    const locationsData = await locationsResponse.json();
    console.log('Locations fetched successfully:', locationsData.locations?.length || 0, 'locations');

    // Try to fetch products (easier than inventory items)
    console.log('Fetching products...');
    const productsResponse = await fetch(`${baseUrl}/admin/api/2024-01/products.json?limit=50&fields=id,title,variants`, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });

    let productsData = { products: [] };
    let inventoryItems: any[] = [];
    
    if (productsResponse.ok) {
      productsData = await productsResponse.json();
      console.log('Products fetched successfully:', productsData.products?.length || 0, 'products');
      
      // Extract inventory items from product variants
      inventoryItems = productsData.products?.flatMap((product: any) => 
        product.variants?.map((variant: any) => ({
          id: variant.inventory_item_id,
          title: `${product.title} - ${variant.title}`,
          sku: variant.sku,
          tracked: variant.inventory_management === 'shopify',
          inventory_quantity: variant.inventory_quantity || 0,
          variant_id: variant.id,
          product_id: product.id
        })) || []
      ) || [];
    } else {
      console.log('Products fetch failed:', productsResponse.status);
    }

    // Try to fetch inventory levels for locations
    console.log('Fetching inventory levels...');
    let inventoryLevels: any[] = [];
    
    if (locationsData.locations && locationsData.locations.length > 0) {
      const locationId = locationsData.locations[0].id;
      
      try {
        const inventoryLevelsResponse = await fetch(`${baseUrl}/admin/api/2024-01/inventory_levels.json?location_ids=${locationId}&limit=50`, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        if (inventoryLevelsResponse.ok) {
          const inventoryLevelsData = await inventoryLevelsResponse.json();
          inventoryLevels = inventoryLevelsData.inventory_levels || [];
          console.log('Inventory levels fetched successfully:', inventoryLevels.length, 'levels');
        } else {
          console.log('Inventory levels fetch failed:', inventoryLevelsResponse.status);
        }
      } catch (error) {
        console.log('Error fetching inventory levels:', error);
      }
    }

    // Map inventory levels to items
    inventoryItems = inventoryItems.map(item => {
      const levels = inventoryLevels.filter(level => level.inventory_item_id === item.id);
      return {
        ...item,
        inventory_levels: levels
      };
    });

    // Calculate inventory statistics
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter((item: any) => 
      item.tracked && item.inventory_quantity < 10 && item.inventory_quantity > 0
    ).length;
    const outOfStockItems = inventoryItems.filter((item: any) => 
      item.tracked && item.inventory_quantity === 0
    ).length;

    console.log('Inventory stats calculated:', { totalItems, lowStockItems, outOfStockItems });

    return NextResponse.json({
      locations: locationsData.locations || [],
      inventoryLevels,
      inventoryItems,
      stats: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalLocations: locationsData.locations?.length || 0
      },
      message: `Successfully fetched inventory data: ${totalItems} items, ${locationsData.locations?.length || 0} locations`
    });

  } catch (error) {
    console.error('Inventory API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPDATING INVENTORY ===');
    
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    const body = await request.json();
    const { inventoryItemId, locationId, available } = body;

    if (!inventoryItemId || !locationId || available === undefined) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'inventoryItemId, locationId, and available are required'
      }, { status: 400 });
    }

    // Get Shopify API credentials
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/inventory_levels/set.json`;

    console.log('Updating inventory level:', { inventoryItemId, locationId, available });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available: available
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Inventory update failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to update inventory: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Inventory updated successfully');

    return NextResponse.json({
      success: true,
      inventoryLevel: data.inventory_level,
      message: 'Inventory updated successfully'
    });

  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
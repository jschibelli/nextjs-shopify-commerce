import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
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

    // Fetch discounts data in parallel
    const [priceRulesResponse, discountCodesResponse] = await Promise.all([
      fetch(`${baseUrl}/admin/api/2024-01/price_rules.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/admin/api/2024-01/discount_codes.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      })
    ]);

    // Handle errors
    if (!priceRulesResponse.ok || !discountCodesResponse.ok) {
      const errors = [];
      if (!priceRulesResponse.ok) errors.push(`Price Rules: ${priceRulesResponse.status}`);
      if (!discountCodesResponse.ok) errors.push(`Discount Codes: ${discountCodesResponse.status}`);
      
      return NextResponse.json({
        error: 'Failed to fetch discounts data',
        details: errors.join(', ')
      }, { status: 500 });
    }

    const [priceRulesData, discountCodesData] = await Promise.all([
      priceRulesResponse.json(),
      discountCodesResponse.json()
    ]);

    const priceRules = priceRulesData.price_rules || [];
    const discountCodes = discountCodesData.discount_codes || [];

    // Calculate discount statistics
    const activeDiscounts = priceRules.filter((rule: any) => rule.status === 'active').length;
    const expiredDiscounts = priceRules.filter((rule: any) => rule.status === 'expired').length;
    const scheduledDiscounts = priceRules.filter((rule: any) => rule.status === 'scheduled').length;

    return NextResponse.json({
      priceRules,
      discountCodes,
      stats: {
        totalPriceRules: priceRules.length,
        totalDiscountCodes: discountCodes.length,
        activeDiscounts,
        expiredDiscounts,
        scheduledDiscounts
      },
      message: `Successfully fetched discounts data`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const endpoint = `${baseUrl}/admin/api/2024-01/price_rules.json`;

    // Prepare price rule data for Shopify
    const priceRuleData = {
      price_rule: {
        title: body.title,
        target_type: body.target_type || 'line_item',
        target_selection: body.target_selection || 'all',
        allocation_method: body.allocation_method || 'across',
        value_type: body.value_type || 'percentage',
        value: body.value,
        customer_selection: body.customer_selection || 'all',
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        usage_limit: body.usage_limit,
        customer_segment_prerequisite_ids: body.customer_segment_prerequisite_ids || [],
        discount_codes: body.discount_codes ? [{
          code: body.discount_codes[0].code,
          usage_limit: body.discount_codes[0].usage_limit
        }] : []
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(priceRuleData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API permissions required. Please ensure your Shopify app has write_discounts scope',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create discount: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      priceRule: data.price_rule,
      message: `Discount "${data.price_rule.title}" created successfully`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
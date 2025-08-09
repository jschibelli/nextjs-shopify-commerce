import { createCustomerGroupWithAdminAPI, getCustomerGroupsWithAdminAPI } from 'lib/shopify';
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

    const groups = await getCustomerGroupsWithAdminAPI();

    return NextResponse.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Error fetching customer groups:', error);
    return NextResponse.json({ error: 'Failed to fetch customer groups' }, { status: 500 });
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

    const { name, rules, description } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({ error: 'Rules array is required' }, { status: 400 });
    }

    // Validate rules
    for (const rule of rules) {
      if (!rule.field || !rule.operator || rule.value === undefined) {
        return NextResponse.json({ error: 'Invalid rule format' }, { status: 400 });
      }
    }

    const group = await createCustomerGroupWithAdminAPI({
      name,
      rules,
      description
    });

    return NextResponse.json({
      success: true,
      message: 'Customer group created successfully',
      group
    });
  } catch (error) {
    console.error('Error creating customer group:', error);
    return NextResponse.json({ error: 'Failed to create customer group' }, { status: 500 });
  }
} 
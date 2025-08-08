import { bulkUpdateCustomerTagsWithAdminAPI } from 'lib/shopify';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

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

    const { customerIds, tags, action } = await request.json();

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: 'Customer IDs array is required' }, { status: 400 });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Action must be add or remove' }, { status: 400 });
    }

    // Perform bulk operation
    const result = await bulkUpdateCustomerTagsWithAdminAPI({
      customerIds,
      tags,
      action
    });

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed: ${result.success} succeeded, ${result.failed} failed`,
      data: result
    });
  } catch (error) {
    console.error('Error performing bulk tag operation:', error);
    return NextResponse.json({ error: 'Failed to perform bulk tag operation' }, { status: 500 });
  }
} 
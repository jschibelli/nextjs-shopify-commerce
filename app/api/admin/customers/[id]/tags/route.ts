import { addCustomerTagsWithAdminAPI, getCustomerWithAdminAPI, removeCustomerTagsWithAdminAPI } from 'lib/shopify';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: customerId } = await params;

    // Get customer data to retrieve current tags
    const customer = await getCustomerWithAdminAPI(customerId);
    const tags = customer.tags ? customer.tags.split(', ').filter((tag: string) => tag.trim()) : [];

    return NextResponse.json({
      success: true,
      customerId,
      tags
    });
  } catch (error) {
    console.error('Error fetching customer tags:', error);
    return NextResponse.json({ error: 'Failed to fetch customer tags' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: customerId } = await params;
    const { tags } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    // Add tags to customer
    await addCustomerTagsWithAdminAPI({
      customerId,
      tags
    });

    return NextResponse.json({
      success: true,
      message: 'Tags added successfully',
      customerId,
      tags
    });
  } catch (error) {
    console.error('Error adding customer tags:', error);
    return NextResponse.json({ error: 'Failed to add customer tags' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: customerId } = await params;
    const { tags } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    // Remove tags from customer
    await removeCustomerTagsWithAdminAPI({
      customerId,
      tags
    });

    return NextResponse.json({
      success: true,
      message: 'Tags removed successfully',
      customerId,
      removedTags: tags
    });
  } catch (error) {
    console.error('Error removing customer tags:', error);
    return NextResponse.json({ error: 'Failed to remove customer tags' }, { status: 500 });
  }
} 
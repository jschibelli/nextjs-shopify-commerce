import { getCustomerGamificationDataWithAdminAPI, unlockCustomerAchievementWithAdminAPI } from 'lib/shopify';
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

    const { id } = await params;
    const gamificationData = await getCustomerGamificationDataWithAdminAPI(id);

    return NextResponse.json({
      success: true,
      gamification: gamificationData
    });
  } catch (error) {
    console.error('Error fetching customer gamification data:', error);
    return NextResponse.json({ error: 'Failed to fetch customer gamification data' }, { status: 500 });
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

    const { id } = await params;
    const { achievement, points, badge } = await request.json();

    if (!achievement || typeof achievement !== 'string') {
      return NextResponse.json({ error: 'Achievement is required' }, { status: 400 });
    }

    if (!points || typeof points !== 'number' || points < 0) {
      return NextResponse.json({ error: 'Valid points value is required' }, { status: 400 });
    }

    const achievementData = await unlockCustomerAchievementWithAdminAPI({
      customerId: id,
      achievement,
      points,
      badge
    });

    return NextResponse.json({
      success: true,
      message: 'Achievement unlocked successfully',
      achievement: achievementData
    });
  } catch (error) {
    console.error('Error unlocking customer achievement:', error);
    return NextResponse.json({ error: 'Failed to unlock customer achievement' }, { status: 500 });
  }
} 
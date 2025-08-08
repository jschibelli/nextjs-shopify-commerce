import { getAuth } from 'lib/auth';
import { getCustomerGamificationDataWithAdminAPI } from 'lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'Please log in to view your gamification data'
      }, { status: 401 });
    }

    const gamificationData = await getCustomerGamificationDataWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      gamification: gamificationData
    });
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
  }
} 
import { getAuth } from 'lib/auth';
import { getCustomerMetafieldsWithAdminAPI, updateCustomerCommunicationPreferencesWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get customer data and metafields
    const { getCustomerWithAdminAPI } = await import('lib/shopify');
    const customer = await getCustomerWithAdminAPI(user.id);
    const metafields = await getCustomerMetafieldsWithAdminAPI(user.id);
    
    const communicationMetafield = metafields.find(m => m.namespace === 'communication' && m.key === 'preferences');
    
    let communicationPreferences = {
      emailMarketing: customer.accepts_marketing || false,
      smsMarketing: false, // Default to false since SMS marketing requires special setup
      orderUpdates: true,
      productRecommendations: true,
      newsletterFrequency: 'weekly' as const
    };

    if (communicationMetafield) {
      try {
        const preferences = JSON.parse(communicationMetafield.value);
        communicationPreferences = {
          ...communicationPreferences,
          ...preferences
        };
      } catch {
        // Use default preferences if parsing fails
      }
    }

    return NextResponse.json({
      success: true,
      preferences: communicationPreferences
    });
  } catch (error) {
    console.error('Error fetching communication preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const preferences = await request.json();

    // Validate preferences
    if (preferences.newsletterFrequency && !['daily', 'weekly', 'monthly', 'never'].includes(preferences.newsletterFrequency)) {
      return NextResponse.json({ 
        error: 'Newsletter frequency must be daily, weekly, monthly, or never' 
      }, { status: 400 });
    }

    // Update communication preferences
    await updateCustomerCommunicationPreferencesWithAdminAPI({
      customerId: user.id,
      preferences
    });

    return NextResponse.json({
      success: true,
      message: 'Communication preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating communication preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
} 
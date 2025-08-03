import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get current privacy settings
    const privacySettings = {
      dataSharing: {
        analytics: true,
        marketing: user.acceptsMarketing || false,
        thirdParty: false,
        personalizedAds: false
      },
      communicationPreferences: {
        email: user.acceptsMarketing || false,
        sms: false,
        pushNotifications: false,
        orderUpdates: true,
        securityAlerts: true
      },
      dataRetention: {
        accountData: 'indefinite',
        orderHistory: '7_years',
        browsingHistory: '1_year',
        marketingData: '2_years'
      },
      exportSettings: {
        lastExportDate: null,
        exportFormat: 'json',
        includeDeletedData: false
      }
    };

    return NextResponse.json({
      success: true,
      privacySettings
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
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

    const { action, data } = await request.json();

    switch (action) {
      case 'update-data-sharing':
        return await handleUpdateDataSharing(user, data);
      
      case 'update-communication-preferences':
        return await handleUpdateCommunicationPreferences(user, data);
      
      case 'update-data-retention':
        return await handleUpdateDataRetention(user, data);
      
      case 'request-data-export':
        return await handleRequestDataExport(user, data);
      
      case 'request-data-deletion':
        return await handleRequestDataDeletion(user, data);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in privacy action:', error);
    return NextResponse.json({ error: 'Failed to process privacy action' }, { status: 500 });
  }
}

async function handleUpdateDataSharing(user: any, data: any) {
  try {
    const { analytics, marketing, thirdParty, personalizedAds } = data;
    
    // Update data sharing preferences (in a real app, this would be saved to database)
    const updatedDataSharing = {
      analytics: analytics ?? true,
      marketing: marketing ?? false,
      thirdParty: thirdParty ?? false,
      personalizedAds: personalizedAds ?? false
    };
    
    // Update marketing preferences in Shopify
    if (marketing !== undefined) {
      user.acceptsMarketing = marketing;
      // Here you would update Shopify customer preferences
    }
    
    return NextResponse.json({
      success: true,
      message: 'Data sharing preferences updated',
      dataSharing: updatedDataSharing
    });
  } catch (error) {
    console.error('Error updating data sharing:', error);
    return NextResponse.json({ error: 'Failed to update data sharing preferences' }, { status: 500 });
  }
}

async function handleUpdateCommunicationPreferences(user: any, data: any) {
  try {
    const { email, sms, pushNotifications, orderUpdates, securityAlerts } = data;
    
    // Update communication preferences
    user.communicationPreferences = {
      email: email ?? user.communicationPreferences?.email ?? false,
      sms: sms ?? user.communicationPreferences?.sms ?? false,
      pushNotifications: pushNotifications ?? user.communicationPreferences?.pushNotifications ?? false,
      orderUpdates: orderUpdates ?? user.communicationPreferences?.orderUpdates ?? true,
      securityAlerts: securityAlerts ?? user.communicationPreferences?.securityAlerts ?? true
    };
    
    // Update Shopify preferences
    if (email !== undefined) {
      user.acceptsMarketing = email;
    }
    if (sms !== undefined) {
      user.acceptsSMS = sms;
    }
    
    console.log('Communication preferences updated for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Communication preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating communication preferences:', error);
    return NextResponse.json({ error: 'Failed to update communication preferences' }, { status: 500 });
  }
}

async function handleUpdateDataRetention(user: any, data: any) {
  try {
    const { accountData, orderHistory, browsingHistory, marketingData } = data;
    
    // Update data retention preferences
    user.dataRetention = {
      accountData: accountData ?? user.dataRetention?.accountData ?? 'indefinite',
      orderHistory: orderHistory ?? user.dataRetention?.orderHistory ?? '7_years',
      browsingHistory: browsingHistory ?? user.dataRetention?.browsingHistory ?? '1_year',
      marketingData: marketingData ?? user.dataRetention?.marketingData ?? '2_years'
    };
    
    console.log('Data retention preferences updated for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Data retention preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating data retention:', error);
    return NextResponse.json({ error: 'Failed to update data retention preferences' }, { status: 500 });
  }
}

async function handleRequestDataExport(user: any, data: any) {
  try {
    const { format, includeDeletedData } = data;
    
    // Set export preferences
    user.exportFormat = format || 'json';
    user.includeDeletedData = includeDeletedData || false;
    user.lastExportDate = new Date().toISOString();
    
    // In a real implementation, you would trigger an async export process
    // For now, we'll simulate the export
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      orders: [], // Would be populated from Shopify
      addresses: [], // Would be populated from Shopify
      preferences: {
        marketing: user.acceptsMarketing,
        sms: user.acceptsSMS,
        dataSharing: user.dataSharing
      }
    };
    
    console.log('Data export requested for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Data export request submitted successfully',
      exportId: `export_${user.id}_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    console.error('Error requesting data export:', error);
    return NextResponse.json({ error: 'Failed to request data export' }, { status: 500 });
  }
}

async function handleRequestDataDeletion(user: any, data: any) {
  try {
    const { reason, scope } = data;
    
    // Validate deletion scope
    const validScopes = ['account', 'orders', 'preferences', 'all'];
    if (!validScopes.includes(scope)) {
      return NextResponse.json({ error: 'Invalid deletion scope' }, { status: 400 });
    }
    
    // Set deletion request
    user.deletionRequest = {
      requestedAt: new Date().toISOString(),
      reason: reason || 'User request',
      scope: scope,
      status: 'pending'
    };
    
    console.log('Data deletion requested for user:', user.id, 'scope:', scope);
    
    return NextResponse.json({
      success: true,
      message: 'Data deletion request submitted successfully',
      deletionId: `deletion_${user.id}_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
  } catch (error) {
    console.error('Error requesting data deletion:', error);
    return NextResponse.json({ error: 'Failed to request data deletion' }, { status: 500 });
  }
} 
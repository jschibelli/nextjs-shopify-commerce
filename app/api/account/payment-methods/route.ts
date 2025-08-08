import { getAuth } from 'lib/auth';
import { getCustomerMetafieldsWithAdminAPI, saveCustomerPaymentMethodWithAdminAPI } from 'lib/shopify';
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

    // Get payment methods from metafields
    const metafields = await getCustomerMetafieldsWithAdminAPI(user.id);
    const paymentMethodsMetafield = metafields.find(m => m.namespace === 'payment' && m.key === 'methods');
    
    let paymentMethods = [];
    if (paymentMethodsMetafield) {
      try {
        paymentMethods = JSON.parse(paymentMethodsMetafield.value);
      } catch {
        paymentMethods = [];
      }
    }

    return NextResponse.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { type, last4, expiryMonth, expiryYear, isDefault } = await request.json();

    if (!type) {
      return NextResponse.json({ 
        error: 'Payment method type is required' 
      }, { status: 400 });
    }

    // Save payment method
    await saveCustomerPaymentMethodWithAdminAPI({
      customerId: user.id,
      paymentMethod: {
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method saved successfully',
      paymentMethod: {
        type,
        last4,
        expiryMonth,
        expiryYear,
        isDefault
      }
    });
  } catch (error) {
    console.error('Error saving payment method:', error);
    return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 });
  }
} 
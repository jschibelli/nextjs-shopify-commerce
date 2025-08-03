import { getAuth } from 'lib/auth';
import { createCustomerAddressWithAdminAPI, getCustomer, getCustomerWithAdminAPI } from 'lib/shopify';
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

    console.log('Customer token:', tokenCookie.value);
    console.log('User ID:', user.id);
    console.log('User email:', user.email);

    try {
      // Try to get customer data from Shopify Storefront API first
      const customer = await getCustomer(tokenCookie.value);
      
      return NextResponse.json({
        success: true,
        addresses: customer.addresses || [],
        defaultAddress: customer.defaultAddress
      });
    } catch (shopifyError) {
      console.log('Storefront API failed, trying Admin API:', shopifyError);
      
      try {
        // Fallback to Admin API to get customer data
        const adminCustomer = await getCustomerWithAdminAPI(user.id);
        
        console.log('Admin API customer data:', adminCustomer);
        
        // Transform Admin API address format to match Storefront API format
        const addresses = adminCustomer.addresses?.map((addr: any) => ({
          id: addr.id.toString(),
          firstName: addr.first_name,
          lastName: addr.last_name,
          company: addr.company,
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          province: addr.province,
          country: addr.country,
          zip: addr.zip,
          phone: addr.phone
        })) || [];

        return NextResponse.json({
          success: true,
          addresses,
          defaultAddress: null
        });
      } catch (adminError) {
        console.log('Admin API also failed, returning empty addresses:', adminError);
        
        // If both APIs fail, return empty addresses
        return NextResponse.json({
          success: true,
          addresses: [],
          defaultAddress: null,
          message: 'Using local address management (Shopify sync unavailable)'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
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

    const body = await request.json();
    const {
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      province,
      country,
      zip,
      phone
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !address1 || !city || !province || !country || !zip) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    try {
      // Create address in Shopify using Admin API
      console.log('Creating address for customer:', user.id);
      console.log('Address data:', {
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        province,
        country,
        zip,
        phone
      });

      const shopifyAddress = await createCustomerAddressWithAdminAPI({
        customerId: user.id,
        address: {
          firstName,
          lastName,
          company,
          address1,
          address2,
          city,
          province,
          country,
          zip,
          phone
        }
      });

      console.log('Shopify address response:', shopifyAddress);

      // Transform the response to match our frontend format
      const address = {
        id: shopifyAddress?.id?.toString() || `addr_${Date.now()}`,
        firstName: shopifyAddress?.first_name || firstName,
        lastName: shopifyAddress?.last_name || lastName,
        company: shopifyAddress?.company || company,
        address1: shopifyAddress?.address1 || address1,
        address2: shopifyAddress?.address2 || address2,
        city: shopifyAddress?.city || city,
        province: shopifyAddress?.province || province,
        country: shopifyAddress?.country || country,
        zip: shopifyAddress?.zip || zip,
        phone: shopifyAddress?.phone || phone
      };

      return NextResponse.json({
        success: true,
        message: 'Address added successfully to Shopify',
        address
      });
    } catch (shopifyError) {
      console.error('Failed to create address in Shopify:', shopifyError);
      
      // Fallback to local storage if Shopify fails
      return NextResponse.json({
        success: true,
        message: 'Address added locally (Shopify sync failed)',
        address: {
          id: `addr_${Date.now()}`,
          firstName,
          lastName,
          company,
          address1,
          address2,
          city,
          province,
          country,
          zip,
          phone
        }
      });
    }
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
} 
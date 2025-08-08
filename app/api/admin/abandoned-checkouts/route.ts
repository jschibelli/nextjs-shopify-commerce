import { getAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ABANDONED CHECKOUTS API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      console.log('Admin access denied - no admin user');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin user authenticated:', adminUser.email);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const timeRange = searchParams.get('timeRange') || '7';

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    console.log('Environment variables found - domain:', domain);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));

    // Fetch abandoned checkouts from Shopify
    const checkoutsResponse = await fetch(
      `https://${domain}/admin/api/2025-01/checkouts.json?status=open&created_at_min=${startDate.toISOString()}&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!checkoutsResponse.ok) {
      throw new Error(`Failed to fetch abandoned checkouts: ${checkoutsResponse.statusText}`);
    }

    const checkoutsData = await checkoutsResponse.json();
    let checkouts = checkoutsData.checkouts || [];

    // Filter abandoned checkouts (older than 1 hour and not completed)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    checkouts = checkouts.filter((checkout: any) => {
      const updatedAt = new Date(checkout.updated_at);
      return updatedAt < oneHourAgo && !checkout.completed_at;
    });

    // Filter by recovery status if specified
    if (status !== 'all') {
      checkouts = checkouts.filter((checkout: any) => {
        if (status === 'recovered') return checkout.completed_at;
        if (status === 'pending') return !checkout.completed_at && !checkout.recovery_email_sent;
        if (status === 'contacted') return !checkout.completed_at && checkout.recovery_email_sent;
        return true;
      });
    }

    // Calculate statistics
    const now = new Date();
    const last24Hours = checkouts.filter((c: any) => 
      new Date(c.updated_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );
    const last7Days = checkouts.filter((c: any) => 
      new Date(c.updated_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );

    const stats = {
      total: checkouts.length,
      pending: checkouts.filter((c: any) => !c.recovery_email_sent).length,
      contacted: checkouts.filter((c: any) => c.recovery_email_sent && !c.completed_at).length,
      recovered: checkouts.filter((c: any) => c.completed_at).length,
      totalValue: checkouts.reduce((sum: number, c: any) => sum + parseFloat(c.total_price || 0), 0),
      averageValue: checkouts.length > 0 
        ? checkouts.reduce((sum: number, c: any) => sum + parseFloat(c.total_price || 0), 0) / checkouts.length
        : 0,
      last24Hours: last24Hours.length,
      last7Days: last7Days.length,
      recoveryRate: checkouts.length > 0 
        ? (checkouts.filter((c: any) => c.completed_at).length / checkouts.length) * 100
        : 0
    };

    // Enrich checkout data with additional info
    const enrichedCheckouts = checkouts.map((checkout: any) => ({
      ...checkout,
      time_since_abandonment: Math.floor((now.getTime() - new Date(checkout.updated_at).getTime()) / (1000 * 60 * 60)),
      recovery_potential: calculateRecoveryPotential(checkout),
      customer_info: {
        email: checkout.email,
        phone: checkout.phone,
        name: `${checkout.billing_address?.first_name || ''} ${checkout.billing_address?.last_name || ''}`.trim() || 'Anonymous'
      }
    }));

    return NextResponse.json({
      checkouts: enrichedCheckouts,
      stats,
      pagination: {
        page: 1,
        limit: 250,
        total: enrichedCheckouts.length
      }
    });

  } catch (error) {
    console.error('Abandoned checkouts fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch abandoned checkouts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== SEND RECOVERY EMAIL API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { checkout_ids, email_template, send_immediately } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    const results = [];

    for (const checkoutId of checkout_ids) {
      try {
        // Get checkout details
        const checkoutResponse = await fetch(
          `https://${domain}/admin/api/2025-01/checkouts/${checkoutId}.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!checkoutResponse.ok) {
          throw new Error(`Failed to fetch checkout ${checkoutId}`);
        }

        const checkout = await checkoutResponse.json();

        // Send recovery email using Shopify's abandoned checkout recovery
        const recoveryResponse = await fetch(
          `https://${domain}/admin/api/2025-01/checkouts/${checkoutId}/recovery_emails.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recovery_email: {
                email: checkout.checkout.email,
                subject: email_template?.subject || 'Complete your purchase - items are waiting!',
                body: email_template?.body || getDefaultRecoveryEmailBody(checkout.checkout),
                send_at: send_immediately ? new Date().toISOString() : undefined
              }
            }),
          }
        );

        if (recoveryResponse.ok) {
          results.push({
            checkout_id: checkoutId,
            success: true,
            email: checkout.checkout.email
          });
        } else {
          const errorData = await recoveryResponse.json();
          results.push({
            checkout_id: checkoutId,
            success: false,
            error: errorData.errors || 'Failed to send recovery email'
          });
        }

      } catch (error) {
        results.push({
          checkout_id: checkoutId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        success_rate: results.length > 0 ? (successCount / results.length) * 100 : 0
      },
      message: `Sent ${successCount} recovery emails, ${failureCount} failed`
    });

  } catch (error) {
    console.error('Recovery email send error:', error);
    return NextResponse.json({ 
      error: 'Failed to send recovery emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to calculate recovery potential
function calculateRecoveryPotential(checkout: any): 'high' | 'medium' | 'low' {
  const hoursSinceAbandonment = Math.floor(
    (Date.now() - new Date(checkout.updated_at).getTime()) / (1000 * 60 * 60)
  );
  const totalPrice = parseFloat(checkout.total_price || 0);
  const hasEmail = !!checkout.email;
  const hasShippingAddress = !!checkout.shipping_address;

  let score = 0;

  // Time factor (fresher = better)
  if (hoursSinceAbandonment < 4) score += 3;
  else if (hoursSinceAbandonment < 24) score += 2;
  else if (hoursSinceAbandonment < 72) score += 1;

  // Value factor
  if (totalPrice > 100) score += 2;
  else if (totalPrice > 50) score += 1;

  // Completion factor
  if (hasEmail) score += 1;
  if (hasShippingAddress) score += 1;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// Helper function to generate default recovery email body
function getDefaultRecoveryEmailBody(checkout: any): string {
  const customerName = checkout.billing_address?.first_name || 'there';
  const itemCount = checkout.line_items?.length || 0;
  const totalPrice = checkout.total_price || '0.00';

  return `
Hi ${customerName},

You left ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart worth $${totalPrice}.

Don't miss out! Complete your purchase now and get your items on the way.

Your cart includes:
${checkout.line_items?.map((item: any) => 
  `• ${item.title} - $${item.price}`
).join('\n') || ''}

Complete your purchase: ${checkout.abandoned_checkout_url}

Thanks,
Your Store Team
  `.trim();
} 
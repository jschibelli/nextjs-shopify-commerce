import { getAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GIFT CARDS API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      console.log('Admin access denied - no admin user');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Admin user authenticated:', adminUser.email);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    console.log('Environment variables found - domain:', domain);

    // Fetch gift cards from Shopify
    const giftCardsResponse = await fetch(`https://${domain}/admin/api/2025-01/gift_cards.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!giftCardsResponse.ok) {
      throw new Error(`Failed to fetch gift cards: ${giftCardsResponse.statusText}`);
    }

    const giftCardsData = await giftCardsResponse.json();
    let giftCards = giftCardsData.gift_cards || [];

    // Filter by status
    if (status !== 'all') {
      giftCards = giftCards.filter((card: any) => {
        if (status === 'active') return card.disabled_at === null && parseFloat(card.balance) > 0;
        if (status === 'disabled') return card.disabled_at !== null;
        if (status === 'expired') return card.expires_on && new Date(card.expires_on) < new Date();
        if (status === 'depleted') return parseFloat(card.balance) === 0;
        return true;
      });
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      giftCards = giftCards.filter((card: any) => 
        card.code?.toLowerCase().includes(searchLower) ||
        card.note?.toLowerCase().includes(searchLower) ||
        card.customer?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const stats = {
      total: giftCardsData.gift_cards?.length || 0,
      active: giftCardsData.gift_cards?.filter((card: any) => 
        card.disabled_at === null && parseFloat(card.balance) > 0
      ).length || 0,
      disabled: giftCardsData.gift_cards?.filter((card: any) => 
        card.disabled_at !== null
      ).length || 0,
      expired: giftCardsData.gift_cards?.filter((card: any) => 
        card.expires_on && new Date(card.expires_on) < new Date()
      ).length || 0,
      depleted: giftCardsData.gift_cards?.filter((card: any) => 
        parseFloat(card.balance) === 0
      ).length || 0,
      totalValue: giftCardsData.gift_cards?.reduce((sum: number, card: any) => 
        sum + parseFloat(card.balance || 0), 0
      ) || 0,
      totalIssued: giftCardsData.gift_cards?.reduce((sum: number, card: any) => 
        sum + parseFloat(card.initial_value || 0), 0
      ) || 0,
    };

    return NextResponse.json({
      gift_cards: giftCards,
      stats,
      pagination: {
        page: 1,
        limit: 50,
        total: giftCards.length
      }
    });

  } catch (error) {
    console.error('Gift cards fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch gift cards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE GIFT CARD API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      console.log('Admin access denied - no admin user');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { initial_value, note, expires_on, customer_id, send_email } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    // Create gift card
    const giftCardData = {
      gift_card: {
        initial_value: parseFloat(initial_value),
        note: note || '',
        ...(expires_on && { expires_on }),
        ...(customer_id && { customer_id: parseInt(customer_id) }),
      }
    };

    const createResponse = await fetch(`https://${domain}/admin/api/2025-01/gift_cards.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(giftCardData),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create gift card: ${JSON.stringify(errorData)}`);
    }

    const newGiftCard = await createResponse.json();

    // If send_email is true and customer_id is provided, send email notification
    if (send_email && customer_id) {
      try {
        await fetch(`https://${domain}/admin/api/2025-01/gift_cards/${newGiftCard.gift_card.id}/send_email.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gift_card_email: {
              to: newGiftCard.gift_card.customer?.email || '',
              subject: 'Your Gift Card is Ready!',
              message: `Here's your gift card worth $${initial_value}. Use code: ${newGiftCard.gift_card.code}`
            }
          }),
        });
      } catch (emailError) {
        console.error('Failed to send gift card email:', emailError);
      }
    }

    return NextResponse.json({
      gift_card: newGiftCard.gift_card,
      success: true,
      message: 'Gift card created successfully'
    });

  } catch (error) {
    console.error('Gift card creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create gift card',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== UPDATE GIFT CARD API CALLED ===');
    
    const adminAuth = getAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, action, ...updateData } = body;

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !accessToken) {
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 });
    }

    let response;

    if (action === 'disable') {
      // Disable gift card
      response = await fetch(`https://${domain}/admin/api/2025-01/gift_cards/${id}/disable.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
    } else if (action === 'enable') {
      // Enable gift card
      response = await fetch(`https://${domain}/admin/api/2025-01/gift_cards/${id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gift_card: {
            disabled_at: null
          }
        }),
      });
    } else {
      // Update gift card
      response = await fetch(`https://${domain}/admin/api/2025-01/gift_cards/${id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gift_card: updateData
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update gift card: ${JSON.stringify(errorData)}`);
    }

    const updatedGiftCard = await response.json();

    return NextResponse.json({
      gift_card: updatedGiftCard.gift_card,
      success: true,
      message: 'Gift card updated successfully'
    });

  } catch (error) {
    console.error('Gift card update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update gift card',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
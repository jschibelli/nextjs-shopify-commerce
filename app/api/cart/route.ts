import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from 'lib/shopify';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cart = await getCart();
    
    if (!cart) {
      return NextResponse.json({ cart: null });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, merchandiseId, quantity, lineId } = body;

    switch (action) {
      case 'add': {
        if (!merchandiseId || !quantity) {
          return NextResponse.json(
            { error: 'Missing merchandiseId or quantity' },
            { status: 400 }
          );
        }

        const cart = await addToCart([{ merchandiseId, quantity }]);
        revalidateTag(TAGS.cart);
        
        return NextResponse.json({ cart });
      }

      case 'update': {
        if (!lineId || quantity === undefined) {
          return NextResponse.json(
            { error: 'Missing lineId or quantity' },
            { status: 400 }
          );
        }

        const cart = await updateCart([{ id: lineId, merchandiseId, quantity }]);
        revalidateTag(TAGS.cart);
        
        return NextResponse.json({ cart });
      }

      case 'remove': {
        if (!lineId) {
          return NextResponse.json(
            { error: 'Missing lineId' },
            { status: 400 }
          );
        }

        const cart = await removeFromCart([lineId]);
        revalidateTag(TAGS.cart);
        
        return NextResponse.json({ cart });
      }

      case 'clear': {
        const cart = await getCart();
        if (cart && cart.lines.length > 0) {
          const lineIds = cart.lines.map(line => line.id).filter((id): id is string => Boolean(id));
          if (lineIds.length > 0) {
            await removeFromCart(lineIds);
            revalidateTag(TAGS.cart);
          }
        }
        
        return NextResponse.json({ cart: null });
      }

      case 'create': {
        const cart = await createCart();
        const cookieStore = await cookies();
        cookieStore.set('cartId', cart.id!);
        
        return NextResponse.json({ cart });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing cart action:', error);
    return NextResponse.json(
      { error: 'Failed to process cart action' },
      { status: 500 }
    );
  }
} 
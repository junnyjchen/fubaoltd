/**
 * Spree Commerce API v2 — Cart.
 *
 * POST /api/v2/storefront/cart  → Create a guest cart (returns X-Spree-Order-Token).
 * GET  /api/v2/storefront/cart  → Reconnect to an existing cart via token header.
 */

import { NextResponse } from 'next/server';
import { createOrder, getOrderByToken } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';

export async function POST() {
  const cart = createOrder();

  return NextResponse.json(
    {
      data: serializeOrder(cart),
      included: orderIncluded(cart),
    },
    {
      headers: {
        'X-Spree-Order-Token': cart.guestToken,
      },
    }
  );
}

export async function GET(request: Request) {
  const token =
    request.headers.get('X-Spree-Order-Token') ||
    new URL(request.url).searchParams.get('token') ||
    '';

  if (!token) {
    return NextResponse.json({ error: 'Order token is required' }, { status: 401 });
  }

  const cart = getOrderByToken(token);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: serializeOrder(cart),
    included: orderIncluded(cart),
  });
}

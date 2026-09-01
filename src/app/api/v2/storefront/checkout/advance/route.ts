/**
 * Spree Commerce API v2 — Checkout advance.
 *
 * GET/POST /api/v2/storefront/checkout/advance
 *
 * Advances the order through all available states until it can go no further
 * (typically until "payment" state, since payment must be explicitly selected).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, advanceUntilPayment } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json(
      { error: 'Order token is required. Provide X-Spree-Order-Token header.' },
      { status: 401 }
    );
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  advanceUntilPayment(order);
  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

/**
 * Spree Commerce API v2 — Available shipping rates for current cart.
 *
 * GET /api/v2/storefront/checkout/shipments
 *
 * Note: Spree exposes shipping rates via `/checkout/shipments` and
 * `/checkout/shipping_rates`; we implement both paths for SDK compat.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  const payload = serializeOrder(order);
  return NextResponse.json({ data: payload, included: [] });
}

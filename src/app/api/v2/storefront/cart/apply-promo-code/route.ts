/**
 * Spree Commerce API v2 — Apply promo code to cart.
 *
 * PATCH /api/v2/storefront/cart/apply-promo-code
 * Body: { coupon_code: string }
 *
 * Validates against the FuBao coupon engine (WELCOME10, SAVE5, FREESHIP, VIP20).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { applyPromoCode } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded, resolveCartFromRequest } from '@/lib/spree-compat/order-serializer';

export async function PATCH(request: NextRequest) {
  const cart = await resolveCartFromRequest(request);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  let body: { coupon_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.coupon_code || typeof body.coupon_code !== 'string') {
    return NextResponse.json({ error: 'coupon_code is required' }, { status: 422 });
  }

  const result = applyPromoCode(cart, body.coupon_code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
}

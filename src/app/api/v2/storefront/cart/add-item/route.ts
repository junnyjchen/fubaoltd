/**
 * Spree Commerce API v2 — Add item to cart.
 *
 * POST /api/v2/storefront/cart/add-item
 * Body: { variant_id: string, quantity: number, options?: { personalization?: string } }
 * Header: X-Spree-Order-Token (guest) or Authorization: Bearer (account)
 *
 * Spree auto-creates a cart when none exists; the new guest token is returned
 * via the X-Spree-Order-Token response header.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOrCreateCart, addItemToCart } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded, resolveRequestUser } from '@/lib/spree-compat/order-serializer';

export async function POST(request: NextRequest) {
  const guestToken = request.headers.get('X-Spree-Order-Token');
  const user = await resolveRequestUser(request);

  if (!guestToken && !user) {
    return NextResponse.json({ error: 'The access token is invalid' }, { status: 401 });
  }

  let body: { variant_id?: string; quantity?: number; options?: { personalization?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const variantId = body.variant_id;
  const quantity = Number(body.quantity ?? 1);

  if (!variantId) {
    return NextResponse.json({ error: 'variant_id is required' }, { status: 422 });
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 422 });
  }

  const personalization = body.options?.personalization?.trim();
  const cart = getOrCreateCart(guestToken, user?.sub, user?.email);
  const result = addItemToCart(cart, variantId, quantity, personalization || undefined);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(
    { data: serializeOrder(cart), included: orderIncluded(cart) },
    { headers: { 'X-Spree-Order-Token': cart.guestToken } }
  );
}

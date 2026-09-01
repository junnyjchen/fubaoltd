/**
 * Spree Commerce API v2 — Set line item quantity.
 *
 * PATCH /api/v2/storefront/cart/set-quantity/[id]
 * Body: { quantity: number }  (quantity 0 removes the item)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setLineItemQuantity } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded, resolveCartFromRequest } from '@/lib/spree-compat/order-serializer';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cart = await resolveCartFromRequest(request);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  let body: { quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 422 });
  }

  const result = setLineItemQuantity(cart, id, quantity);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
}

/**
 * Spree Commerce API v2 — Remove all line items.
 *
 * DELETE /api/v2/storefront/cart/empty
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { emptyCart } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded, resolveCartFromRequest } from '@/lib/spree-compat/order-serializer';

export async function DELETE(request: NextRequest) {
  const cart = await resolveCartFromRequest(request);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  emptyCart(cart);
  return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
}

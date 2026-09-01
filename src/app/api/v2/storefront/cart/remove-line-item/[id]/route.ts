/**
 * Spree Commerce API v2 — Remove line item.
 *
 * DELETE /api/v2/storefront/cart/remove-line-item/[id]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { removeLineItem } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded, resolveCartFromRequest } from '@/lib/spree-compat/order-serializer';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cart = await resolveCartFromRequest(request);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  const removed = removeLineItem(cart, id);
  if (!removed) {
    return NextResponse.json({ error: `Line item ${id} not found` }, { status: 422 });
  }

  return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
}

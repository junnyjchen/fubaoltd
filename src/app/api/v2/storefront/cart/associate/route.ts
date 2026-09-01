/**
 * Spree Commerce API v2 — Associate guest cart with a user account.
 *
 * PATCH /api/v2/storefront/cart/associate
 * Headers: Authorization: Bearer <account token> + X-Spree-Order-Token <guest token>
 *
 * Called when a guest with items in cart logs in: the guest cart is claimed
 * by the user so it appears in their account and survives new sessions.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOrderByToken, associateOrderWithUser } from '@/lib/spree-compat/order-store';
import { serializeOrder, resolveRequestUser } from '@/lib/spree-compat/order-serializer';

export async function PATCH(request: NextRequest) {
  const user = await resolveRequestUser(request);
  if (!user?.sub) {
    return NextResponse.json({ error: 'The access token is invalid' }, { status: 401 });
  }

  const guestToken = request.headers.get('X-Spree-Order-Token');
  const order = getOrderByToken(guestToken);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  if (order.userId && order.userId !== user.sub) {
    return NextResponse.json(
      { error: 'Cart already belongs to another user' },
      { status: 422 }
    );
  }

  associateOrderWithUser(order, user.sub, user.email);
  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

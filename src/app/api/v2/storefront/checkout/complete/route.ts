/**
 * Spree Commerce API v2 — Complete the checkout.
 *
 * PATCH/PUT /api/v2/storefront/checkout/complete
 * Transitions the order to complete (paid). Tolerates being called after
 * the confirm step already completed the order (idempotent success).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  completeOrder,
  getCartByToken,
  advanceCheckoutSteps,
} from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';
import { notifyOrderCompleted } from '@/lib/notifications/order-notify';
import { recordOrderCommission } from '@/lib/distribution/order-commission';

export async function PATCH(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const cart = getCartByToken(token);
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  if (cart.lineItems.length === 0) {
    return NextResponse.json({ error: 'Cannot complete an empty order' }, { status: 422 });
  }

  // Already completed (e.g. confirm step finished it) → idempotent success.
  if (cart.state === 'complete') {
    return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
  }

  // Fill in any pending step transitions (e.g. payment step not advanced).
  advanceCheckoutSteps(cart);

  if (!completeOrder(cart)) {
    return NextResponse.json(
      {
        error: `Cannot complete order in state "${cart.state}". Advance the checkout to "confirm" first.`,
      },
      { status: 422 }
    );
  }

  // Notify the buyer when the cart belongs to a logged-in user (guest carts
  // have no account to notify). Deduped by order number.
  notifyOrderCompleted(cart);

  // Credit referral commission if the buyer was referred by another user
  // (referredBy set at registration via ?ref= code). No-op for guests,
  // self-referrals, or already-credited orders.
  await recordOrderCommission(cart);

  return NextResponse.json({ data: serializeOrder(cart), included: orderIncluded(cart) });
}

export { PATCH as PUT };

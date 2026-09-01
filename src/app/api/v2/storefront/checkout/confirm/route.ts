/**
 * Spree Commerce API v2 — Checkout confirm step.
 *
 * PATCH/PUT /api/v2/storefront/checkout/confirm
 * Advances the order to the "confirm" state (filling any missing steps
 * whose data is already present) and then transitions to complete,
 * mirroring Spree's confirm-step completion semantics.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getCartByToken,
  advanceCheckoutSteps,
  completeOrder,
} from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';

export async function PATCH(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  if (order.state === 'complete') {
    // Idempotent: confirming a completed order is a no-op.
    return NextResponse.json({ data: serializeOrder(order), included: orderIncluded(order) });
  }

  // Bring the order up to the confirm state (no-op when already there).
  advanceCheckoutSteps(order);

  if (order.state !== 'confirm' || !completeOrder(order)) {
    return NextResponse.json(
      {
        error: `Cannot transition from state "${order.state}". Complete the previous checkout steps first.`,
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ data: serializeOrder(order), included: orderIncluded(order) });
}

export { PATCH as PUT };

/**
 * Spree Commerce API v2 — Checkout: advance one state.
 *
 * GET/POST /api/v2/storefront/checkout/next
 *
 * State machine: cart → address → delivery → payment → confirm → complete.
 * Returns 422 when the current step's prerequisites are not met (Spree parity).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, advanceOrderState } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  return handleNext(request);
}

export async function POST(request: NextRequest) {
  return handleNext(request);
}

async function handleNext(request: NextRequest) {
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

  const advanced = advanceOrderState(order);
  if (!advanced) {
    return NextResponse.json(
      {
        error: `Cannot transition from state "${order.state}". Complete required steps first.`,
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ data: serializeOrder(order), included: orderIncluded(order) });
}

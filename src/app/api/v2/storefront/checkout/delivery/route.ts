/**
 * Spree Commerce API v2 — Checkout delivery step.
 *
 * PATCH /api/v2/storefront/checkout/delivery
 * Body: { order: { shipments_attributes: [{ selected_shipping_rate_id: number }] } }
 * GET  → returns order with available shipments (shipping rates included)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, selectShippingRate, advanceCheckoutSteps } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function PATCH(request: NextRequest) {
  return handle(request);
}

export async function PUT(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }
  const order = getCartByToken(token);
  if (!order) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

async function handle(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const orderPayload = (body.order as Record<string, unknown>) ?? body;
  const shipments = orderPayload.shipments_attributes as Array<Record<string, unknown>> | undefined;
  const rateId = shipments?.[0]?.selected_shipping_rate_id as string | number | undefined;

  if (rateId === undefined) {
    return NextResponse.json(
      { error: 'shipments_attributes[0].selected_shipping_rate_id is required' },
      { status: 422 }
    );
  }

  const ok = selectShippingRate(order, String(rateId));
  if (!ok) {
    return NextResponse.json({ error: `Shipping rate ${rateId} not found` }, { status: 422 });
  }

  // Spree semantics: selecting a shipping rate transitions delivery → payment.
  advanceCheckoutSteps(order);

  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

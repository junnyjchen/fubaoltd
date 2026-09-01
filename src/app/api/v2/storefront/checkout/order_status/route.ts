/**
 * Spree Commerce API v2 — Order status by number.
 *
 * GET /api/v2/storefront/checkout/order_status?order_number=XXX
 * Returns the serialized order for tracking (no token required for status polling).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getOrderByNumber } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('order_number');

  if (!orderNumber) {
    return NextResponse.json({ error: 'order_number param is required.' }, { status: 400 });
  }

  const order = getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ data: serializeOrder(order) });
}

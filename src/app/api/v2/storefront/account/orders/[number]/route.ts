/**
 * Spree Commerce API v2 — Account order detail.
 *
 * GET /api/v2/storefront/account/orders/{number}
 * Returns a single order belonging to the authenticated user.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireSpreeUser } from '@/lib/spree-compat/account-auth';
import { getOrderByNumber } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { number } = await context.params;

  const user = await requireSpreeUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const order = getOrderByNumber(number);
  if (!order || order.userId !== user.id) {
    return NextResponse.json(
      { errors: [{ detail: 'The resource you were looking for could not be found.' }] },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: serializeOrder(order), included: orderIncluded(order) });
}

/**
 * Spree Commerce API v2 — Account orders list.
 *
 * GET /api/v2/storefront/account/orders?filter[number]=RXXXXXXXX
 *
 * Returns the current user's orders (completed orders first, newest first),
 * matching Spree's /account/orders contract.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth/user-store';
import { verifyToken } from '@/lib/auth/jwt';
import { listOrdersForUser, getOrderByNumber } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = token ? await verifyToken(token) : null;
  const user = payload?.sub ? await getUserById(payload.sub) : null;
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const filterNumber = request.nextUrl.searchParams.get('filter[number]');
  if (filterNumber) {
    const order = getOrderByNumber(filterNumber);
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data: [serializeOrder(order)] });
  }

  // Spree /account/orders returns the user's *completed* order history.
  const all = listOrdersForUser(user.id).filter((order) => order.state === 'complete');

  const page = Math.max(parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10) || 1, 1);
  const perPage = Math.max(
    parseInt(request.nextUrl.searchParams.get('per_page') ?? '25', 10) || 25,
    1
  );
  const totalPages = Math.max(Math.ceil(all.length / perPage), 1);
  const orders = all.slice((page - 1) * perPage, page * perPage);

  return NextResponse.json({
    data: orders.map(serializeOrder),
    meta: { count: orders.length, total_count: all.length, total_pages: totalPages },
    links: {
      self: `/api/v2/storefront/account/orders?page=${page}`,
      next: page < totalPages ? `/api/v2/storefront/account/orders?page=${page + 1}` : null,
      prev: page > 1 ? `/api/v2/storefront/account/orders?page=${page - 1}` : null,
      last: `/api/v2/storefront/account/orders?page=${totalPages}`,
      first: '/api/v2/storefront/account/orders?page=1',
    },
  });
}

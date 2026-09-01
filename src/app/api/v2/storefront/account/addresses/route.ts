/**
 * Spree Commerce API v2 — Account addresses.
 *
 * GET /api/v2/storefront/account/addresses
 *
 * Returns the user's saved addresses. The demo derives the default address
 * from the user's most recent order (Spree's default_address semantics).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth/user-store';
import { verifyToken } from '@/lib/auth/jwt';
import { listOrdersForUser } from '@/lib/spree-compat/order-store';
import type { SpreeResource } from '@/lib/spree-compat/types';

function serializeAddress(id: string, address: NonNullable<Awaited<ReturnType<typeof listOrdersForUser>>[number]['shipAddress']>): SpreeResource {
  return {
    id,
    type: 'address',
    attributes: {
      firstname: address.firstname,
      lastname: address.lastname,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      zipcode: address.zipcode,
      phone: address.phone,
      state_name: address.state_name,
      country_iso: address.country_iso,
    },
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = token ? await verifyToken(token) : null;
  const user = payload?.sub ? await getUserById(payload.sub) : null;
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const orders = listOrdersForUser(user.id);
  const withAddress = orders.find((o) => o.shipAddress !== null);
  const addresses = withAddress?.shipAddress
    ? [serializeAddress(`${user.id}-default`, withAddress.shipAddress)]
    : [];

  return NextResponse.json({ data: addresses, meta: { count: addresses.length, total_count: addresses.length } });
}

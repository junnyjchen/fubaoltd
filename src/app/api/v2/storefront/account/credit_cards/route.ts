/**
 * Spree Commerce API v2 — Account saved credit cards.
 *
 * GET /api/v2/storefront/account/credit_cards
 *
 * Returns saved card payment sources. The FuBao demo does not persist card
 * details (Stripe tokenization handles them client-side), so this returns an
 * empty collection — a valid Spree response for a user without saved cards.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth/user-store';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const payload = token ? await verifyToken(token) : null;
  const user = payload?.sub ? await getUserById(payload.sub) : null;
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({ data: [], meta: { count: 0, total_count: 0 } });
}

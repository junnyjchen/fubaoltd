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
import { requireSpreeUser } from '@/lib/spree-compat/account-auth';

export async function GET(request: NextRequest) {
  const user = await requireSpreeUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({ data: [], meta: { count: 0, total_count: 0 } });
}

/**
 * Admin console for the Free Blessing (接福) activity.
 *
 * GET    → config + claims (enriched with user email / order state) + stats + product
 * PUT    → update activity config (window, quota, pickup details, active toggle)
 * POST   → { action: 'redeem' | 'reset_config', claimId? } — redeem a pickup code
 * DELETE → ?claimId= — delete a claim (frees the account to claim again)
 *
 * Admin role required (see AGENTS.md auth patterns).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';
import { getOrderByToken } from '@/lib/spree-compat/order-store';
import { getProductBySlug } from '@/lib/api';
import {
  BlessingClaim,
  BlessingConfig,
  checkBlessingAvailability,
  deleteBlessingClaim,
  getBlessingConfig,
  listBlessingClaims,
  redeemBlessingClaim,
  resetBlessingConfig,
  updateBlessingConfig,
} from '@/lib/blessing/blessing-store';

interface AdminClaimView extends BlessingClaim {
  claimId: string;
  userEmail: string | null;
  userName: string | null;
  /** Associated Spree order (mail claims only), derived from the cart token */
  orderNumber: string | null;
  orderState: string | null;
}

async function toAdminView(claim: BlessingClaim): Promise<AdminClaimView> {
  const user = await getUserById(claim.userId);
  const order = claim.cartToken ? getOrderByToken(claim.cartToken) : null;
  return {
    ...claim,
    claimId: claim.userId,
    userEmail: user?.email ?? null,
    userName: user?.name ?? null,
    orderNumber: order?.number ?? null,
    orderState: order?.state ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const code = error instanceof Error && error.message === 'Forbidden' ? 403 : 401;
    return NextResponse.json({ error: 'Unauthorized' }, { status: code });
  }

  const config: BlessingConfig = getBlessingConfig();
  const claims = await Promise.all(listBlessingClaims().map(toAdminView));
  const availability = checkBlessingAvailability();
  const product = await getProductBySlug('free-blessing-talisman');

  const stats = {
    totalClaims: claims.length,
    pickupClaims: claims.filter((c) => c.method === 'pickup').length,
    mailClaims: claims.filter((c) => c.method === 'mail').length,
    fulfilled: claims.filter((c) => c.status === 'fulfilled').length,
    quota: config.totalQuota,
    quotaUsed: claims.length,
    status: availability.status,
  };

  return NextResponse.json({
    config,
    claims,
    stats,
    availability,
    product: product
      ? {
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageKey: product.image_key,
          isFreeGift: product.isFreeGift ?? true,
          description: product.tagline,
        }
      : null,
  });
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const code = error instanceof Error && error.message === 'Forbidden' ? 403 : 401;
    return NextResponse.json({ error: 'Unauthorized' }, { status: code });
  }

  const body = (await request.json()) as Partial<BlessingConfig>;

  // Cross-field validation: when both window ends exist, end must be after start
  const candidate = { ...getBlessingConfig(), ...body };
  if (candidate.startAt && candidate.endAt) {
    const start = Date.parse(candidate.startAt);
    const end = Date.parse(candidate.endAt);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }
  }

  const config = updateBlessingConfig(body);
  return NextResponse.json({ config });
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const code = error instanceof Error && error.message === 'Forbidden' ? 403 : 401;
    return NextResponse.json({ error: 'Unauthorized' }, { status: code });
  }

  const body = (await request.json()) as { action?: string; claimId?: string };

  if (body.action === 'reset_config') {
    return NextResponse.json({ config: resetBlessingConfig() });
  }

  if (body.action === 'redeem') {
    if (!body.claimId) {
      return NextResponse.json({ error: 'claimId is required' }, { status: 400 });
    }
    const claim = redeemBlessingClaim(body.claimId);
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }
    return NextResponse.json({ claim: await toAdminView(claim) });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const code = error instanceof Error && error.message === 'Forbidden' ? 403 : 401;
    return NextResponse.json({ error: 'Unauthorized' }, { status: code });
  }

  const claimId = request.nextUrl.searchParams.get('claimId');
  if (!claimId) {
    return NextResponse.json({ error: 'claimId is required' }, { status: 400 });
  }
  const ok = deleteBlessingClaim(claimId);
  if (!ok) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

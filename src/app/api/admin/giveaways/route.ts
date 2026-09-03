/**
 * Admin console — Giveaway management (full CRUD + winner fulfillment).
 *
 * GET    → all giveaways + stats
 * POST   → create { title, description, productName, productSlug, productImage?,
 *          totalPrizes, startDate, endDate, status? }
 * PUT    → { id, updates } — edit title/description/dates/quota/status
 *          (stock guard: cannot shrink below already-claimed count)
 * PATCH  → { giveawayId, winnerId } — mark a prize claim fulfilled
 * DELETE → ?id= — remove giveaway
 *
 * The same store powers the public /giveaways claim flow, so edits are live
 * instantly. Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import type { Giveaway } from '@/lib/giveaways/types';
import {
  createGiveaway,
  deleteGiveaway,
  getAllGiveaways,
  markWinnerFulfilled,
  updateGiveaway,
} from '@/lib/giveaways/giveaway-store';

const GIVEAWAY_STATUSES = ['upcoming', 'active', 'ended'] as const;

function authError(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Forbidden') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  if (message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const giveaways = getAllGiveaways();
  const claimed = giveaways.reduce((sum, g) => sum + g.claimedCount, 0);
  const fulfilled = giveaways.reduce(
    (sum, g) => sum + g.winners.filter((w) => w.prizeFulfilled).length,
    0
  );
  return NextResponse.json({
    success: true,
    data: {
      giveaways,
      stats: {
        total: giveaways.length,
        active: giveaways.filter((g) => g.status === 'active').length,
        totalPrizes: giveaways.reduce((sum, g) => sum + g.totalPrizes, 0),
        claimed,
        fulfilled,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const productName = String(body.productName ?? '').trim();
    const productSlug = String(body.productSlug ?? '').trim();
    const totalPrizes = Number(body.totalPrizes);
    const startDate = String(body.startDate ?? '');
    const endDate = String(body.endDate ?? '');
    const status = body.status === undefined ? 'active' : String(body.status);

    if (title.length < 3) {
      return NextResponse.json({ success: false, error: 'Title must be at least 3 characters' }, { status: 400 });
    }
    if (!productName || !productSlug) {
      return NextResponse.json({ success: false, error: 'productName and productSlug are required' }, { status: 400 });
    }
    if (!Number.isInteger(totalPrizes) || totalPrizes <= 0 || totalPrizes > 1000) {
      return NextResponse.json({ success: false, error: 'totalPrizes must be 1-1000' }, { status: 400 });
    }
    if (!startDate || !endDate || endDate <= startDate) {
      return NextResponse.json({ success: false, error: 'endDate must be after startDate' }, { status: 400 });
    }
    if (!GIVEAWAY_STATUSES.includes(status as (typeof GIVEAWAY_STATUSES)[number])) {
      return NextResponse.json(
        { success: false, error: "status must be 'upcoming', 'active' or 'ended'" },
        { status: 400 }
      );
    }

    const giveaway = createGiveaway({
      title,
      description: body.description ? String(body.description) : '',
      productName,
      productSlug,
      productImage: body.productImage ? String(body.productImage) : undefined,
      totalPrizes,
      status: status as Giveaway['status'],
      startDate,
      endDate,
      requirements: {},
    });

    return NextResponse.json(
      { success: true, data: { giveaway }, message: `Giveaway "${title}" created` },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const id = String(body.id ?? '');
    const updates = (body.updates ?? {}) as Record<string, unknown>;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Giveaway id is required' }, { status: 400 });
    }
    const existing = getAllGiveaways().find((g) => g.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Giveaway not found' }, { status: 404 });
    }
    if (updates.status !== undefined && !GIVEAWAY_STATUSES.includes(String(updates.status) as (typeof GIVEAWAY_STATUSES)[number])) {
      return NextResponse.json(
        { success: false, error: "status must be 'upcoming', 'active' or 'ended'" },
        { status: 400 }
      );
    }
    if (updates.totalPrizes !== undefined) {
      const total = Number(updates.totalPrizes);
      if (!Number.isInteger(total) || total <= 0) {
        return NextResponse.json({ success: false, error: 'totalPrizes must be a positive integer' }, { status: 400 });
      }
      if (total < existing.claimedCount) {
        return NextResponse.json(
          { success: false, error: `Cannot shrink below ${existing.claimedCount} already-claimed prizes` },
          { status: 400 }
        );
      }
    }
    if (
      (updates.startDate !== undefined || updates.endDate !== undefined) &&
      String(updates.endDate ?? existing.endDate) <= String(updates.startDate ?? existing.startDate)
    ) {
      return NextResponse.json({ success: false, error: 'endDate must be after startDate' }, { status: 400 });
    }

    const giveaway = updateGiveaway(
      id,
      updates as Partial<Pick<Giveaway, 'title' | 'description' | 'totalPrizes' | 'status' | 'startDate' | 'endDate'>>
    );
    if (!giveaway) {
      return NextResponse.json({ success: false, error: 'Invalid updates' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: { giveaway }, message: `Giveaway "${giveaway.title}" updated` });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const giveawayId = String(body.giveawayId ?? '');
    const winnerId = String(body.winnerId ?? '');

    if (!giveawayId || !winnerId) {
      return NextResponse.json({ success: false, error: 'giveawayId and winnerId are required' }, { status: 400 });
    }

    const ok = markWinnerFulfilled(giveawayId, winnerId);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Winner record not found or already fulfilled' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { giveawayId, winnerId }, message: 'Prize claim marked fulfilled' });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!id) {
    return NextResponse.json({ success: false, error: 'Giveaway id is required' }, { status: 400 });
  }
  const existing = getAllGiveaways().find((g) => g.id === id);
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Giveaway not found' }, { status: 404 });
  }
  deleteGiveaway(id);
  return NextResponse.json({ success: true, data: { id }, message: `Giveaway "${existing.title}" deleted` });
}

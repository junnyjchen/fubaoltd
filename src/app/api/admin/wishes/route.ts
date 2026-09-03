/**
 * Admin console — Wish wall moderation.
 *
 * GET    → all wishes (pending first, then newest) + stats
 * PUT    → { id, approved } — approve / unapprove a wish
 *          (approved wishes appear on the public /wishes wall)
 * DELETE → ?id= — remove a wish
 *
 * Public submissions arrive via POST /api/wishes with approved: false.
 * Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import {
  deleteWish,
  getWishStats,
  listAllWishes,
  setWishApproval,
} from '@/lib/wishes/wish-store';

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

  const wishes = listAllWishes().sort((a, b) => {
    // Pending first, then newest within each group
    if (a.approved !== b.approved) return a.approved ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({
    success: true,
    data: { wishes, stats: getWishStats() },
  });
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  let body: { id?: string; approved?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, approved } = body;
  if (!id || typeof approved !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'id and approved (boolean) are required' },
      { status: 400 }
    );
  }

  const updated = setWishApproval(id, approved);
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Wish not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: updated,
    message: approved ? 'Wish approved and published.' : 'Wish unpublished.',
  });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
  }

  const removed = deleteWish(id);
  if (!removed) {
    return NextResponse.json({ success: false, error: 'Wish not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Wish deleted.' });
}

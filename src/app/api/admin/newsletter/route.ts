/**
 * Admin console — Newsletter subscribers.
 *
 * GET    → { subscribers, stats } (newest first)
 * DELETE → ?id= — remove a subscriber
 *
 * Subscriptions arrive via public POST /api/newsletter (footer form).
 * Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { listSubscribers, removeSubscriber } from '@/lib/newsletter/newsletter-store';

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

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const subscribers = listSubscribers();
  return NextResponse.json({
    success: true,
    data: {
      subscribers,
      stats: {
        total: subscribers.length,
        latest: subscribers[0]?.createdAt ?? null,
      },
    },
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

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
  }

  const removed = removeSubscriber(id);
  if (!removed) {
    return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Subscriber removed' });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

interface HistoryItem {
  productSlug: string;
  productName: string;
  visitedAt: string;
}

// In-memory store
const browsingHistory: Map<string, HistoryItem[]> = new Map();

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const history = browsingHistory.get(session.sub) || [];
    return NextResponse.json({ success: true, data: { history: history.slice(0, 50) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { productSlug, productName } = await request.json();
    if (!productSlug) return NextResponse.json({ success: false, error: 'Product slug required' }, { status: 400 });

    if (!browsingHistory.has(session.sub)) browsingHistory.set(session.sub, []);
    const history = browsingHistory.get(session.sub)!;

    // Remove duplicate if exists
    const filtered = history.filter(h => h.productSlug !== productSlug);
    filtered.unshift({ productSlug, productName: productName || productSlug, visitedAt: new Date().toISOString() });

    // Keep last 50
    browsingHistory.set(session.sub, filtered.slice(0, 50));

    return NextResponse.json({ success: true, data: { productSlug, message: 'History updated' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

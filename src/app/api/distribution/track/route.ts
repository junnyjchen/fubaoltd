import { NextResponse } from 'next/server';
import { recordClick } from '@/lib/distribution/distribution-store';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    if (!body.code) {
      return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
    }
    // Anonymous click tracking — silently accept unknown codes (no enumeration)
    recordClick(body.code);
    return NextResponse.json({ success: true, data: { tracked: true } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to track' }, { status: 500 });
  }
}

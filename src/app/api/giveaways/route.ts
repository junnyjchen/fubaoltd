import { NextResponse } from 'next/server';
import { getActiveGiveaways, getAllGiveaways, claimGiveaway } from '@/lib/giveaways/giveaway-store';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const giveaways = status === 'all' ? getAllGiveaways() : getActiveGiveaways();
    return NextResponse.json({ success: true, data: giveaways });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { giveawayId } = await request.json();
    if (!giveawayId) return NextResponse.json({ success: false, error: 'Giveaway ID required' }, { status: 400 });

    const user = await getUserById(session.sub);
    const result = claimGiveaway(giveawayId, session.sub, user?.name || 'Anonymous');

    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Congratulations! You claimed this prize!' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

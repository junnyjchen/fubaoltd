import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';
import { POINTS_REWARDS } from '@/lib/points/reward-catalog';
import {
  getRedemptionsForUser,
  redeemReward,
} from '@/lib/points/redemption-store';

export const dynamic = 'force-dynamic';

// GET /api/user/rewards — reward catalog + the session user's redemptions & balance
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.sub);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        rewards: POINTS_REWARDS,
        redemptions: getRedemptionsForUser(session.sub),
        points: user.points,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/user/rewards {rewardId} — spend points, mint + claim a personal coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body: { rewardId?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.rewardId || typeof body.rewardId !== 'string') {
      return NextResponse.json({ success: false, error: 'rewardId is required' }, { status: 400 });
    }

    const result = await redeemReward(session.sub, body.rewardId);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        redemption: result.redemption,
        pointsRemaining: result.pointsRemaining,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

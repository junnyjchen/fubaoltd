import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { addPoints } from '@/lib/auth/user-store';

// Check-in store persisted on globalThis so state survives module re-instantiation in dev
interface CheckInRecord {
  lastCheckIn: string;
  streak: number;
  totalDays: number;
}

const globalStore = globalThis as unknown as { __fubaoCheckIns?: Map<string, CheckInRecord> };
const checkIns: Map<string, CheckInRecord> = (globalStore.__fubaoCheckIns ??= new Map());

const CHECKIN_REWARDS = [5, 5, 10, 10, 15, 15, 30]; // Points per day in a week cycle

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const record = checkIns.get(session.sub);
    const today = new Date().toISOString().split('T')[0];
    const canCheckIn = !record || record.lastCheckIn !== today;

    return NextResponse.json({
      success: true,
      data: {
        canCheckIn,
        streak: record?.streak || 0,
        totalDays: record?.totalDays || 0,
        lastCheckIn: record?.lastCheckIn || null,
        nextReward: record ? CHECKIN_REWARDS[(record.streak) % 7] : CHECKIN_REWARDS[0],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];
    const record = checkIns.get(session.sub);

    if (record && record.lastCheckIn === today) {
      return NextResponse.json({ success: false, error: 'Already checked in today' }, { status: 400 });
    }

    // Calculate streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isNewStreak = !record || record.lastCheckIn !== yesterday;
    const streak = isNewStreak ? 1 : (record?.streak || 0) + 1;
    const points = CHECKIN_REWARDS[(streak - 1) % 7];

    checkIns.set(session.sub, {
      lastCheckIn: today,
      streak,
      totalDays: (record?.totalDays || 0) + 1,
    });

    // Award points
    await addPoints(session.sub, points);

    return NextResponse.json({
      success: true,
      data: {
        streak,
        pointsEarned: points,
        message: `Checked in! Earned ${points} points. ${streak > 1 ? `${streak} day streak!` : ''}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

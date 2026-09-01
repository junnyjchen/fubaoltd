import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await getUserById(session.sub);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        points: user.points,
        level: user.level,
        nextLevel: user.level === 'bronze' ? 'silver' : user.level === 'silver' ? 'gold' : user.level === 'gold' ? 'platinum' : 'max',
        pointsToNextLevel: user.level === 'bronze' ? 500 - user.points : user.level === 'silver' ? 2000 - user.points : user.level === 'gold' ? 5000 - user.points : 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

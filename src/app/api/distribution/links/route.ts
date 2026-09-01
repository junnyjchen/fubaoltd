import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getOrCreateAffiliateLink } from '@/lib/distribution/distribution-store';
import { getUserById } from '@/lib/auth/user-store';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await getUserById(session.sub);
    if (!user?.referralCode) {
      return NextResponse.json({ success: false, error: 'No referral code' }, { status: 400 });
    }

    const link = getOrCreateAffiliateLink(session.sub, user.referralCode);
    return NextResponse.json({ success: true, data: { link } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create link' }, { status: 500 });
  }
}

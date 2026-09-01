import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAffiliateLink, getUserCommissions, getConfig } from '@/lib/distribution/distribution-store';
import { getUserById } from '@/lib/auth/user-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await getUserById(session.sub);
    const link = getAffiliateLink(session.sub);
    const commissions = getUserCommissions(session.sub);
    const config = getConfig();

    const totalEarnings = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const pendingEarnings = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
    const confirmedEarnings = commissions.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.commissionAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user?.referralCode || '',
        affiliateLink: link ? {
          code: link.code,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}?ref=${link.code}`,
          totalClicks: link.totalClicks,
          totalConversions: link.totalConversions,
          totalEarnings: link.totalEarnings,
        } : null,
        stats: {
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          pendingEarnings: Math.round(pendingEarnings * 100) / 100,
          confirmedEarnings: Math.round(confirmedEarnings * 100) / 100,
          totalConversions: commissions.length,
        },
        config: {
          level1Rate: config.level1Rate,
          level2Rate: config.level2Rate,
          minWithdrawAmount: config.minWithdrawAmount,
        },
        recentCommissions: commissions.slice(-10).reverse(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

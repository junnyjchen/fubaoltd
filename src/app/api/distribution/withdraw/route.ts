import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserCommissions, getConfig } from '@/lib/distribution/distribution-store';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { amount, method = 'crypto' } = await request.json();
    const config = getConfig();

    if (!amount || amount < config.minWithdrawAmount) {
      return NextResponse.json({ success: false, error: `Minimum withdrawal: $${config.minWithdrawAmount}` }, { status: 400 });
    }

    const commissions = getUserCommissions(session.sub);
    const availableBalance = commissions
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    if (amount > availableBalance) {
      return NextResponse.json({ success: false, error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` }, { status: 400 });
    }

    // In production: process actual withdrawal
    return NextResponse.json({
      success: true,
      data: {
        amount,
        fee: config.withdrawFee,
        netAmount: amount - config.withdrawFee,
        method,
        status: 'processing',
        estimatedArrival: '1-3 business days',
        message: `Withdrawal of $${amount} initiated. Fee: $${config.withdrawFee}.`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

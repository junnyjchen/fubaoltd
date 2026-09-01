import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getWalletBalance, updateWalletBalance } from '@/lib/crypto/payment-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const balance = getWalletBalance(session.sub);

    return NextResponse.json({
      success: true,
      data: {
        ...balance,
        totalUSD: balance.USD + balance.USDT + balance.USDC,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get balance';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

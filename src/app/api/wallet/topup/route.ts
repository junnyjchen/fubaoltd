import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateWalletBalance } from '@/lib/crypto/payment-store';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'USD', bonus = 0 } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be positive' }, { status: 400 });
    }

    // Top up wallet (in production, this would be triggered by payment confirmation)
    const newBalance = updateWalletBalance(session.sub, currency as 'USD' | 'USDT' | 'USDC', amount + bonus);

    return NextResponse.json({
      success: true,
      data: {
        amount,
        bonus,
        totalCredited: amount + bonus,
        currency,
        balance: newBalance,
        message: bonus > 0 ? `Top-up of ${amount} ${currency} + ${bonus} bonus credited!` : `Top-up of ${amount} ${currency} credited.`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Top-up failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

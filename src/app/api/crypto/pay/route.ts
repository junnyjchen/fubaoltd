import { NextRequest, NextResponse } from 'next/server';
import { createCryptoPayment } from '@/lib/crypto/payment-store';
import { getSession } from '@/lib/auth/session';
import type { CryptoNetwork, CryptoToken } from '@/lib/crypto/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, token = 'USDT', network = 'TRC20' } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'Order ID and amount are required' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be positive' }, { status: 400 });
    }

    const validTokens: CryptoToken[] = ['USDT', 'USDC'];
    if (!validTokens.includes(token)) {
      return NextResponse.json({ success: false, error: 'Invalid token. Supported: USDT, USDC' }, { status: 400 });
    }

    const validNetworks: CryptoNetwork[] = ['TRC20', 'ERC20', 'BEP20', 'SOL', 'POLYGON'];
    if (!validNetworks.includes(network)) {
      return NextResponse.json({ success: false, error: `Invalid network. Supported: ${validNetworks.join(', ')}` }, { status: 400 });
    }

    const payment = createCryptoPayment(orderId, session.sub, amount, token, network);

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        explorerUrl: null, // No tx yet
        timeRemaining: new Date(payment.expiresAt).getTime() - Date.now(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment creation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

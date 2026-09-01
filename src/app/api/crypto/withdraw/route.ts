import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getWalletBalance, updateWalletBalance } from '@/lib/crypto/payment-store';
import { validateAddress } from '@/lib/crypto/validation';
import type { CryptoNetwork, CryptoToken } from '@/lib/crypto/types';
import { NETWORK_CONFIG } from '@/lib/crypto/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token = 'USDT', network = 'TRC20', amount, toAddress } = body;

    if (!amount || !toAddress) {
      return NextResponse.json({ success: false, error: 'Amount and address are required' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be positive' }, { status: 400 });
    }

    // Validate address
    const addrValidation = validateAddress(toAddress, network as CryptoNetwork);
    if (!addrValidation.valid) {
      return NextResponse.json({ success: false, error: addrValidation.error }, { status: 400 });
    }

    // Check balance
    const balance = getWalletBalance(session.sub);
    const tokenKey = token as keyof typeof balance;
    if ((balance[tokenKey] || 0) < amount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient ${token} balance. Available: ${balance[tokenKey] || 0}`,
      }, { status: 400 });
    }

    // Check network fee
    const fee = NETWORK_CONFIG[network as CryptoNetwork]?.fee || 1;
    if (amount < fee) {
      return NextResponse.json({ success: false, error: `Amount must be greater than network fee (${fee} ${token})` }, { status: 400 });
    }

    // Deduct from wallet
    updateWalletBalance(session.sub, tokenKey, -amount);

    // In production: create actual blockchain transaction
    return NextResponse.json({
      success: true,
      data: {
        status: 'processing',
        amount,
        token,
        network,
        toAddress,
        fee,
        estimatedArrival: '5-30 minutes depending on network',
        message: `Withdrawal of ${amount} ${token} via ${network} initiated.`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

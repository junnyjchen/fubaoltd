import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { validateTxHash } from '@/lib/crypto/validation';
import { confirmPayment, completePayment, getPaymentByOrder, updateWalletBalance } from '@/lib/crypto/payment-store';
import type { CryptoNetwork } from '@/lib/crypto/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, txHash, network = 'TRC20' } = body;

    if (!orderId || !txHash) {
      return NextResponse.json({ success: false, error: 'Order ID and transaction hash are required' }, { status: 400 });
    }

    // Validate tx hash format
    const validation = validateTxHash(txHash, network as CryptoNetwork);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Find payment by order
    const payment = getPaymentByOrder(orderId);
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (payment.userId !== session.sub) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status !== 'awaiting_payment') {
      return NextResponse.json({ success: false, error: `Payment is ${payment.status}` }, { status: 400 });
    }

    // Confirm payment (in production, this would verify on-chain)
    const updated = confirmPayment(payment.id, txHash);

    // Wallet top-up orders close the loop immediately: completing credits the balance
    if (updated && orderId.startsWith('WALLET-')) {
      const completed = completePayment(payment.id);
      if (completed) {
        updateWalletBalance(completed.userId, completed.token, completed.amount);
        return NextResponse.json({
          success: true,
          data: {
            ...completed,
            message: 'Deposit confirmed. Your wallet balance has been updated.',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        message: 'Transaction submitted. Waiting for confirmations.',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deposit verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

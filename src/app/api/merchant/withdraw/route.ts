import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  getMerchantByUserId,
  getMerchantWithdrawals,
  requestWithdrawal,
} from '@/lib/merchant/merchant-store';

// GET /api/merchant/withdraw - list merchant withdrawals
export async function GET() {
  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const merchant = getMerchantByUserId(user.sub);
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
  }

  const withdrawals = getMerchantWithdrawals(merchant.id);
  return NextResponse.json({ data: withdrawals });
}

// POST /api/merchant/withdraw - request a withdrawal
export async function POST(request: NextRequest) {
  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const merchant = getMerchantByUserId(user.sub);
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
  }

  const body = await request.json();
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: 'Valid positive amount is required' },
      { status: 400 }
    );
  }

  const withdrawal = requestWithdrawal({
    merchantId: merchant.id,
    amount,
    currency: body.currency === 'USDT' ? 'USDT' : 'USD',
    payoutMethod: body.payoutMethod === 'bank' ? 'bank' : 'crypto',
    cryptoAddress: body.cryptoAddress,
    cryptoNetwork: body.cryptoNetwork,
  });

  if ('error' in withdrawal) {
    return NextResponse.json({ error: withdrawal.error }, { status: 400 });
  }

  return NextResponse.json({ data: withdrawal }, { status: 201 });
}

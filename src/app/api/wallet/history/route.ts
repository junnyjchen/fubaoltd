import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getUserPayments } from '@/lib/crypto/payment-store';

export async function GET() {
  try {
    const user = await requireAuth();
    const payments = getUserPayments(user.sub);
    return NextResponse.json({
      success: true,
      data: {
        payments: payments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getMerchantByUserId, getMerchantOrders } from '@/lib/merchant/merchant-store';

export async function GET() {
  try {
    const user = await requireAuth();
    const merchant = getMerchantByUserId(user.sub);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant account not found' },
        { status: 404 }
      );
    }

    const orders = await getMerchantOrders(merchant.id);
    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

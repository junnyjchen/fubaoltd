import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getMerchantByUserId } from '@/lib/merchant/merchant-store';

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

    return NextResponse.json({ success: true, data: { merchant } });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

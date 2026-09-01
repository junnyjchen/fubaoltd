import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons/coupon-store';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount, category } = body;

    if (!code || !orderAmount) {
      return NextResponse.json({ success: false, error: 'Code and order amount required' }, { status: 400 });
    }

    const session = await getSession();
    const result = validateCoupon(code, orderAmount, session?.sub, category);

    return NextResponse.json({
      success: result.valid,
      data: {
        valid: result.valid,
        discount: result.discount,
        coupon: result.coupon ? { code: result.coupon.code, type: result.coupon.type, value: result.coupon.value } : null,
        error: result.error,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

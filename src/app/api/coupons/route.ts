import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { validateCoupon, getUserCoupons, getAllCoupons, claimCoupon } from '@/lib/coupons/coupon-store';

export async function GET() {
  try {
    const session = await getSession();
    const coupons = session ? getUserCoupons(session.sub) : getAllCoupons();
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });

    const result = claimCoupon(code, session.sub);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Coupon claimed!' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

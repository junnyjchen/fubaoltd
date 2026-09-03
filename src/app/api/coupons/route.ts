import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserCoupons, getAllCoupons, claimCoupon } from '@/lib/coupons/coupon-store';
import type { Coupon } from '@/lib/coupons/types';

export async function GET() {
  try {
    const session = await getSession();
    const now = Date.now();
    const isLive = (c: Coupon) =>
      c.isActive &&
      (!c.validFrom || new Date(c.validFrom).getTime() <= now) &&
      (!c.validUntil || new Date(c.validUntil).getTime() >= now);

    return NextResponse.json({
      success: true,
      data: {
        available: getAllCoupons().filter(isLive),
        mine: session ? getUserCoupons(session.sub) : [],
      },
    });
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

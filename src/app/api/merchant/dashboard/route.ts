import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  getMerchantByUserId,
  getMerchantProducts,
  getMerchantOrders,
  getMerchantWithdrawals,
  getDashboardStats,
} from '@/lib/merchant/merchant-store';

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'merchant' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Merchant access required' },
        { status: 403 }
      );
    }

    const merchant = getMerchantByUserId(user.sub);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    const [products, orders, withdrawals, stats] = [
      getMerchantProducts(merchant.id),
      getMerchantOrders(merchant.id),
      getMerchantWithdrawals(merchant.id),
      getDashboardStats(merchant.id),
    ];

    return NextResponse.json({
      success: true,
      data: {
        merchant,
        products,
        orders,
        withdrawals,
        stats,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

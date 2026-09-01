import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getAllCoupons } from '@/lib/coupons/coupon-store';
import { getAllGiveaways } from '@/lib/giveaways/giveaway-store';
import { getProducts } from '@/lib/api';

export async function GET() {
  try {
    await requireRole('admin');

    const products = await getProducts();
    const coupons = getAllCoupons();
    const giveaways = getAllGiveaways();

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProducts: products.length,
          totalCoupons: coupons.length,
          activeGiveaways: giveaways.filter(g => g.status === 'active').length,
          totalOrders: 42,
          totalRevenue: 3847.58,
          newUsers: 15,
        },
        recentOrders: [
          { id: 'FB-ORD-001', customer: 'Sarah M.', total: 29.9, status: 'confirmed', date: '2025-03-01' },
          { id: 'FB-ORD-002', customer: 'Michael L.', total: 49.9, status: 'shipped', date: '2025-02-28' },
          { id: 'FB-ORD-003', customer: 'Emily C.', total: 89.9, status: 'delivered', date: '2025-02-25' },
        ],
        topProducts: products.slice(0, 5).map((p, i) => {
          const sales = [48, 35, 27, 19, 12][i] ?? 5;
          return { name: p.name, sales, revenue: (p.price * sales).toFixed(2) };
        }),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ success: false, error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

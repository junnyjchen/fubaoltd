/**
 * Admin console — Order management.
 *
 * GET   → ?state=&q= — all Spree orders (carts + completed) with stats
 * PATCH → { orderNumber, shipmentStatus: 'shipped' | 'delivered' } — advance
 *         the fulfillment of a completed order (ready → shipped → delivered)
 *
 * Checkout states stay owned by the Spree state machine; the admin console
 * only advances shipment fulfillment. Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { listAllOrders, orderTotal, setAdminShipmentStatus } from '@/lib/spree-compat/order-store';
import type { SpreeOrderState } from '@/lib/spree-compat/types';

function authError(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Forbidden') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  if (message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function toAdminOrderView(order: SpreeOrderState) {
  return {
    number: order.number,
    email: order.email,
    userId: order.userId,
    state: order.state,
    paymentStatus: order.paymentStatus,
    shipmentStatus: order.shipmentStatus,
    couponCode: order.couponCode,
    itemCount: order.lineItems.reduce((sum, item) => sum + item.quantity, 0),
    itemTotal: order.itemTotal,
    shipTotal: order.shipTotal,
    promoTotal: order.promoTotal,
    total: orderTotal(order),
    createdAt: order.createdAt,
    completedAt: order.completedAt,
    shipTo: order.shipAddress
      ? {
          name: `${order.shipAddress.firstname} ${order.shipAddress.lastname}`.trim(),
          city: order.shipAddress.city,
          country: order.shipAddress.country_iso,
        }
      : null,
    items: order.lineItems.map((item) => ({
      name: item.name,
      slug: item.slug,
      quantity: item.quantity,
      price: item.price,
      personalization: item.options?.personalization ?? null,
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const params = request.nextUrl.searchParams;
  const stateFilter = params.get('state');
  const q = (params.get('q') ?? '').trim().toLowerCase();

  let orders = listAllOrders();
  if (stateFilter) {
    orders = orders.filter((o) => o.state === stateFilter);
  }
  if (q) {
    orders = orders.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.lineItems.some((item) => item.name.toLowerCase().includes(q))
    );
  }

  const all = listAllOrders();
  const completed = all.filter((o) => o.state === 'complete');
  const revenue = completed.reduce((sum, o) => sum + orderTotal(o), 0);

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.slice(0, 200).map(toAdminOrderView),
      stats: {
        totalOrders: all.length,
        completed: completed.length,
        inProgress: all.filter((o) => o.state !== 'complete').length,
        awaitingFulfillment: completed.filter(
          (o) => o.shipmentStatus === 'ready' || o.shipmentStatus === 'pending'
        ).length,
        revenue: Number(revenue.toFixed(2)),
      },
    },
  });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const orderNumber = String(body.orderNumber ?? '').trim();
    const shipmentStatus = String(body.shipmentStatus ?? '');

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number is required' }, { status: 400 });
    }
    if (shipmentStatus !== 'shipped' && shipmentStatus !== 'delivered') {
      return NextResponse.json(
        { success: false, error: "shipmentStatus must be 'shipped' or 'delivered'" },
        { status: 400 }
      );
    }

    const updated = setAdminShipmentStatus(orderNumber, shipmentStatus);
    if (!updated) {
      const exists = listAllOrders().some((o) => o.number === orderNumber);
      return NextResponse.json(
        {
          success: false,
          error: exists
            ? 'Order cannot transition to that shipment status (must be complete, and only ready → shipped → delivered)'
            : 'Order not found',
        },
        { status: exists ? 400 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { number: updated.number, shipmentStatus: updated.shipmentStatus },
      message: `Order ${updated.number} marked ${updated.shipmentStatus}`,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

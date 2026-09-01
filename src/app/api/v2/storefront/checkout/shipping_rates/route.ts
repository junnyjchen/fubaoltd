/**
 * Spree Commerce API v2 — Available shipping rates for the cart.
 *
 * GET /api/v2/storefront/checkout/shipping_rates
 * (alias of /checkout/shipments retained for SDK compatibility)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, SHIPPING_RATES } from '@/lib/spree-compat/order-store';

export async function GET(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: SHIPPING_RATES.map((r) => ({
      id: r.id,
      type: 'shipping_rate',
      attributes: {
        name: r.name,
        description: r.description,
        cost: r.cost.toFixed(2),
        selected: order.shippingRateId === r.id,
        final_price: r.cost.toFixed(2),
        free: r.free,
        shipping_method_id: r.id,
        display_cost: `$${r.cost.toFixed(2)}`,
      },
    })),
  });
}

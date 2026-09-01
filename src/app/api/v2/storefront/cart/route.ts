/**
 * Spree Commerce API v2 — Create cart (guest).
 *
 * POST /api/v2/storefront/cart
 *
 * Creates a new guest cart. Returns X-Spree-Order-Token header.
 */

import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/spree-compat/order-store';
import { serializeOrder, orderIncluded } from '@/lib/spree-compat/order-serializer';

export async function POST() {
  const cart = createOrder();

  return NextResponse.json(
    {
      data: serializeOrder(cart),
      included: orderIncluded(cart),
    },
    {
      headers: {
        'X-Spree-Order-Token': cart.guestToken,
      },
    }
  );
}

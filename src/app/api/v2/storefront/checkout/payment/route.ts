/**
 * Spree Commerce API v2 — Payment step of the checkout flow.
 *
 * PATCH/PUT /api/v2/storefront/checkout/payment
 * Body: { order: { payments_attributes: [{ payment_method_id: string | number }] } }
 *
 * Sets the selected payment method (Stripe / Crypto) on the order.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, PAYMENT_METHODS, selectPaymentMethod, advanceCheckoutSteps } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';

export async function PATCH(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return NextResponse.json({ error: 'Order token is required.' }, { status: 401 });
  }

  const order = getCartByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  let paymentMethodId: string | number | undefined;
  try {
    const body = (await request.json()) as {
      order?: { payments_attributes?: Array<{ payment_method_id?: string | number }> };
    };
    paymentMethodId = body.order?.payments_attributes?.[0]?.payment_method_id;
  } catch {
    // no body — keep current selection
  }

  if (paymentMethodId !== undefined) {
    const id = String(paymentMethodId);
    const method = PAYMENT_METHODS.find((m) => m.id === id);
    if (!method) {
      return NextResponse.json(
        { error: `Payment method ${paymentMethodId} not found` },
        { status: 422 }
      );
    }
    const selected = selectPaymentMethod(order, id);
    if (!selected) {
      return NextResponse.json({ error: 'Failed to select payment method' }, { status: 422 });
    }
  }

  // Spree semantics: setting the payment method transitions payment → confirm.
  advanceCheckoutSteps(order);

  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

export { PATCH as PUT };

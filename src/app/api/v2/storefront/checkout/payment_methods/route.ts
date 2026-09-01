/**
 * Spree Commerce API v2 — List available payment methods.
 *
 * GET /api/v2/storefront/checkout/payment_methods
 */

import { NextResponse } from 'next/server';
import { PAYMENT_METHODS } from '@/lib/spree-compat/order-store';

export async function GET() {
  return NextResponse.json({
    data: PAYMENT_METHODS.map((m) => ({
      id: m.id,
      type: 'payment_method',
      attributes: {
        name: m.name,
        description: m.description,
        method_type: m.methodType,
      },
    })),
  });
}

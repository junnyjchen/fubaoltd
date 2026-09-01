/**
 * Spree Commerce API v2 — Estimate shipping rates for cart.
 *
 * GET /api/v2/storefront/cart/estimate_shipping_rates?country_iso=US
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const RATE_TABLE: Record<string, Array<{ name: string; amount: number; days: string }>> = {
  US: [
    { name: 'Standard (7-12 business days)', amount: 5.99, days: '7-12' },
    { name: 'Express (4-6 business days)', amount: 14.99, days: '4-6' },
    { name: 'Priority (2-3 business days)', amount: 24.99, days: '2-3' },
  ],
  HK: [
    { name: 'Local Standard (2-4 business days)', amount: 3.99, days: '2-4' },
    { name: 'Local Express (1-2 business days)', amount: 9.99, days: '1-2' },
  ],
  DEFAULT: [
    { name: 'International Standard (10-18 business days)', amount: 12.99, days: '10-18' },
    { name: 'International Express (5-8 business days)', amount: 29.99, days: '5-8' },
  ],
};

export async function GET(request: NextRequest) {
  const countryIso = request.nextUrl.searchParams.get('country_iso') ?? 'US';
  const rates = RATE_TABLE[countryIso.toUpperCase()] ?? RATE_TABLE.DEFAULT;

  return NextResponse.json({
    data: rates.map((rate, index) => ({
      id: `ship-rate-${countryIso.toLowerCase()}-${index}`,
      type: 'shipping_rate',
      attributes: {
        name: rate.name,
        amount: rate.amount.toString(),
        days: rate.days,
        selected: index === 0,
      },
    })),
    meta: { country_iso: countryIso.toUpperCase() },
  });
}

/**
 * Spree Commerce API v2 — Product detail endpoint.
 *
 * GET /api/v2/storefront/products/{slug}
 * Optional: ?include=variants,images
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { products } from '@/lib/data/products';
import { serializeProduct, serializeVariant } from '@/lib/spree-compat/serializers';
import type { SpreeResource } from '@/lib/spree-compat/types';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return NextResponse.json(
      { errors: [{ detail: 'Product could not be found.' }] },
      { status: 404 },
    );
  }

  const include = (request.nextUrl.searchParams.get('include') ?? '')
    .split(',')
    .filter(Boolean);
  const included: SpreeResource[] = [];
  if (include.includes('variants') || include.includes('primary_variant')) {
    included.push(serializeVariant(product));
  }

  return NextResponse.json({
    data: serializeProduct(product),
    included,
  });
}

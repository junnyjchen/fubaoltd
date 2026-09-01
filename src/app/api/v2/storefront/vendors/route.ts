/**
 * Spree Commerce API v2 — Vendors (multi-merchant) endpoint.
 *
 * GET /api/v2/storefront/vendors
 * Multi-merchant support: each FuBao merchant maps to a Spree vendor.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { merchants } from '@/lib/merchant/merchant-store';
import { serializeVendor } from '@/lib/spree-compat/serializers';
import { buildLinks } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const perPage = Math.min(Math.max(parseInt(params.get('per_page') ?? '25', 10) || 25, 1), 100);
  const page = Math.max(parseInt(params.get('page') ?? '1', 10) || 1, 1);
  const nameFilter = params.get('filter[name]')?.toLowerCase();

  let approved = merchants.filter((m) => m.status === 'approved');
  if (nameFilter) {
    approved = approved.filter(
      (m) =>
        m.shopName.toLowerCase().includes(nameFilter) ||
        m.shopSlug.toLowerCase().includes(nameFilter)
    );
  }

  const vendors = approved.map((m) => serializeVendor(m));
  const total = vendors.length;
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const paged = vendors.slice((page - 1) * perPage, page * perPage);

  return NextResponse.json({
    data: paged,
    links: buildLinks(request.nextUrl.origin + request.nextUrl.pathname, page, totalPages),
    meta: {
      count: paged.length,
      total_count: total,
      total_pages: totalPages,
      current_page: page,
      per_page: perPage,
    },
  });
}

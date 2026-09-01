/**
 * Spree Commerce API v2 — Taxons (categories) endpoint.
 *
 * GET /api/v2/storefront/taxons
 * Optional: ?filter[name]=xxx, ?per_page, ?page
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TAXON_TREE, serializeTaxon } from '@/lib/spree-compat/serializers';
import { buildLinks } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const perPage = Math.min(Math.max(parseInt(params.get('per_page') ?? '25', 10) || 25, 1), 100);
  const page = Math.max(parseInt(params.get('page') ?? '1', 10) || 1, 1);
  const nameFilter = params.get('filter[name]')?.toLowerCase();

  let taxons = TAXON_TREE.filter(
    (t) => t.id !== 'taxon-root' || !nameFilter
  );
  if (nameFilter) {
    taxons = taxons.filter(
      (t) =>
        t.name.toLowerCase().includes(nameFilter) ||
        t.permalink.toLowerCase().includes(nameFilter)
    );
  }

  const total = taxons.length;
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const paged = taxons
    .slice((page - 1) * perPage, page * perPage)
    .map((t) => serializeTaxon(t));

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

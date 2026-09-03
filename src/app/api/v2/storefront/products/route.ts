/**
 * Spree Commerce API v2 — Products list endpoint.
 *
 * GET /api/v2/storefront/products
 * Query params (Spree contract):
 *   filter[name], filter[skus], filter[taxons], filter[vendors]
 *   filter[price], filter[option_value_ids]
 *   page, per_page (default 25, max 100)
 *   sort (name, price, updated_at, id — with optional "-" prefix)
 *   include (comma-separated: variants, images, ...)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { products } from '@/lib/data/products';
import { serializeProduct, serializeVariant, vendorIdForProduct } from '@/lib/spree-compat/serializers';
import type { SpreeResource } from '@/lib/spree-compat/types';
import { buildLinks } from '@/lib/spree-compat/order-serializer';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const perPage = Math.min(Math.max(parseInt(params.get('per_page') ?? '25', 10) || 25, 1), 100);
  const page = Math.max(parseInt(params.get('page') ?? '1', 10) || 1, 1);

  let filtered = [...products];

  // Free-gift products (e.g. the blessing talisman) stay out of the public
  // catalog listing; they remain reachable via the direct slug endpoint or an
  // explicit filter[skus] lookup. Keeps product/variant id numbering stable.
  // Admin-deactivated products are hidden from listings the same way.
  if (!params.get('filter[skus]')) {
    filtered = filtered.filter((p) => !p.isFreeGift && p.isActive !== false);
  }

  // filter[name] — substring match on name/tagline
  const nameFilter = params.get('filter[name]');
  if (nameFilter) {
    const q = nameFilter.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q),
    );
  }

  // filter[taxons] — accepts taxon ids, permalinks, names or category slugs
  const taxonFilter = params.get('filter[taxons]');
  if (taxonFilter) {
    const taxonKeys = taxonFilter.split(',').map((t) => t.trim().toLowerCase());
    filtered = filtered.filter((p) => {
      const categorySlug = p.category.toLowerCase().replace(/\s+/g, '-');
      return taxonKeys.some(
        (k) =>
          k === categorySlug ||
          k === p.category.toLowerCase() ||
          k === `categories/${categorySlug}` ||
          k === `taxon-${categorySlug}`
      );
    });
  }

  // filter[vendors] — vendor ids/names (comma-separated)
  const vendorFilter = params.get('filter[vendors]');
  if (vendorFilter) {
    const vendorIds = vendorFilter.split(',').map((v) => v.trim().toLowerCase());
    filtered = filtered.filter((p) => {
      const vendor = vendorIdForProduct(p);
      return vendorIds.includes(vendor) || vendorIds.includes(vendor.replace('mch-', ''));
    });
  }

  // filter[price] — range like "10,50" (min,max)
  const priceFilter = params.get('filter[price]');
  if (priceFilter) {
    const [min, max] = priceFilter.split(',').map((v) => parseFloat(v.trim()));
    if (!Number.isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
    if (!Number.isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
  }

  // filter[skus] — comma-separated SKU list
  const skuFilter = params.get('filter[skus]');
  if (skuFilter) {
    const skus = skuFilter.split(',').map((s) => s.trim().toUpperCase());
    filtered = filtered.filter((p) => skus.includes(p.slug.toUpperCase()));
  }

  // sort
  const sort = params.get('sort') ?? 'id';
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  filtered.sort((a, b) => {
    let cmp = 0;
    if (field === 'price') cmp = a.price - b.price;
    else if (field === 'name') cmp = a.name.localeCompare(b.name);
    else if (field === 'updated_at') cmp = a.slug.localeCompare(b.slug);
    else cmp = a.slug.localeCompare(b.slug);
    return desc ? -cmp : cmp;
  });

  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const include = (params.get('include') ?? '').split(',').filter(Boolean);
  const included: SpreeResource[] = [];
  for (const product of paged) {
    if (include.includes('variants')) included.push(serializeVariant(product));
    if (include.includes('primary_variant')) included.push(serializeVariant(product));
  }

  const baseUrl = request.nextUrl.origin + request.nextUrl.pathname;

  return NextResponse.json({
    data: paged.map((p) => serializeProduct(p)),
    included,
    links: buildLinks(baseUrl, page, totalPages),
    meta: {
      count: paged.length,
      total_count: total,
      total_pages: totalPages,
      current_page: page,
      per_page: perPage,
    },
  });
}

/**
 * Server-side data access to the Spree Commerce v2 compatibility layer.
 *
 * These functions call the spree-compat serializers directly (in-process),
 * bypassing HTTP entirely. When a real Spree backend is available, swap the
 * implementations here for HTTP calls to SPREE_API_URL — the return contract
 * stays identical.
 */

import { serializeProduct } from "@/lib/spree-compat/serializers";
import type { SpreeResource } from "@/lib/spree-compat/types";
import { products } from "@/lib/data/products";

export type SpreeProductResource = SpreeResource;

/** List products with optional taxon (category) filter, Spree v2 style. */
export function listSpreeProducts(category?: string): SpreeProductResource[] {
  const filtered = category
    ? products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      )
    : products;
  return filtered.map((p) => serializeProduct(p));
}

/** Get a single product by slug. */
export function getSpreeProductBySlug(
  slug: string
): SpreeProductResource | null {
  const found = products.find((p) => p.slug === slug);
  return found ? serializeProduct(found) : null;
}

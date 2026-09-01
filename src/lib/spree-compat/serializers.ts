/**
 * Serializers that convert FuBao domain data into Spree Commerce API v2
 * JSON:API resources. This is the contract layer that makes the API
 * wire-compatible with the official Spree storefronts and SDKs.
 */

import { products } from '@/lib/data/products';
import { merchants } from '@/lib/merchant/merchant-store';
import type { Product } from '@/lib/data/types';
import type { Merchant } from '@/lib/merchant/types';
import type { SpreeResource } from './types';

const CURRENCY = 'USD';

/** Product slug → vendor (multi-merchant mapping) */
const PRODUCT_VENDOR_MAP: Record<string, string> = {
  'protection-talisman': 'mch-001',
  'home-blessing-talisman': 'mch-001',
  'career-success-talisman': 'mch-002',
  'personalized-birth-chart-talisman': 'mch-002',
  'energy-blessing-box': 'mch-002',
};

const CATEGORY_TAXON_MAP: Record<string, string> = {
  Protection: 'taxon-protection',
  'Home Blessing': 'taxon-home-blessing',
  Career: 'taxon-career',
  'Gift Sets': 'taxon-gift-sets',
};

/** Spree taxon tree derived from FuBao categories */
export const TAXON_TREE = [
  { id: 'taxon-root', name: 'Categories', permalink: 'categories', parentId: null },
  { id: 'taxon-protection', name: 'Protection', permalink: 'categories/protection', parentId: 'taxon-root' },
  { id: 'taxon-home-blessing', name: 'Home Blessing', permalink: 'categories/home-blessing', parentId: 'taxon-root' },
  { id: 'taxon-career', name: 'Career', permalink: 'categories/career', parentId: 'taxon-root' },
  { id: 'taxon-gift-sets', name: 'Gift Sets', permalink: 'categories/gift-sets', parentId: 'taxon-root' },
];

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function vendorIdForProduct(product: Product): string {
  return PRODUCT_VENDOR_MAP[product.slug] ?? 'mch-001';
}

function merchantIdToNumeric(id: string): string {
  // Spree ids are numeric strings; map mch-00X → X
  const match = /(\d+)$/.exec(id);
  return match ? String(Number(match[1])) : '1';
}

function productIdToNumeric(slug: string): string {
  const index = products.findIndex((p) => p.slug === slug);
  return String(index + 1);
}

export function serializeVendor(merchant: Merchant): SpreeResource {
  return {
    id: merchantIdToNumeric(merchant.id),
    type: 'vendor',
    attributes: {
      name: merchant.shopName,
      about_us: merchant.description,
      slug: merchant.shopSlug,
      state: merchant.status === 'approved' ? 'active' : merchant.status,
      contact_email: merchant.contactEmail,
      city: merchant.city,
      country: merchant.country,
      rating: merchant.rating,
      certification: merchant.certification,
      url: merchant.website,
      created_at: merchant.createdAt,
      updated_at: merchant.updatedAt,
    },
    relationships: {
      image: { data: null },
      products: {
        data: products
          .filter((p) => vendorIdForProduct(p) === merchant.id)
          .map((p) => ({ id: productIdToNumeric(p.slug), type: 'product' })),
      },
    },
  };
}

export function serializeProduct(product: Product): SpreeResource {
  const numericId = productIdToNumeric(product.slug);
  const vendorId = vendorIdForProduct(product);
  const taxonId = CATEGORY_TAXON_MAP[product.category] ?? 'taxon-root';
  const description = product.story.join('\n\n');

  return {
    id: numericId,
    type: 'product',
    attributes: {
      name: product.name,
      description,
      price: product.price.toFixed(1),
      display_price: formatMoney(product.price),
      currency: CURRENCY,
      available: true,
      purchasable: true,
      in_stock: true,
      backorderable: false,
      slug: product.slug,
      meta_description: product.tagline,
      meta_keywords: `talisman, taoist, ${product.category.toLowerCase()}`,
      updated_at: '2025-06-01T00:00:00Z',
      tagline: product.tagline,
      category: product.category,
      rating: product.rating,
      ritual_info: product.ritual_info,
      image_key: product.image_key,
    },
    relationships: {
      variants: {
        data: [{ id: numericId, type: 'variant' }],
      },
      taxons: {
        data: [{ id: taxonId, type: 'taxon' }],
      },
      vendor: {
        data: { id: merchantIdToNumeric(vendorId), type: 'vendor' },
      },
      images: {
        data: [{ id: numericId, type: 'image' }],
      },
    },
  };
}

export function serializeVariant(product: Product): SpreeResource {
  const numericId = productIdToNumeric(product.slug);
  return {
    id: numericId,
    type: 'variant',
    attributes: {
      sku: `FB-${product.slug.toUpperCase().slice(0, 14)}`,
      price: product.price.toFixed(1),
      display_price: formatMoney(product.price),
      currency: CURRENCY,
      weight: '0.05',
      height: '30.0',
      width: '12.0',
      depth: '1.0',
      is_master: true,
      options_text: '',
      purchasable: true,
      in_stock: true,
      total_on_hand: 99,
    },
    relationships: {
      product: { data: { id: numericId, type: 'product' } },
      images: { data: [{ id: numericId, type: 'image' }] },
    },
  };
}

export function serializeImage(product: Product): SpreeResource {
  const numericId = productIdToNumeric(product.slug);
  return {
    id: numericId,
    type: 'image',
    attributes: {
      position: 1,
      alt: product.name,
      transformed_url: `/api/images/${product.image_key}`,
      original_url: `/api/images/${product.image_key}`,
    },
  };
}

export function serializeTaxon(taxon: (typeof TAXON_TREE)[number]): SpreeResource {
  const children = TAXON_TREE.filter((t) => t.parentId === taxon.id);
  return {
    id: String(TAXON_TREE.indexOf(taxon) + 1),
    type: 'taxon',
    attributes: {
      name: taxon.name,
      pretty_name: taxon.permalink.includes('/') ? `Categories -> ${taxon.name}` : taxon.name,
      permalink: taxon.permalink,
      position: TAXON_TREE.indexOf(taxon),
      is_root: taxon.parentId === null,
      is_leaf: children.length === 0,
      description: `${taxon.name} talismans hand-drawn by Taoist masters`,
      meta_title: taxon.name,
      meta_description: `${taxon.name} talismans hand-drawn by Taoist masters`,
    },
    relationships: {
      parent: taxon.parentId
        ? { data: { id: String(TAXON_TREE.findIndex((t) => t.id === taxon.parentId) + 1), type: 'taxon' } }
        : { data: null },
      children: {
        data: children.map((c) => ({
          id: String(TAXON_TREE.findIndex((t) => t.id === c.id) + 1),
          type: 'taxon',
        })),
      },
    },
  };
}

/** taxon permalink → our internal taxon id (used by product filtering) */
export function permalinkToTaxonKey(permalink: string): string | null {
  const taxon = TAXON_TREE.find((t) => t.permalink === permalink || t.name.toLowerCase() === permalink.toLowerCase());
  return taxon ? taxon.id : null;
}

export function taxonKeyToCategory(taxonKey: string): string | null {
  for (const [category, id] of Object.entries(CATEGORY_TAXON_MAP)) {
    if (id === taxonKey) return category;
  }
  return null;
}

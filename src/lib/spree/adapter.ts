/**
 * Spree Storefront API v2 adapter.
 *
 * Maps Spree JSON:API responses (from client.ts) onto the site's internal
 * types so pages keep rendering unchanged while the data source can be
 * either the local compatibility layer (/api/v2/storefront/*) or a real
 * Spree backend (SPREE_API_URL).
 */

import type { Product, ProductCategory, RitualInfo } from "@/lib/data/types";
import type { SpreeCart, SpreeCartLineItem } from "@/lib/spree/client";
import type { SpreeResource } from "@/lib/spree-compat/types";

/** Spree product resource (JSON:API) — attributes are loosely typed because a
 * real Spree backend and the local compat layer emit slightly different sets. */
export type SpreeProductLike = SpreeResource;

const CATEGORY_KEYS: Record<string, ProductCategory> = {
  protection: "Protection",
  "home-blessing": "Home Blessing",
  "home blessing": "Home Blessing",
  career: "Career",
  "gift-sets": "Gift Sets",
  "gift sets": "Gift Sets",
};

function categoryFromPermalink(permalink?: string | null): ProductCategory {
  const leaf = (permalink ?? "").split("/").pop() ?? "";
  return CATEGORY_KEYS[leaf.toLowerCase()] ?? "Protection";
}

const FALLBACK_RITUAL: RitualInfo = {
  master: "Master Chen",
  location: "Qingyun Taoist Temple, Hong Kong",
  date: "2026-01-08",
  ceremonyId: "FB-HK-2026",
};

// ---------------------------------------------------------------------------
// Product mapping (used by lib/api server layer via queries.ts)
// ---------------------------------------------------------------------------

function strAttr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function numAttr(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/** Map a Spree product resource onto the Product shape for listing cards. */
export function spreeProductToListProduct(resource: SpreeProductLike): Product {
  return mapProductAttributes(resource.id, resource.attributes);
}

/** Map a Spree product resource onto the Product shape for detail pages. */
export function spreeProductToDetail(resource: SpreeProductLike): Product {
  return mapProductAttributes(resource.id, resource.attributes);
}

export function mapProductAttributes(
  id: string,
  rawAttrs: Record<string, unknown>,
  variantId?: string
): Product {
  const attrs = {
    slug: strAttr(rawAttrs.slug),
    name: strAttr(rawAttrs.name),
    price: strAttr(rawAttrs.price, "0"),
    description: strAttr(rawAttrs.description),
    tagline: strAttr(rawAttrs.tagline),
    image_key: strAttr(rawAttrs.image_key),
    category: strAttr(rawAttrs.category),
    permalink: strAttr(rawAttrs.permalink),
  };
  const story = attrs.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // ritual_info round-trips from the compat layer as the Product shape
  // ({master, location, date, ceremonyId}); keep the fallback for real Spree.
  const rawRitual = rawAttrs.ritual_info;
  const ritualInfo =
    rawRitual && typeof rawRitual === "object" && "master" in rawRitual
      ? (rawRitual as unknown as RitualInfo)
      : FALLBACK_RITUAL;

  const categoryKey = attrs.category || attrs.permalink;
  return {
    slug: attrs.slug,
    name: attrs.name,
    price: Number(attrs.price),
    category: categoryFromPermalink(categoryKey),
    tagline: attrs.tagline,
    story: story.length ? story : [attrs.tagline],
    image_key: attrs.image_key || `talisman/${attrs.slug}`,
    ritual_info: ritualInfo,
    rating: numAttr(rawAttrs.rating, 4.8),
    reviewCount: numAttr(rawAttrs.review_count, 0),
    isPersonalized: Boolean(rawAttrs.is_personalized),
    isFreeGift: Boolean(rawAttrs.is_free_gift),
    // Spree-specific extras consumed by the cart flow (not part of Product UI)
    ...(variantId ? { _variantId: variantId } : {}),
    _productId: id,
  } as Product & { _variantId?: string; _productId?: string };
}

// ---------------------------------------------------------------------------
// Cart mapping
// ---------------------------------------------------------------------------

export interface MappedLineItem {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image_key: string;
  personalization?: string;
}

export interface MappedCart {
  token: string;
  number: string;
  state: string;
  email: string;
  itemCount: number;
  itemTotal: number;
  shipTotal: number;
  promoTotal: number;
  total: number;
  currency: string;
  lineItems: MappedLineItem[];
}

/**
 * Map a SpreeCart (client view, values already numeric) onto the flat
 * MappedCart shape used by the frontend cart flow.
 */
export function mapCart(cart: SpreeCart): MappedCart {
  const lineItems: MappedLineItem[] = (cart.lineItems ?? []).map(
    (li: SpreeCartLineItem) => ({
      id: li.id,
      variantId: li.variantId,
      slug: li.slug,
      name: li.name,
      quantity: li.quantity,
      price: li.price,
      total: Number((li.price * li.quantity).toFixed(2)),
      image_key: li.imageKey ?? `talisman/${li.slug}`,
      personalization: li.options?.personalization ?? undefined,
    })
  );
  return {
    token: cart.token,
    number: cart.number,
    state: cart.state,
    email: cart.email ?? "",
    itemCount: cart.itemCount,
    itemTotal: cart.itemTotal,
    shipTotal: cart.shipTotal,
    promoTotal: cart.promoTotal,
    total: cart.total,
    currency: cart.currency,
    lineItems,
  };
}

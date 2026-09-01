/**
 * Spree Storefront API v2 client.
 *
 * Dual-mode:
 *  - Default: talks to the local compatibility layer (`/api/v2/storefront/*`).
 *  - Set `SPREE_API_URL` to point at a real Spree 5.4 backend — zero code changes elsewhere.
 *
 * All responses are deserialized from JSON:API into the existing domain models
 * (`Product`, `SpreeCart`) so pages and components stay unchanged.
 */


const API_BASE = process.env.SPREE_API_URL ?? '/api/v2/storefront';

/** Persisted guest cart token (localStorage). */
export const SPREE_TOKEN_KEY = 'fubao_spree_order_token';

export interface SpreeCartLineItem {
  id: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageKey: string | null;
  options: Record<string, string> | null;
  personalization: string | null;
}

export interface SpreeCart {
  token: string;
  number: string;
  state: string;
  itemCount: number;
  itemTotal: number;
  shipTotal: number;
  promoTotal: number;
  total: number;
  currency: string;
  email: string | null;
  lineItems: SpreeCartLineItem[];
}

interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, { data: unknown }>;
}

interface JsonApiResponse {
  data: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
  meta?: Record<string, unknown>;
}

export class SpreeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    token?: string | null;
    bearer?: string | null;
  } = {}
): Promise<JsonApiResponse> {
  const headers: Record<string, string> = { Accept: 'application/vnd.api+json' };
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (init.token) headers['X-Spree-Order-Token'] = init.token;
  if (init.bearer) headers['Authorization'] = `Bearer ${init.bearer}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });

  const json = (await res.json().catch(() => null)) as (JsonApiResponse & { error?: string }) | null;

  if (!res.ok) {
    const message =
      json?.error ??
      (Array.isArray(json?.data) ? 'Spree API request failed' : 'Spree API request failed');
    throw new SpreeError(message, res.status);
  }

  return json as JsonApiResponse;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function variantIdFromResource(resource: JsonApiResource): string | null {
  const variantsData = resource.relationships?.variants?.data;
  if (Array.isArray(variantsData) && variantsData.length > 0) {
    return String((variantsData[0] as { id?: string }).id ?? '');
  }
  if (variantsData && !Array.isArray(variantsData)) {
    return String((variantsData as { id?: string }).id ?? '');
  }
  return null;
}

export interface SpreeRitualInfo {
  master: string;
  temple: string;
  consecration_date?: string;
  ceremony?: string;
}

/**
 * Product view-model parsed from the Spree JSON:API contract.
 * Field names follow the storefront API response (snake_case attributes).
 */
export interface SpreeProduct {
  /** numeric product id */
  id: string;
  /** default variant id used for add-to-cart */
  variantId: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  tagline: string;
  story: string[];
  imageKey: string;
  ritualInfo: SpreeRitualInfo | null;
  rating: number;
  reviewCount: number;
  isPersonalized: boolean;
}

function ritualInfoFromAttributes(a: Record<string, unknown>): SpreeRitualInfo | null {
  const raw = a.ritual_info;
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (r.master || r.temple) {
      return {
        master: String(r.master ?? ''),
        temple: String(r.temple ?? ''),
        consecration_date: r.consecration_date != null ? String(r.consecration_date) : undefined,
        ceremony: r.ceremony != null ? String(r.ceremony) : undefined,
      };
    }
    return null;
  }
  if (typeof raw === 'string' && raw) {
    return { master: raw, temple: '' };
  }
  return null;
}

function productFromResource(resource: JsonApiResource): SpreeProduct {
  const a = resource.attributes;
  const variantId = variantIdFromResource(resource) ?? resource.id;
  const rawCategory = String(a.category ?? a.product_type ?? '');
  const storyRaw = String(a.description ?? '');

  return {
    id: resource.id,
    variantId,
    slug: String(a.slug ?? ''),
    name: String(a.name ?? ''),
    price: num(a.price),
    category: rawCategory,
    tagline: String(a.tagline ?? a.meta_description ?? ''),
    story: storyRaw.split('\n\n').filter(Boolean),
    imageKey: String(a.image_key ?? ''),
    ritualInfo: ritualInfoFromAttributes(a),
    rating: num(a.rating, 4.8),
    reviewCount: num(a.review_count ?? a.reviews_count, 0),
    isPersonalized: Boolean(a.is_personalized),
  };
}

export async function spreeListProducts(params: {
  filterName?: string;
  filterTaxons?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<{ products: SpreeProduct[]; totalCount: number; totalPages: number }> {
  const search = new URLSearchParams();
  if (params.filterName) search.set('filter[name]', params.filterName);
  if (params.filterTaxons) search.set('filter[taxons]', params.filterTaxons);
  if (params.page) search.set('page', String(params.page));
  if (params.perPage) search.set('per_page', String(params.perPage));

  const query = search.toString();
  const json = await request(`/products${query ? `?${query}` : ''}`);

  const list = Array.isArray(json.data) ? json.data : [json.data];
  const variantById = new Map<string, JsonApiResource>();
  for (const inc of json.included ?? []) {
    if (inc.type === 'variant' && inc.attributes?.product_id != null) {
      variantById.set(String(inc.attributes.product_id), inc);
    }
  }

  return {
    products: list.map((p) => productFromResource(p)),
    totalCount: num(json.meta?.total_count, list.length),
    totalPages: num(json.meta?.total_pages, 1),
  };
}

export async function spreeGetProduct(slug: string): Promise<SpreeProduct | null> {
  try {
    const json = await request(`/products/${encodeURIComponent(slug)}`);
    const resource = Array.isArray(json.data) ? json.data[0] : json.data;
    if (!resource) return null;

    const variantById = new Map<string, JsonApiResource>();
    for (const inc of json.included ?? []) {
      if (inc.type === 'variant' && inc.attributes?.product_id != null) {
        variantById.set(String(inc.attributes.product_id), inc);
      }
    }
    return productFromResource(resource);
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) return null;
    throw error;
  }
}

export async function spreeGetVariantId(slug: string): Promise<string | null> {
  const product = await spreeGetProduct(slug);
  return product?.variantId ?? product?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

function cartFromJson(json: JsonApiResponse, fallbackToken: string): SpreeCart {
  const resource = Array.isArray(json.data) ? json.data[0] : json.data;
  const a = resource.attributes ?? {};

  const lineItems: SpreeCartLineItem[] = (json.included ?? [])
    .filter((inc) => inc.type === 'line_item')
    .map((inc) => {
      const la = inc.attributes;
      const options = (la.options as Record<string, string> | null | undefined) ?? null;
      const personalization = options?.personalization ?? null;
      return {
        id: inc.id,
        variantId: String(la.variant_id ?? ''),
        slug: String(la.slug ?? ''),
        name: String(la.name ?? ''),
        price: num(la.price),
        quantity: num(la.quantity, 1),
        imageKey: (la.image_key as string | undefined) ?? null,
        options,
        personalization,
      };
    });

  return {
    token: String(a.token ?? fallbackToken),
    number: String(a.number ?? ''),
    state: String(a.state ?? 'cart'),
    itemCount: num(a.item_count, lineItems.length),
    itemTotal: num(a.item_total),
    shipTotal: num(a.ship_total),
    promoTotal: num(a.promo_total),
    total: num(a.total),
    currency: String(a.currency ?? 'USD'),
    email: (a.email as string | null) || null,
    lineItems,
  };
}

export function getSpreeCartToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SPREE_TOKEN_KEY);
}

export function saveSpreeCartToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SPREE_TOKEN_KEY, token);
}

export function clearSpreeCartToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SPREE_TOKEN_KEY);
}

export async function spreeCreateCart(): Promise<SpreeCart> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { Accept: 'application/vnd.api+json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new SpreeError('Failed to create cart', res.status);
  const token = res.headers.get('X-Spree-Order-Token') ?? '';
  const json = (await res.json()) as JsonApiResponse;
  const cart = cartFromJson(json, token);
  if (token) saveSpreeCartToken(token);
  return cart;
}

export async function spreeGetCart(token: string): Promise<SpreeCart | null> {
  try {
    const json = await request('/cart', { token });
    return cartFromJson(json, token);
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) return null;
    throw error;
  }
}

/* ---------- Checkout state machine (Spree v2 contract) ---------- */

export interface SpreeCheckoutAddress {
  email: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2?: string;
  city: string;
  zipcode: string;
  countryIso: string;
  phone: string;
  stateName?: string;
}

export interface SpreeCheckoutResult {
  orderNumber: string;
  total: number;
  state: string;
  paymentState: string | null;
}

function orderResultFromJson(json: JsonApiResponse, fallbackToken: string): SpreeCheckoutResult {
  const d = Array.isArray(json.data) ? json.data[0] : json.data;
  const a = d?.attributes ?? {};
  return {
    orderNumber: String(a.number ?? ''),
    state: String(a.state ?? ''),
    total: num(a.total),
    paymentState: (a.payment_state as string | null) ?? null,
  };
}

async function checkoutStep(
  path: string,
  token: string,
  body?: Record<string, unknown>,
): Promise<JsonApiResponse> {
  return request(path, {
    method: 'PATCH',
    token,
    body: body ?? {},
  });
}

export async function spreeCheckoutAddress(token: string, address: SpreeCheckoutAddress): Promise<SpreeCheckoutResult> {
  const [firstname, ...rest] = address.firstname.trim().split(/\s+/);
  const lastname = rest.length > 0 ? rest.join(' ') : firstname;
  const json = await checkoutStep('/checkout/address', token, {
    order: {
      email: address.email,
      bill_address_attributes: {
        firstname,
        lastname,
        address1: address.address1,
        address2: address.address2 ?? '',
        city: address.city,
        zipcode: address.zipcode,
        country_iso: address.countryIso,
        phone: address.phone,
        state_name: address.stateName ?? '',
      },
      ship_address_attributes: {
        firstname,
        lastname,
        address1: address.address1,
        address2: address.address2 ?? '',
        city: address.city,
        zipcode: address.zipcode,
        country_iso: address.countryIso,
        phone: address.phone,
        state_name: address.stateName ?? '',
      },
    },
  });
  return orderResultFromJson(json, token);
}

export async function spreeCheckoutDelivery(token: string, shippingRateId: string): Promise<SpreeCheckoutResult> {
  const json = await checkoutStep('/checkout/delivery', token, {
    order: {
      shipments_attributes: [{ selected_shipping_rate_id: shippingRateId }],
    },
  });
  return orderResultFromJson(json, token);
}

export async function spreeCheckoutPayment(token: string, paymentMethodId: string): Promise<SpreeCheckoutResult> {
  const json = await checkoutStep('/checkout/payment', token, {
    order: {
      payments_attributes: [{ payment_method_id: paymentMethodId }],
    },
  });
  return orderResultFromJson(json, token);
}

export async function spreeCheckoutConfirm(token: string): Promise<SpreeCheckoutResult> {
  const json = await checkoutStep('/checkout/confirm', token, {});
  return orderResultFromJson(json, token);
}

export async function spreeCheckoutComplete(token: string): Promise<SpreeCheckoutResult> {
  const json = await checkoutStep('/checkout/complete', token, {});
  return orderResultFromJson(json, token);
}

export interface SpreePaymentMethod {
  id: string;
  name: string;
  description: string | null;
  methodType: string;
}

export async function spreeGetPaymentMethods(token?: string | null): Promise<SpreePaymentMethod[]> {
  const json = await request('/checkout/payment_methods', { token: token ?? null });
  const list = Array.isArray(json.data) ? json.data : [json.data].filter(Boolean);
  return list.map((r) => ({
    id: String(r.id),
    name: String(r.attributes.name ?? ''),
    description: (r.attributes.description as string | null) ?? null,
    methodType: String(r.attributes.method_type ?? ''),
  }));
}

export interface SpreeShippingRate {
  id: string;
  name: string;
  cost: number;
  days: string | null;
  selected: boolean;
}

export async function spreeGetShippingRates(token: string): Promise<SpreeShippingRate[]> {
  const json = await request('/checkout/shipping_rates', { token });
  const list = Array.isArray(json.data) ? json.data : [json.data].filter(Boolean);
  return list.map((r) => ({
    id: String(r.id),
    name: String(r.attributes.name ?? ''),
    cost: num(r.attributes.cost ?? r.attributes.amount),
    days: (r.attributes.days as string | null) ?? null,
    selected: Boolean(r.attributes.selected),
  }));
}

export async function spreeApplyCoupon(token: string, code: string): Promise<SpreeCart> {
  const json = await request('/cart/apply-promo-code', {
    method: 'PATCH',
    token,
    body: { coupon_code: code },
  });
  return cartFromJson(json, token);
}

export async function spreeAddItem(
  token: string,
  variantId: string,
  quantity: number,
  options?: Record<string, string>
): Promise<SpreeCart> {
  const json = await request('/cart/add-item', {
    method: 'POST',
    token,
    body: { variant_id: variantId, quantity, ...(options ? { options } : {}) },
  });
  return cartFromJson(json, token);
}

export async function spreeSetQuantity(
  token: string,
  lineItemId: string,
  quantity: number
): Promise<SpreeCart> {
  const json = await request(`/cart/set-quantity/${encodeURIComponent(lineItemId)}`, {
    method: 'PATCH',
    token,
    body: { quantity },
  });
  return cartFromJson(json, token);
}

export async function spreeRemoveLineItem(token: string, lineItemId: string): Promise<SpreeCart> {
  const json = await request(`/cart/remove-line-item/${encodeURIComponent(lineItemId)}`, {
    method: 'DELETE',
    token,
  });
  return cartFromJson(json, token);
}

export async function spreeEmptyCart(token: string): Promise<SpreeCart> {
  const json = await request('/cart/empty', { method: 'DELETE', token });
  return cartFromJson(json, token);
}

export async function spreeApplyPromoCode(token: string, code: string): Promise<SpreeCart> {
  const json = await request('/cart/apply-promo-code', {
    method: 'PATCH',
    token,
    body: { coupon_code: code },
  });
  return cartFromJson(json, token);
}

export async function spreeEstimateShippingRates(
  token: string | null,
  countryIso: string
): Promise<{ id: string; name: string; amount: number; days: string; selected: boolean }[]> {
  const search = new URLSearchParams({ country_iso: countryIso });
  const json = await request(`/cart/estimate_shipping_rates?${search}`, { token });
  const list = Array.isArray(json.data) ? json.data : [json.data];
  return list.map((r) => ({
    id: r.id,
    name: String(r.attributes.name ?? ''),
    amount: num(r.attributes.amount),
    days: String(r.attributes.days ?? ''),
    selected: Boolean(r.attributes.selected),
  }));
}


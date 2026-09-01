/**
 * Spree Commerce API v2 compatible types (JSON:API format).
 *
 * These types mirror the Spree 5.4 storefront API contracts so that any
 * official Spree storefront (nextjs-starter-spree) or Spree SDK client can
 * consume this API by simply pointing SPREE_API_URL at this service.
 * See: https://api.spreecommerce.org/docs/api-v2/docs/api/v2 storefront/index
 */

export interface SpreeRelationshipData {
  id: string;
  type: string;
}

export interface SpreeRelationship {
  data: SpreeRelationshipData | SpreeRelationshipData[] | null;
}

export interface SpreeResource {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, SpreeRelationship>;
}

export interface SpreeListResponse {
  data: SpreeResource[];
  included?: SpreeResource[];
  meta: {
    count: number;
    total_count: number;
    total_pages: number;
  };
  links: {
    self: string;
    next: string | null;
    prev: string | null;
    last: string | null;
    first: string | null;
  };
}

export interface SpreeSingleResponse {
  data: SpreeResource;
  included?: SpreeResource[];
}

/** Spree order state machine: cart → address → delivery → payment → confirm → complete */
export type SpreeOrderStatus =
  | 'cart'
  | 'address'
  | 'delivery'
  | 'payment'
  | 'confirm'
  | 'complete';

export interface SpreeLineItemOptions {
  personalization?: string;
}

export interface SpreeLineItemState {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  vendorId: string;
  options?: SpreeLineItemOptions;
}

export interface SpreeAddressState {
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  phone: string;
  state_name: string;
  country_iso: string;
}

export interface SpreeOrderState {
  id: string;
  number: string;
  guestToken: string;
  userId: string | null;
  email: string;
  state: SpreeOrderStatus;
  lineItems: SpreeLineItemState[];
  shipAddress: SpreeAddressState | null;
  billAddress: SpreeAddressState | null;
  shippingRateId: string | null;
  paymentMethodId: string | null;
  itemTotal: number;
  shipTotal: number;
  paymentTotal: number;
  promoTotal: number;
  adjustmentTotal: number;
  couponCode: string | null;
  createdAt: string;
  completedAt: string | null;
  paymentStatus: string;
  shipmentStatus: string;
}

export interface SpreePaymentMethod {
  id: string;
  type: string;
  name: string;
  description: string;
  methodType: 'stripe' | 'crypto' | 'check';
}

export interface SpreeShippingRate {
  id: string;
  name: string;
  description: string;
  cost: number;
  selected: boolean;
  free: boolean;
}

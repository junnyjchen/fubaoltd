/**
 * Spree-compatible order (cart/checkout) store.
 *
 * Implements Spree's guest order token mechanism (X-Spree-Order-Token header)
 * and the order state machine: cart → address → delivery → payment → confirm
 * → complete.
 *
 * In-memory store follows the same pattern as the other FuBao stores. Swap
 * with a real Spree backend or database later without touching the routes.
 */

import { products } from '@/lib/data/products';
import { validateCoupon } from '@/lib/coupons/coupon-store';
import type {
  SpreeAddressState,
  SpreeLineItemOptions,
  SpreeLineItemState,
  SpreeOrderState,
  SpreePaymentMethod,
  SpreeShippingRate,
} from './types';

const SHIPPING_COST = 12.99;

export const PAYMENT_METHODS: SpreePaymentMethod[] = [
  {
    id: '1',
    type: 'payment_method',
    name: 'Stripe Credit Card',
    description: 'Pay securely with credit card via Stripe',
    methodType: 'stripe',
  },
  {
    id: '2',
    type: 'payment_method',
    name: 'Crypto (USDT / USDC)',
    description: 'Pay with USDT or USDC on TRC20, ERC20, BEP20, Solana or Polygon',
    methodType: 'crypto',
  },
];

export const SHIPPING_RATES: SpreeShippingRate[] = [
  {
    id: '1',
    name: 'Standard International Shipping',
    description: '7-14 business days, shipped from Hong Kong',
    cost: SHIPPING_COST,
    selected: true,
    free: false,
  },
  {
    id: '2',
    name: 'Express DHL',
    description: '3-5 business days, tracked express delivery',
    cost: 29.99,
    selected: false,
    free: false,
  },
];

/**
 * In-memory order store keyed by order number.
 *
 * Lives on globalThis so every route handler (and dev-mode module
 * re-instantiations / route-level compilations) shares one instance —
 * the same pattern used for the Prisma client singleton.
 */
const globalState = globalThis as unknown as {
  __fubaoSpreeOrders?: Map<string, SpreeOrderState>;
};
const orderStore: Map<string, SpreeOrderState> =
  globalState.__fubaoSpreeOrders ?? (globalState.__fubaoSpreeOrders = new Map());

function randomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function orderNumber(): string {
  return `R${Math.floor(100000000 + Math.random() * 900000000)}`;
}

export function createOrder(email?: string): SpreeOrderState {
  const number = orderNumber();
  const order: SpreeOrderState = {
    id: String(orderStore.size + 1),
    number,
    guestToken: randomToken(20),
    userId: null,
    email: email ?? '',
    state: 'cart',
    lineItems: [],
    shipAddress: null,
    billAddress: null,
    shippingRateId: null,
    paymentMethodId: null,
    itemTotal: 0,
    shipTotal: 0,
    paymentTotal: 0,
    promoTotal: 0,
    adjustmentTotal: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    paymentStatus: 'balance_due',
    shipmentStatus: 'pending',
  };
  orderStore.set(number, order);
  return order;
}

export function getOrderByToken(token: string | null): SpreeOrderState | null {
  if (!token) return null;
  for (const order of orderStore.values()) {
    if (order.guestToken === token) return order;
  }
  return null;
}

export function getOrderByNumber(number: string): SpreeOrderState | null {
  return orderStore.get(number) ?? null;
}

/** Spree PATCH /cart/associate — attach a guest cart to a logged-in user. */
export function associateOrderWithUser(
  order: SpreeOrderState,
  userId: string,
  email?: string
): SpreeOrderState {
  order.userId = userId;
  if (email) order.email = email;
  return order;
}

/** List orders belonging to a user, newest first (Spree /account/orders). */
export function listOrdersForUser(userId: string): SpreeOrderState[] {
  return Array.from(orderStore.values())
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** A user's most recent incomplete order (their current cart), newest first. */
export function getCurrentCartForUser(userId: string): SpreeOrderState | null {
  const carts = listOrdersForUser(userId).filter((order) => order.state !== 'complete');
  return carts[0] ?? null;
}

/** Route helper: find cart by guest token, else the signed-in user's cart. */
export function getCart(guestToken?: string | null, userId?: string): SpreeOrderState | null {
  if (guestToken) {
    const order = getOrderByToken(guestToken);
    if (order) return order;
  }
  if (userId) return getCurrentCartForUser(userId);
  return null;
}

/** Route helper: find or implicitly create a cart (Spree auto-creates on add-item). */
export function getOrCreateCart(
  guestToken?: string | null,
  userId?: string,
  email?: string
): SpreeOrderState {
  const existing = getCart(guestToken, userId);
  if (existing) return existing;
  const order = createOrder(email);
  if (userId) associateOrderWithUser(order, userId, email);
  return order;
}

export type CartMutationResult = { ok: true } | { ok: false; error: string };

export function addItemToCart(
  order: SpreeOrderState,
  variantId: string,
  quantity: number,
  personalization?: string
): CartMutationResult {
  const item = addItem(order, variantId, quantity, personalization ? { personalization } : undefined);
  if (!item) return { ok: false, error: `Variant ${variantId} not found` };
  return { ok: true };
}

export function setLineItemQuantity(
  order: SpreeOrderState,
  lineItemId: string,
  quantity: number
): CartMutationResult {
  const item = setQuantity(order, lineItemId, quantity);
  if (!item) return { ok: false, error: `Line item ${lineItemId} not found` };
  return { ok: true };
}

/** Spree DELETE /cart/empty — remove all line items. */
export function emptyCart(order: SpreeOrderState): void {
  order.lineItems = [];
  order.promoTotal = 0;
  recalculateTotals(order);
}

/** Spree PATCH /cart/apply-promo-code — validate against the FuBao coupon engine. */
export function applyPromoCode(
  order: SpreeOrderState,
  code: string
): CartMutationResult {
  const validation = validateCoupon(code, order.itemTotal, order.userId ?? undefined);
  if (!validation.valid || !validation.coupon) {
    return { ok: false, error: validation.error ?? 'Invalid coupon code' };
  }
  if (validation.coupon.type === 'free_shipping') {
    order.promoTotal = Math.min(validation.coupon.value, order.shipTotal);
  } else {
    order.promoTotal = validation.discount;
  }
  return { ok: true };
}

function recalculateTotals(order: SpreeOrderState): void {
  order.itemTotal = Number(
    order.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const rate = SHIPPING_RATES.find((r) => r.id === order.shippingRateId);
  order.shipTotal = order.lineItems.length > 0 ? (rate ? rate.cost : SHIPPING_COST) : 0;
}

export function addItem(
  order: SpreeOrderState,
  variantId: string,
  quantity: number,
  options?: SpreeLineItemOptions,
): SpreeLineItemState | null {
  // Spree variant ids map 1:1 to product ids in this compatibility layer
  const product = products.find((_, index) => String(index + 1) === variantId);
  if (!product) return null;

  const personalization = options?.personalization?.trim() || undefined;
  // Same variant + same personalization merge quantities (Spree line item options semantics)
  const existing = order.lineItems.find(
    (item) => item.variantId === variantId && (item.options?.personalization || undefined) === personalization,
  );
  if (existing) {
    existing.quantity += quantity;
    recalculateTotals(order);
    return existing;
  }

  const lineItem: SpreeLineItemState = {
    id: String(order.lineItems.length + 1),
    variantId,
    productId: variantId,
    name: product.name,
    slug: product.slug,
    sku: `FB-${product.slug.toUpperCase().slice(0, 14)}`,
    price: product.price,
    quantity,
    vendorId: product.slug.includes('protection') || product.slug.includes('home-blessing') ? '1' : '2',
    options: personalization ? { personalization } : undefined,
  };
  order.lineItems.push(lineItem);
  recalculateTotals(order);
  return lineItem;
}

export function setQuantity(
  order: SpreeOrderState,
  lineItemId: string,
  quantity: number,
): SpreeLineItemState | null {
  const item = order.lineItems.find((li) => li.id === lineItemId);
  if (!item) return null;
  if (quantity <= 0) {
    order.lineItems = order.lineItems.filter((li) => li.id !== lineItemId);
  } else {
    item.quantity = quantity;
  }
  recalculateTotals(order);
  return item;
}

export function removeLineItem(order: SpreeOrderState, lineItemId: string): boolean {
  const before = order.lineItems.length;
  order.lineItems = order.lineItems.filter((li) => li.id !== lineItemId);
  recalculateTotals(order);
  return order.lineItems.length < before;
}

export function orderTotal(order: SpreeOrderState): number {
  return Number((order.itemTotal + order.shipTotal - order.promoTotal + order.adjustmentTotal).toFixed(2));
}

/**
 * Spree checkout state machine transitions.
 * cart → address → delivery → payment → confirm → complete
 */
export function nextState(state: SpreeOrderState['state']): SpreeOrderState['state'] | null {
  const flow: Record<string, SpreeOrderState['state']> = {
    cart: 'address',
    address: 'delivery',
    delivery: 'payment',
    payment: 'confirm',
    confirm: 'complete',
  };
  return flow[state] ?? null;
}

export function updateAddress(
  order: SpreeOrderState,
  email: string,
  address: SpreeAddressState,
): void {
  order.email = email;
  order.shipAddress = address;
  order.billAddress = address;
}

export function selectShippingRate(order: SpreeOrderState, shippingRateId: string): boolean {
  const rate = SHIPPING_RATES.find((r) => r.id === shippingRateId);
  if (!rate) return false;
  order.shippingRateId = shippingRateId;
  recalculateTotals(order);
  return true;
}

export function selectPaymentMethod(order: SpreeOrderState, paymentMethodId: string): boolean {
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);
  if (!method) return false;
  order.paymentMethodId = paymentMethodId;
  return true;
}

export function completeOrder(order: SpreeOrderState): boolean {
  if (order.state !== 'confirm' || order.lineItems.length === 0) return false;
  order.state = 'complete';
  order.completedAt = new Date().toISOString();
  order.paymentTotal = orderTotal(order);
  order.paymentStatus = 'paid';
  order.shipmentStatus = 'ready';
  return true;
}

/** Route-level alias used by checkout endpoints. */
export const getCartByToken = getOrderByToken;

/**
 * Spree GET/POST /checkout/next — advance one step with validation.
 * Rejects the transition when the step's prerequisites are missing,
 * mirroring Spree's "could not transition" 422 responses.
 */
export function advanceOrderState(order: SpreeOrderState): boolean {
  const target = nextState(order.state);
  if (!target) return false;

  switch (order.state) {
    case 'cart':
      if (order.lineItems.length === 0) return false;
      break;
    case 'address':
      if (!order.shipAddress || !order.email) return false;
      break;
    case 'delivery':
      if (!order.shippingRateId) return false;
      break;
    case 'payment':
      if (!order.paymentMethodId) return false;
      break;
    case 'confirm':
      return completeOrder(order);
    default:
      return false;
  }

  order.state = target;
  return true;
}

/** Spree PATCH /checkout/advance — auto-advance as far as prerequisites allow. */
export function advanceUntilPayment(order: SpreeOrderState): void {
  while (order.state !== 'payment' && order.state !== 'complete') {
    if (!advanceOrderState(order)) break;
  }
}

/**
 * Spree checkout step semantics: after updating step data (address /
 * delivery / payment) the order transitions forward until a step's
 * prerequisites are missing. Never auto-completes past "confirm".
 */
export function advanceCheckoutSteps(order: SpreeOrderState): void {
  while (order.state !== 'confirm' && order.state !== 'complete') {
    if (!advanceOrderState(order)) break;
  }
}

/** Set checkout address (supports separate bill/ship addresses). */
export function setOrderAddress(
  order: SpreeOrderState,
  data: { email: string; billAddress?: SpreeAddressState; shipAddress?: SpreeAddressState }
): void {
  const address = data.shipAddress ?? data.billAddress;
  if (!address) return;
  updateAddress(order, data.email, address);
  if (data.billAddress && data.shipAddress) order.billAddress = data.billAddress;
}

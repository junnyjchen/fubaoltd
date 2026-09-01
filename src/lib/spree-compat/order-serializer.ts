/**
 * Order/cart serializers + shared helpers for the Spree-compatible
 * storefront API routes.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { products } from '@/lib/data/products';
import { verifyToken, type TokenPayload } from '@/lib/auth/jwt';
import { getSession } from '@/lib/auth/session';
import {
  PAYMENT_METHODS,
  SHIPPING_RATES,
  getCart,
  getOrderByToken,
  orderTotal,
} from './order-store';
import type { SpreeOrderState } from './types';
import { formatMoney, serializeVariant } from './serializers';
import type { SpreeResource } from './types';

export function serializeOrder(order: SpreeOrderState): SpreeResource {
  return {
    id: order.id,
    type: 'cart',
    attributes: {
      number: order.number,
      item_total: order.itemTotal.toFixed(2),
      total: orderTotal(order).toFixed(2),
      ship_total: order.shipTotal.toFixed(2),
      adjustment_total: order.adjustmentTotal.toFixed(2),
      included_tax_total: '0.0',
      additional_tax_total: '0.0',
      display_additional_tax_total: '$0.00',
      display_included_tax_total: '$0.00',
      tax_total: '0.0',
      currency: 'USD',
      state: order.state,
      token: order.guestToken,
      email: order.email,
      special_instructions: null,
      payment_state: order.paymentStatus,
      shipment_state: order.shipmentStatus,
      item_count: order.lineItems.reduce((sum, li) => sum + li.quantity, 0),
      promo_total: order.promoTotal.toFixed(2),
      coupon_code: order.couponCode,
      display_item_total: formatMoney(order.itemTotal),
      display_total: formatMoney(orderTotal(order)),
      display_ship_total: formatMoney(order.shipTotal),
      display_promo_total: formatMoney(order.promoTotal),
      created_at: order.createdAt,
      updated_at: order.completedAt ?? order.createdAt,
      completed_at: order.completedAt,
      payment_summary: order.paymentMethodId
        ? PAYMENT_METHODS.find((m) => m.id === order.paymentMethodId)?.name
        : null,
      shipment_summary: order.shippingRateId
        ? SHIPPING_RATES.find((r) => r.id === order.shippingRateId)?.name
        : null,
    },
    relationships: {
      line_items: {
        data: order.lineItems.map((li) => ({ id: li.id, type: 'line_item' })),
      },
      variants: {
        data: order.lineItems.map((li) => ({ id: li.variantId, type: 'variant' })),
      },
      vendor: {
        data: order.lineItems.length > 0 ? { id: order.lineItems[0].vendorId, type: 'vendor' } : null,
      },
      payments: { data: [] },
      shipments: { data: [] },
    },
  };
}

export function serializeLineItem(
  order: SpreeOrderState,
  lineItemId: string,
): SpreeResource | null {
  const item = order.lineItems.find((li) => li.id === lineItemId);
  if (!item) return null;
  return {
    id: item.id,
    type: 'line_item',
    attributes: {
      name: item.name,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      total: (item.price * item.quantity).toFixed(2),
      display_price: formatMoney(item.price),
      display_total: formatMoney(item.price * item.quantity),
      currency: 'USD',
      slug: item.slug,
      vendor_id: item.vendorId,
      options: item.options ? { personalization: item.options.personalization } : null,
      adjustment_total: '0.0',
      additional_tax_total: '0.0',
      included_tax_total: '0.0',
      promo_total: '0.0',
    },
    relationships: {
      variant: { data: { id: item.variantId, type: 'variant' } },
      vendor: { data: { id: item.vendorId, type: 'vendor' } },
    },
  };
}

export function orderIncluded(order: SpreeOrderState): SpreeResource[] {
  const lineItems = order.lineItems.map((li) => serializeLineItem(order, li.id)).filter((li) => li !== null) as SpreeResource[];
  const variants = order.lineItems
    .map((li) => {
      const product = products.find((p) => p.slug === li.slug);
      return product ? serializeVariant(product) : null;
    })
    .filter((v) => v !== null) as SpreeResource[];
  return [...lineItems, ...variants];
}

/** Read the Spree guest order token from X-Spree-Order-Token header or bearer */
export function readOrderToken(request: NextRequest): string | null {
  const headerToken = request.headers.get('X-Spree-Order-Token');
  if (headerToken) return headerToken;
  const bearer = request.headers.get('Authorization');
  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.slice(7);
    // Distinguish order tokens from account access tokens
    if (getOrderByToken(token)) return token;
  }
  return null;
}

/** Resolve the account JWT user from the Authorization header (async). */
export async function resolveRequestUser(
  request: NextRequest
): Promise<TokenPayload | null> {
  // 1. Spree-style Bearer token.
  const bearer = request.headers.get('Authorization');
  if (bearer?.startsWith('Bearer ')) {
    const payload = await verifyToken(bearer.slice(7));
    if (payload) return payload;
  }

  // 2. FuBao session cookie (httpOnly — browser same-origin requests).
  const session = await getSession();
  if (session) return session;

  return null;
}

/** Resolve the current cart: guest token first, else signed-in user's cart. */
export async function resolveCartFromRequest(
  request: NextRequest
): Promise<ReturnType<typeof getCart>> {
  const guestToken = request.headers.get('X-Spree-Order-Token');
  const user = await resolveRequestUser(request);
  return getCart(guestToken, user?.sub ?? undefined);
}

export function jsonError(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}

export function buildLinks(baseUrl: string, page: number, totalPages: number): {
  self: string;
  next: string | null;
  prev: string | null;
  last: string | null;
  first: string | null;
} {
  return {
    self: baseUrl,
    next: page < totalPages ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page + 1}` : null,
    prev: page > 1 ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page - 1}` : null,
    last: totalPages > 1 ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${totalPages}` : null,
    first: baseUrl,
  };
}

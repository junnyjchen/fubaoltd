/**
 * Spree Commerce API v2 — Checkout address step.
 *
 * PATCH/PUT /api/v2/storefront/checkout/address
 * Body: { order: { email, bill_address_attributes, ship_address_attributes } }
 *       or flat: { email, ship_address }
 * GET  /api/v2/storefront/checkout/address → current order state
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCartByToken, setOrderAddress, advanceCheckoutSteps } from '@/lib/spree-compat/order-store';
import { serializeOrder } from '@/lib/spree-compat/order-serializer';
import type { SpreeAddressState } from '@/lib/spree-compat/types';

interface SpreeAddressPayload {
  firstname?: string;
  lastname?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zipcode?: string;
  phone?: string;
  state_name?: string;
  country_iso?: string;
}

function requireOrder(request: NextRequest) {
  const token = request.headers.get('X-Spree-Order-Token');
  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Order token is required. Provide X-Spree-Order-Token header.' },
        { status: 401 }
      ),
    };
  }
  const order = getCartByToken(token);
  if (!order) {
    return { error: NextResponse.json({ error: 'Cart not found' }, { status: 404 }) };
  }
  return { order };
}

export async function GET(request: NextRequest) {
  const { order, error } = requireOrder(request);
  if (error) return error;
  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

export async function PATCH(request: NextRequest) {
  return handle(request);
}

export async function PUT(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const { order, error } = requireOrder(request);
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Spree wraps address under `order` key; support both shapes.
  const orderPayload = (body.order as Record<string, unknown>) ?? body;
  const email = orderPayload.email as string | undefined;

  const billAttrs = orderPayload.bill_address_attributes as SpreeAddressPayload | undefined;
  const shipAttrs = (orderPayload.ship_address_attributes ??
    orderPayload.ship_address ??
    billAttrs) as SpreeAddressPayload | undefined;

  if (!shipAttrs && !billAttrs) {
    return NextResponse.json(
      { error: 'bill_address_attributes or ship_address_attributes is required' },
      { status: 422 }
    );
  }

  const toAddress = (a: SpreeAddressPayload | undefined): SpreeAddressState | undefined =>
    a
      ? {
          firstname: a.firstname ?? '',
          lastname: a.lastname ?? '',
          address1: a.address1 ?? '',
          address2: a.address2 ?? '',
          city: a.city ?? '',
          zipcode: a.zipcode ?? '',
          phone: a.phone ?? '',
          state_name: a.state_name ?? '',
          country_iso: a.country_iso ?? 'US',
        }
      : undefined;

  setOrderAddress(order, {
    email: email ?? order.email,
    billAddress: toAddress(billAttrs),
    shipAddress: toAddress(shipAttrs),
  });

  // Spree semantics: updating the address step transitions the order
  // forward (address → delivery) when prerequisites are satisfied.
  advanceCheckoutSteps(order);

  return NextResponse.json({ data: serializeOrder(order), included: [] });
}

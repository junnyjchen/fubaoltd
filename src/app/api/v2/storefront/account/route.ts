/**
 * Spree Commerce API v2 — Account endpoints (token auth).
 *
 * POST /api/v2/storefront/account  → create account
 * GET  /api/v2/storefront/account  → current user (requires Bearer token)
 * PATCH /api/v2/storefront/account → update profile
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createUser, updateUser } from '@/lib/auth/user-store';
import { listOrdersForUser } from '@/lib/spree-compat/order-store';
import { requireSpreeUser } from '@/lib/spree-compat/account-auth';

type AccountAttributes = {
  email?: unknown;
  password?: unknown;
  password_confirmation?: unknown;
  first_name?: unknown;
  last_name?: unknown;
};

function serializeUser(id: string, email: string, name: string, createdAt: string) {
  const [firstName, ...rest] = name.split(' ');
  const completedOrders = listOrdersForUser(id).filter((o) => o.state === 'complete').length;
  return {
    data: {
      id,
      type: 'user',
      attributes: {
        email,
        first_name: firstName || '',
        last_name: rest.join(' ') || '',
        store_credits: '0.0',
        completed_orders: completedOrders,
        public_metadata: {},
        private_metadata: {},
      },
      relationships: {},
    },
  };
}

/** POST — create a new account (guest → registered). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { user?: AccountAttributes };
    const user = body.user ?? (body as AccountAttributes);
    const email = typeof user.email === 'string' ? user.email.trim() : '';
    const password = typeof user.password === 'string' ? user.password : '';
    const passwordConfirmation =
      typeof user.password_confirmation === 'string' ? user.password_confirmation : password;
    const fullName = [
      typeof user.first_name === 'string' ? user.first_name : '',
      typeof user.last_name === 'string' ? user.last_name : '',
    ]
      .filter(Boolean)
      .join(' ');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 422 });
    }
    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: "Password confirmation doesn't match password." },
        { status: 422 }
      );
    }

    const created = await createUser(email, password, fullName || email.split('@')[0]);
    return NextResponse.json(
      serializeUser(created.id, created.email, created.name, created.createdAt),
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 422 }
    );
  }
}

/** GET — current user via Spree Bearer token. */
export async function GET(request: NextRequest) {
  const user = await requireSpreeUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  return NextResponse.json(serializeUser(user.id, user.email, user.name, user.createdAt));
}

/** PATCH — update profile. */
export async function PATCH(request: NextRequest) {
  const user = await requireSpreeUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = (await request.json()) as { user?: AccountAttributes };
  const attrs = body.user ?? (body as AccountAttributes);
  const fullName = [
    typeof attrs.first_name === 'string' ? attrs.first_name : '',
    typeof attrs.last_name === 'string' ? attrs.last_name : '',
  ]
    .filter(Boolean)
    .join(' ');

  const updated = await updateUser(user.id, { name: fullName || user.name });
  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(
    serializeUser(updated.id, updated.email, updated.name, updated.createdAt)
  );
}

import { NextResponse } from 'next/server';
import { products } from '@/lib/data/products';
import {
  getBlessingConfig,
  getBlessingClaim,
  recordBlessingClaim,
  attachCartToken,
  checkBlessingAvailability,
  type BlessingClaim,
  type BlessingMethod,
} from '@/lib/blessing/blessing-store';
import { createNotification } from '@/lib/notifications/notification-store';
import { getSession } from '@/lib/auth/session';
import {
  createOrder,
  getOrderByToken,
  addItem,
} from '@/lib/spree-compat/order-store';
import type { SpreeOrderState } from '@/lib/spree-compat/types';

const BLESSING_SLUG = 'free-blessing-talisman';

/**
 * Idempotently make sure a (guest) cart contains the free blessing line item.
 * Reuses the caller's cart when valid so existing items are preserved;
 * otherwise creates a fresh order. Never duplicates the blessing item.
 */
function ensureBlessingInCart(
  token: string | null
): { token: string; order: SpreeOrderState } {
  let order = token ? getOrderByToken(token) : null;
  if (!order || order.state === 'complete') {
    order = createOrder();
  }
  const alreadyIn = order.lineItems.some((li) => li.slug === BLESSING_SLUG);
  if (!alreadyIn) {
    const variantId = String(
      products.findIndex((p) => p.slug === BLESSING_SLUG) + 1
    );
    addItem(order, variantId, 1);
  }
  return { token: order.guestToken, order };
}

/**
 * Anon-safe: public config + availability so the page can render window /
 * quota / paused states before login. Personal claim only when logged in.
 */
export async function GET() {
  try {
    const availability = checkBlessingAvailability();
    const config = getBlessingConfig();
    const session = await getSession();
    const claim = session ? getBlessingClaim(session.sub) : null;
    return NextResponse.json({
      success: true,
      config,
      availability: {
        status: availability.status,
        claimable: availability.status === 'open',
        message: availability.message,
      },
      claim,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      method?: BlessingMethod;
      cartToken?: string;
    };
    const method = body.method;
    if (method !== 'pickup' && method !== 'mail') {
      return NextResponse.json(
        { success: false, error: 'Invalid method. Use "pickup" or "mail".' },
        { status: 400 }
      );
    }

    const existing = getBlessingClaim(session.sub);
    if (existing && existing.method !== method) {
      return NextResponse.json(
        {
          success: false,
          error: `Blessing already claimed via ${existing.method}. One free blessing per account.`,
        },
        { status: 400 }
      );
    }

    // Idempotent "continue" path — same method re-requested (e.g. returning
    // visitor clicking "Proceed to Checkout" again): just re-prepare the cart.
    // Exempt from window/quota so an in-flight claim can always be finished.
    if (existing) {
      if (method === 'mail') {
        const token = body.cartToken ?? existing.cartToken ?? null;
        const prepared = ensureBlessingInCart(token);
        attachCartToken(session.sub, prepared.token);
        return NextResponse.json({
          success: true,
          claim: { ...existing, cartToken: prepared.token },
          cartToken: prepared.token,
          resumed: true,
        });
      }
      return NextResponse.json({ success: true, claim: existing, resumed: true });
    }

    // New claims must respect the activity window / quota / enabled flag.
    const availability = checkBlessingAvailability();
    if (!availability.claimable) {
      return NextResponse.json(
        { success: false, error: availability.message },
        { status: 400 }
      );
    }

    let claim: BlessingClaim;
    if (method === 'pickup') {
      claim = recordBlessingClaim(session.sub, 'pickup');
      createNotification(
        session.sub,
        'promotion',
        'Blessing Reserved for Pickup',
        `Your free blessing talisman is reserved. Show the code ${claim.pickupCode} at Qingyun Temple, Hong Kong (daily 9:00–17:00).`,
        '/blessing'
      );
      return NextResponse.json({ success: true, claim });
    }

    // Mail: prepare a cart with the $0 blessing item — the guest pays only
    // shipping at checkout.
    const prepared = ensureBlessingInCart(body.cartToken ?? null);
    claim = recordBlessingClaim(session.sub, 'mail', prepared.token);
    createNotification(
      session.sub,
      'promotion',
      'Free Blessing Added to Cart',
      'Your consecrated blessing talisman is in your cart — complete checkout and pay only shipping.',
      '/blessing'
    );
    return NextResponse.json({
      success: true,
      claim,
      cartToken: prepared.token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

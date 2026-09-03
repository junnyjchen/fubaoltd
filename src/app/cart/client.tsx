'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { products } from '@/lib/data/products';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, TicketPercent } from 'lucide-react';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';

export function CartClient() {
  const { items, isLoaded, isSyncing, totals, updateQuantity, removeItem, applyPromo } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoError(null);
    const result = await applyPromo(promoInput);
    if (result.ok) {
      setPromoInput('');
    } else {
      setPromoError(result.error ?? 'Invalid promo code');
    }
  };

  if (!isLoaded) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-smoke">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-smoke/20" />
        <p className="text-sm text-smoke">Your cart is empty</p>
        <Link
          href="/talisman"
          className="mt-4 inline-flex text-sm text-cinnabar underline underline-offset-4"
        >
          Browse talismans
        </Link>
      </div>
    );
  }

  const cartItems = items.map((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return { ...item, product };
  });

  // Totals are owned by the Spree layer — fall back to local math only while
  // the server cart response has not landed yet.
  const subtotal = totals?.itemTotal ?? cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const discount = totals?.promoTotal ?? 0;
  const hasCoupon = Boolean(totals?.couponCode);

  return (
    <div>
      <div className="space-y-4">
        {cartItems.map((item) => {
          const variant = getTalismanVariant(item.slug);
          return (
            <div
              key={item.slug}
              className="flex gap-5 border border-border p-5 transition-all duration-300 hover:shadow-sm"
            >
              {/* Image */}
              <div className="h-28 w-20 flex-shrink-0 overflow-hidden bg-jade">
                <div className="flex h-full w-full items-center justify-center p-2">
                  <TalismanSVG
                    variant={variant}
                    className="h-full w-auto opacity-80"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/talisman/${item.slug}`}
                    className="font-serif text-base text-ink transition-colors hover:text-cinnabar"
                  >
                    {item.product?.name ?? item.name ?? item.slug}
                  </Link>
                  {(item.personalizedInfo || item.personalization) && (
                    <p className="mt-1 text-xs text-smoke italic">
                      Personalized: {item.personalizedInfo || item.personalization}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-cinnabar">
                    ${(item.product?.price ?? item.price ?? 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-smoke transition-colors hover:text-ink"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="border-x border-border px-3 py-1.5 text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-smoke transition-colors hover:text-ink"
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-ink">
                      ${(
                        (item.product?.price ?? item.price ?? 0) * item.quantity
                      ).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="text-smoke transition-colors hover:text-cinnabar"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-smoke">Subtotal</span>
          <span className="text-xl font-light text-ink">
            ${subtotal.toFixed(2)} <span className="text-sm text-smoke">USD</span>
          </span>
        </div>

        {hasCoupon && discount > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gold">
              <TicketPercent className="h-3.5 w-3.5" />
              Promo {totals?.couponCode}
            </span>
            <span className="text-sm text-gold">-${discount.toFixed(2)}</span>
          </div>
        )}
        {hasCoupon && discount > 0 && (
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm text-smoke">After discount</span>
            <span className="text-base font-light text-ink">
              ${(Math.max(subtotal - discount, 0)).toFixed(2)} <span className="text-sm text-smoke">USD</span>
            </span>
          </div>
        )}

        {/* Promo code */}
        {hasCoupon ? (
          <p className="mt-4 text-xs tracking-wide text-smoke">
            Promo code applied to this order
          </p>
        ) : (
          <form onSubmit={handleApplyPromo} className="mt-4">
            <div className="flex">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  setPromoError(null);
                }}
                placeholder="Promo code"
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-smoke/50 focus:border-gold focus:outline-none"
                aria-label="Promo code"
              />
              <button
                type="submit"
                disabled={isSyncing || !promoInput.trim()}
                className="whitespace-nowrap border border-l-0 border-border px-4 text-sm tracking-wide text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSyncing ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {promoError && <p className="mt-2 text-xs text-cinnabar">{promoError}</p>}
          </form>
        )}
        <p className="mt-2 text-xs text-smoke">
          Looking for a code?{' '}
          <a href="/coupons" className="text-cinnabar underline underline-offset-2 hover:text-cinnabar/80">
            Browse the Coupon Center
          </a>
        </p>

        <p className="mt-2 text-xs text-smoke">
          Shipping calculated at checkout
        </p>
        <Link
          href="/checkout"
          className="mt-6 block w-full border border-cinnabar bg-cinnabar py-3.5 text-center text-sm font-medium tracking-wide text-white transition-colors hover:bg-cinnabar/90"
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/talisman"
          className="mt-3 block text-center text-sm text-smoke transition-colors hover:text-ink"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

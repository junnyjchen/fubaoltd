'use client';

import { useCart } from '@/hooks/use-cart';
import { products } from '@/lib/data/products';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';

export function CartClient() {
  const { items, isLoaded, updateQuantity, removeItem } = useCart();

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

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

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
                    {item.product?.name ?? item.slug}
                  </Link>
                  {item.personalizedInfo && (
                    <p className="mt-1 text-xs text-smoke italic">
                      Personalized: {item.personalizedInfo}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-cinnabar">
                    ${item.product?.price.toFixed(2)}
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
                      ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
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

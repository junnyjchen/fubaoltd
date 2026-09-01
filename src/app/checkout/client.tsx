'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { products } from '@/lib/data/products';
import { submitOrder } from '@/lib/api';
import type { ShippingAddress } from '@/lib/data/types';
import Link from 'next/link';
import { CreditCard, Loader2 } from 'lucide-react';

export function CheckoutClient() {
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPaymentMsg, setShowPaymentMsg] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const cartItems = items.map((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return {
      slug: item.slug,
      name: product?.name ?? item.slug,
      price: product?.price ?? 0,
      quantity: item.quantity,
    };
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await submitOrder({
        items: cartItems,
        shippingInfo: form,
        email: form.email,
      });
      setOrderId(order.id);
      clearCart();
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cinnabar/30">
            <span className="font-serif text-2xl text-cinnabar">✓</span>
          </div>
          <h2 className="font-serif text-2xl font-light text-ink">
            Order Confirmed
          </h2>
          <p className="mt-2 text-sm text-smoke">
            Thank you for your order. Your order ID is:
          </p>
          <p className="mt-2 font-mono text-sm text-cinnabar">{orderId}</p>
          <p className="mt-4 text-sm text-smoke">
            A confirmation email will be sent to {form.email}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex border border-cinnabar bg-cinnabar px-8 py-3 text-sm text-white transition-colors hover:bg-cinnabar/90"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-12 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-ink">
            Shipping Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-smoke">Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">Phone</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-smoke">Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">
                State / Province
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                required
                value={form.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-smoke">Country</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="mt-8">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Payment
            </h2>
            <div className="border border-border p-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-smoke" />
                <span className="text-sm text-ink">Stripe</span>
              </div>
              {showPaymentMsg && (
                <p className="mt-3 text-xs text-cinnabar">
                  Payment will be available soon. Your order has been recorded.
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPaymentMsg(true)}
                className="mt-4 text-xs text-smoke underline underline-offset-2"
              >
                What payment methods do you accept?
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="border border-border p-6">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Order Summary
            </h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="flex justify-between text-sm"
                >
                  <span className="text-smoke">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-lg font-light text-cinnabar">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full border border-cinnabar bg-cinnabar py-3 text-sm font-medium text-white transition-colors hover:bg-cinnabar/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

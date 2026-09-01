'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import type { ShippingAddress } from '@/lib/data/types';
import Link from 'next/link';
import { Bitcoin, CreditCard, Loader2, Ticket } from 'lucide-react';
import {
  spreeCheckoutAddress,
  spreeCheckoutDelivery,
  spreeCheckoutPayment,
  spreeCheckoutConfirm,
  spreeCheckoutComplete,
  spreeGetShippingRates,
  spreeGetPaymentMethods,
  getSpreeCartToken,
  type SpreePaymentMethod,
} from '@/lib/spree/client';

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

export function CheckoutClient() {
  const router = useRouter();
  const { items, isLoaded, resetCart, totals } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState<SpreePaymentMethod[]>([]);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingAddress>(EMPTY_ADDRESS);

  // Payment methods come from the Spree layer — never hardcoded per-page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await spreeGetPaymentMethods(getSpreeCartToken());
        if (cancelled) return;
        setMethods(list);
        const preferred = list.find((m) => m.methodType === 'stripe') ?? list[0];
        if (preferred) setSelectedMethodId(preferred.id);
      } catch {
        if (!cancelled)
          setMethodsError('Could not load payment methods. Please refresh the page.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cartItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  // Server-owned totals (Spree cart) with a client-side fallback while syncing.
  const fallbackSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );
  const itemTotal = totals?.itemTotal ?? fallbackSubtotal;
  const shipTotal = totals?.shipTotal ?? 0;
  const promoTotal = totals?.promoTotal ?? 0;
  const couponCode = totals?.couponCode ?? null;
  const grandTotal = totals?.total ?? fallbackSubtotal;

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cartToken = getSpreeCartToken();
    if (!cartToken) {
      setError('Your cart session has expired. Please refresh and try again.');
      return;
    }
    const method = methods.find((m) => m.id === selectedMethodId);
    if (!method) {
      setError('Please select a payment method.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Spree checkout state machine: address -> delivery -> payment -> confirm -> complete
      await spreeCheckoutAddress(cartToken, {
        email: form.email,
        firstname: form.fullName,
        lastname: form.fullName.split(' ').slice(1).join(' ') || form.fullName,
        address1: form.address,
        city: form.city,
        zipcode: form.zipCode,
        countryIso: form.country || 'US',
        phone: form.phone,
        stateName: form.state,
      });

      const rates = await spreeGetShippingRates(cartToken);
      const selectedRate = rates.find((r) => r.selected) ?? rates[0];
      if (!selectedRate) throw new Error('No shipping rates available');
      await spreeCheckoutDelivery(cartToken, selectedRate.id);

      await spreeCheckoutPayment(cartToken, method.id);

      await spreeCheckoutConfirm(cartToken);
      const completed = await spreeCheckoutComplete(cartToken);
      // The Spree cart is now an order — drop the guest token and start fresh.
      resetCart();
      router.push(`/order/${encodeURIComponent(completed.orderNumber)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-smoke" />
        <p className="mt-3 text-sm text-smoke">Loading your cart…</p>
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
              <select
                required
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="NZ">New Zealand</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="NL">Netherlands</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="HK">Hong Kong SAR</option>
                <option value="TW">Taiwan</option>
              </select>
            </div>
          </div>

          {/* Payment — methods served by the Spree layer */}
          <div className="mt-8">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Payment
            </h2>
            {methodsError ? (
              <p className="text-xs text-cinnabar" role="alert">
                {methodsError}
              </p>
            ) : (
              <div className="space-y-3">
                {methods.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-3 border border-border p-4 transition-colors has-[:checked]:border-cinnabar"
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      checked={selectedMethodId === m.id}
                      onChange={() => setSelectedMethodId(m.id)}
                      className="mt-1 accent-cinnabar"
                    />
                    {m.methodType === 'crypto' ? (
                      <Bitcoin className="mt-0.5 h-4 w-4 text-smoke" />
                    ) : (
                      <CreditCard className="mt-0.5 h-4 w-4 text-smoke" />
                    )}
                    <span>
                      <span className="block text-sm text-ink">{m.name}</span>
                      {m.description && (
                        <span className="mt-1 block text-xs text-smoke">
                          {m.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary — server-owned totals */}
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
                    ${((item.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-smoke">Subtotal</span>
                <span className="text-ink">${itemTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-smoke">Shipping</span>
                <span className="text-ink">
                  {shipTotal > 0 ? `$${shipTotal.toFixed(2)}` : 'Calculated at delivery'}
                </span>
              </div>
              {couponCode && promoTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <Ticket className="h-3.5 w-3.5" />
                    Promo {couponCode}
                  </span>
                  <span className="text-gold">−${promoTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-lg font-light text-cinnabar">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full border border-cinnabar bg-cinnabar py-3 text-sm font-medium text-white transition-colors hover:bg-cinnabar/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
            {error && (
              <p className="mt-3 text-xs text-cinnabar" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

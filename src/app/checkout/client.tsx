'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import type { ShippingAddress } from '@/lib/data/types';
import Link from 'next/link';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  spreeCheckoutAddress,
  spreeCheckoutDelivery,
  spreeCheckoutPayment,
  spreeCheckoutConfirm,
  spreeCheckoutComplete,
  spreeGetShippingRates,
  spreeGetPaymentMethods,
  getSpreeCartToken,
  type SpreeShippingRate,
  type SpreePaymentMethod,
} from '@/lib/spree/client';

export function CheckoutClient() {
  const router = useRouter();
  const { items, resetCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPaymentMsg, setShowPaymentMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const cartItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );

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

      const methods = await spreeGetPaymentMethods(cartToken);
      const stripeMethod = methods.find((m) => m.methodType === 'stripe') ?? methods[0];
      if (!stripeMethod) throw new Error('No payment methods available');
      await spreeCheckoutPayment(cartToken, stripeMethod.id);

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
                    ${((item.price ?? 0) * item.quantity).toFixed(2)}
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

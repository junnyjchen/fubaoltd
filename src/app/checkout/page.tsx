import type { Metadata } from 'next';
import { CheckoutClient } from './client';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your FuBao order.',
};

export default function CheckoutPage() {
  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink">
            Checkout
          </h1>
        </div>
        <CheckoutClient />
      </div>
    </div>
  );
}

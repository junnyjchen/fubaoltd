import type { Metadata } from 'next';
import { CartClient } from './client';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your FuBao talisman selections before checkout.',
};

export default function CartPage() {
  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink">
            Shopping Cart
          </h1>
        </div>
        <CartClient />
      </div>
    </div>
  );
}

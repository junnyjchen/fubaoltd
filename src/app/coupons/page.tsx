import type { Metadata } from 'next';
import CouponsClient from './client';

export const metadata: Metadata = {
  title: 'Coupon Center | FuBao',
  description:
    'Browse and claim FuBao coupon codes — welcome discounts, free shipping, and seasonal offers for the talisman collection.',
};

export default function CouponsPage() {
  return (
    <div className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Savings</p>
          <h1 className="mt-3 font-serif text-3xl font-light text-ink sm:text-4xl">
            Coupon Center
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-smoke">
            Claim a coupon code, then apply it in your cart at checkout. One
            code per order — offers for entertainment purposes only.
          </p>
        </header>

        <CouponsClient />
      </div>
    </div>
  );
}

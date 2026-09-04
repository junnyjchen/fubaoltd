import type { Metadata } from 'next';
import RewardsClient from './client';

export const metadata: Metadata = {
  title: 'Redeem Points | FuBao',
  description:
    'Turn FuBao loyalty points into personal coupon codes — earned through daily check-ins, reviews, and referrals.',
};

export default function RewardsPage() {
  return (
    <div className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Loyalty</p>
          <h1 className="mt-3 font-serif text-3xl font-light text-ink sm:text-4xl">
            Redeem Points
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-smoke">
            Your check-ins and referrals earn points — exchange them for personal
            coupon codes, honored at checkout like any other. For entertainment
            purposes only.
          </p>
        </header>

        <RewardsClient />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { getGiveaways } from '@/lib/api';
import GiveawaysClient from './client';

export const metadata: Metadata = {
  title: 'Giveaways & Prizes | FuBao',
  description:
    'Join FuBao giveaway events and claim hand-drawn talisman prizes. No purchase necessary — cultural keepsakes for our community.',
};

export default async function GiveawaysPage() {
  const giveaways = await getGiveaways();

  return (
    <div className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">Community Events</p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-light text-ink">
            Giveaways &amp; Prizes
          </h1>
          <p className="mt-4 text-sm text-smoke leading-relaxed">
            Seasonal blessing events for the FuBao community. Claim a prize,
            keep a hand-drawn cultural keepsake. No purchase necessary —
            prizes are cultural artifacts, for entertainment purposes only.
          </p>
        </header>

        <GiveawaysClient giveaways={giveaways} />
      </div>
    </div>
  );
}

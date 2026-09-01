import type { Metadata } from 'next';
import Link from 'next/link';
import { TalismanSVG } from '@/components/shared/talisman-svg';
import { BlessingClaimFlow } from './client';

export const metadata: Metadata = {
  title: 'Receive a Free Blessing | FuBao',
  description:
    'Claim a free hand-drawn blessing talisman — a consecrated cultural keepsake from Qingyun Temple. Free on-site pickup, or pay shipping only for worldwide delivery.',
  openGraph: {
    title: 'Receive a Free Blessing | FuBao',
    description:
      'A free hand-drawn blessing talisman — consecrated cultural keepsake. Free pickup, or pay shipping only.',
    url: '/blessing',
  },
};

export default function BlessingPage() {
  return (
    <div className="bg-paper">
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <nav className="mb-10 flex items-center gap-2 text-xs text-smoke">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-ink">Free Blessing</span>
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden bg-jade">
            <div className="flex h-full w-full items-center justify-center p-12">
              <TalismanSVG
                variant="protection"
                className="h-full w-auto max-w-[260px] opacity-90"
              />
            </div>
          </div>

          <div>
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="h-px w-8 bg-gold/40" />
              <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
                A Gift from the Temple
              </p>
              <div className="h-px w-8 bg-gold/40" />
            </div>

            <h1 className="font-serif text-4xl font-light leading-[1.2] tracking-wide text-ink sm:text-5xl">
              Receive a
              <br />
              <span className="italic text-cinnabar">Free Blessing</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-smoke sm:text-base">
              The Blessing Talisman (接福符) is our gift to the community. Each
              one is hand-drawn on yellow rice paper with cinnabar ink by
              Master Chen, following the same seven-step consecration process
              as our full collection — offered freely, one per guest.
            </p>

            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-smoke">
              <p>
                Choose how you would like to receive your keepsake — collect
                it in person at our Hong Kong temple, or have it delivered
                anywhere in the world.
              </p>
              <p className="text-xs leading-relaxed">
                Offered as a cultural keepsake. For entertainment purposes
                only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Claim flow */}
      <BlessingClaimFlow />

      {/* How it works */}
      <section className="border-t border-border bg-jade/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-2xl font-light tracking-wide text-ink sm:text-3xl">
            How the Blessing Reaches You
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Claim Your Blessing',
                text: 'Sign in and choose a fulfillment method. One free blessing per account.',
              },
              {
                step: '02',
                title: 'We Prepare the Talisman',
                text: 'Your talisman is consecrated and sealed at Qingyun Temple with a unique ceremony record.',
              },
              {
                step: '03',
                title: 'Receive & Carry',
                text: 'Collect it on-site with your pickup code, or complete checkout — you only pay shipping.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <p className="font-serif text-3xl font-light text-gold/60">{s.step}</p>
                <h3 className="mt-3 text-sm font-medium tracking-wide text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-smoke">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

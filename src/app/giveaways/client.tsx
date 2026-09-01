'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';
import type { Giveaway } from '@/lib/api';
import { Check, CalendarDays, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  giveaways: Giveaway[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GiveawaysClient({ giveaways }: Props) {
  const { user, isLoading } = useAuth();
  // Local overlay of claim results so the UI updates without a refetch
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [claiming, setClaiming] = useState<string | null>(null);

  const claim = async (giveaway: Giveaway) => {
    setClaiming(giveaway.id);
    try {
      const res = await fetch('/api/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: giveaway.id }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Failed to claim');
        return;
      }
      setClaimed(prev => ({ ...prev, [giveaway.id]: true }));
      toast.success('Prize claimed! Our team will contact you about fulfillment.');
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setClaiming(null);
    }
  };

  if (giveaways.length === 0) {
    return (
      <p className="mt-16 text-center text-sm text-smoke">
        No active giveaways right now. Check back soon — new events arrive with each season.
      </p>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      {giveaways.map(giveaway => {
        const alreadyInWinners = user
          ? giveaway.winners.some(w => w.userId === user.id)
          : false;
        const claimedByMe = claimed[giveaway.id] || alreadyInWinners;
        // Optimistic count: a fresh local claim not yet reflected in server data
        const displayCount =
          giveaway.claimedCount + (claimed[giveaway.id] && !alreadyInWinners ? 1 : 0);
        const soldOut = displayCount >= giveaway.totalPrizes;
        const pct = Math.min(100, Math.round((displayCount / giveaway.totalPrizes) * 100));

        return (
          <article
            key={giveaway.id}
            className="border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Prize visual */}
            <div className="flex-shrink-0 flex items-center justify-center bg-jade w-full sm:w-40 h-40">
              <TalismanSVG
                variant={getTalismanVariant(giveaway.productSlug)}
                className="w-24 h-24"
              />
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-cinnabar border border-cinnabar/30">
                  <Sparkles className="h-3 w-3" />
                  Active Event
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-smoke">
                  <CalendarDays className="h-3 w-3" />
                  Ends {formatDate(giveaway.endDate)}
                </span>
              </div>

              <h2 className="mt-3 font-serif text-xl sm:text-2xl font-light text-ink">
                {giveaway.title}
              </h2>
              <p className="mt-2 text-sm text-smoke leading-relaxed">
                {giveaway.description}
              </p>

              <p className="mt-3 text-sm">
                Prize:{' '}
                <Link
                  href={`/talisman/${giveaway.productSlug}`}
                  className="text-cinnabar underline-offset-4 hover:underline"
                >
                  {giveaway.productName}
                </Link>
              </p>

              {/* Requirements */}
              {giveaway.requirements.mustBeVerified && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-smoke">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                  Verified purchase required —{' '}
                  <Link href="/verify" className="text-cinnabar hover:underline">
                    verify your talisman
                  </Link>
                </p>
              )}

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-smoke">
                  <span>
                    {displayCount} of {giveaway.totalPrizes} claimed
                  </span>
                  <span>{soldOut ? 'Fully claimed' : `${giveaway.totalPrizes - displayCount} left`}</span>
                </div>
                <div className="mt-1.5 h-1 bg-jade overflow-hidden">
                  <div
                    className="h-full bg-cinnabar transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Claim */}
              <div className="mt-5">
                {isLoading ? (
                  <button
                    disabled
                    className="border border-border px-6 py-2.5 text-sm text-smoke inline-flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking eligibility…
                  </button>
                ) : claimedByMe ? (
                  <span className="inline-flex items-center gap-2 border border-cinnabar/40 text-cinnabar px-6 py-2.5 text-sm">
                    <Check className="h-4 w-4" />
                    Prize claimed — see notifications
                  </span>
                ) : soldOut ? (
                  <button
                    disabled
                    className="border border-border px-6 py-2.5 text-sm text-smoke/60 cursor-not-allowed"
                  >
                    All prizes claimed
                  </button>
                ) : user ? (
                  <button
                    onClick={() => claim(giveaway)}
                    disabled={claiming === giveaway.id}
                    className="border border-cinnabar bg-cinnabar text-white px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:bg-cinnabar/90 disabled:opacity-70 inline-flex items-center gap-2"
                  >
                    {claiming === giveaway.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Claim Your Prize
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="border border-cinnabar bg-cinnabar text-white px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 hover:bg-cinnabar/90 inline-block"
                  >
                    Sign in to claim
                  </Link>
                )}
              </div>

              {/* Winners */}
              {giveaway.winners.length > 0 && (
                <p className="mt-4 text-xs text-smoke">
                  Recent winners:{' '}
                  {giveaway.winners
                    .slice(-3)
                    .map(w => (w.userId === user?.id ? 'You' : w.userName))
                    .join(', ')}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

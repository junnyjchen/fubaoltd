'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Coins, Copy, Gift, Loader2, Sparkles } from 'lucide-react';
import {
  POINTS_REWARDS,
  describeRewardCoupon,
  type PointReward,
} from '@/lib/points/reward-catalog';

interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  couponCode: string;
  redeemedAt: string;
}

interface RewardsData {
  rewards: PointReward[];
  redemptions: Redemption[];
  points: number;
}

function termsLine(r: PointReward): string[] {
  const terms: string[] = [];
  if (r.minOrderAmount) terms.push(`Min. order $${r.minOrderAmount}`);
  if (r.couponType === 'percentage' && r.maxDiscount)
    terms.push(`Up to $${r.maxDiscount} off`);
  terms.push(`Valid for ${r.validityDays} days after redemption`);
  return terms;
}

export default function RewardsClient() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/user/rewards');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data as RewardsData);
        }
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  const redeem = async (rewardId: string) => {
    if (!user) {
      router.push('/login?redirect=/rewards');
      return;
    }
    setRedeeming(rewardId);
    try {
      const res = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Failed to redeem');
        return;
      }
      const redemption = json.data.redemption as Redemption;
      toast.success(
        `${redemption.rewardTitle} unlocked — code ${redemption.couponCode} added to your coupons`
      );
      await Promise.all([refresh(), refreshUser()]);
    } catch {
      toast.error('Network error, please retry');
    } finally {
      setRedeeming(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Copy failed — select the code manually');
    }
  };

  if (loading || (isLoading && !data)) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-smoke" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-lg border border-gold/30 bg-jade/50 px-6 py-12 text-center">
        <Coins className="mx-auto h-8 w-8 text-gold" />
        <h2 className="mt-4 font-serif text-2xl font-light text-ink">
          Sign in to redeem your points
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-smoke">
          Daily check-ins start at 5 points and grow through the week — new
          members begin with a 100-point welcome bonus.
        </p>
        <Button
          asChild
          className="mt-6 bg-cinnabar text-paper hover:bg-cinnabar/90"
        >
          <Link href="/login?redirect=/rewards">Sign In</Link>
        </Button>
      </div>
    );
  }

  const points = data?.points ?? user.points ?? 0;
  const redemptions = data?.redemptions ?? [];
  const rewards = data?.rewards?.length ? data.rewards : POINTS_REWARDS;

  return (
    <div className="mt-10 space-y-14">
      {/* Balance */}
      <section className="flex flex-col items-center gap-4 rounded-lg border border-gold/30 bg-jade/60 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-paper">
            <Coins className="h-6 w-6 text-gold" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-smoke">
              Your balance
            </p>
            <p className="mt-1 font-serif text-3xl font-light text-ink">
              {points.toLocaleString()} <span className="text-base text-smoke">points</span>
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-smoke">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Earn more on the
          <Link href="/account" className="underline decoration-gold/60 underline-offset-2 hover:text-ink">
            daily check-in
          </Link>
        </p>
      </section>

      {/* Catalog */}
      <section>
        <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl font-light text-ink">
          <Gift className="h-5 w-5 text-gold" />
          Rewards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((r) => {
            const affordable = points >= r.pointsCost;
            const missing = r.pointsCost - points;
            return (
              <div
                key={r.id}
                className="relative overflow-hidden rounded-lg border border-gold/30 bg-paper p-5"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gold/70" />
                <div className="flex items-start justify-between gap-3 pl-3">
                  <div>
                    <p className="font-serif text-2xl font-light text-cinnabar">
                      {describeRewardCoupon(r)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">{r.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-gold">
                      {r.pointsCost.toLocaleString()} pts
                    </p>
                  </div>
                </div>
                <p className="mt-3 pl-3 text-sm leading-relaxed text-smoke">
                  {r.description}
                </p>
                <ul className="mt-3 space-y-1 pl-3">
                  {termsLine(r).map((t) => (
                    <li key={t} className="text-xs text-smoke">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between gap-3 pl-3">
                  <span className="text-xs text-smoke">
                    {affordable
                      ? 'Ready to redeem'
                      : `${missing.toLocaleString()} more points needed`}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => redeem(r.id)}
                    disabled={!affordable || redeeming === r.id}
                    className={
                      affordable
                        ? 'bg-cinnabar text-paper hover:bg-cinnabar/90'
                        : 'border border-gold/30 bg-jade text-smoke hover:bg-jade'
                    }
                  >
                    {redeeming === r.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    {affordable ? 'Redeem' : 'Locked'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl font-light text-ink">
          <Coins className="h-5 w-5 text-gold" />
          Redemption History
        </h2>
        {redemptions.length === 0 ? (
          <p className="rounded-lg border border-gold/20 bg-jade/40 px-6 py-8 text-center text-sm text-smoke">
            No redemptions yet — your first coupon is a few check-ins away.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gold/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20 bg-jade/60 text-left text-xs uppercase tracking-wider text-smoke">
                  <th className="px-4 py-3 font-medium">Reward</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {redemptions.map((rd) => (
                  <tr key={rd.id} className="border-b border-gold/10 last:border-0">
                    <td className="px-4 py-3 text-ink">{rd.rewardTitle}</td>
                    <td className="px-4 py-3 font-mono tracking-wider text-ink">
                      {rd.couponCode}
                    </td>
                    <td className="px-4 py-3 text-cinnabar">-{rd.pointsSpent}</td>
                    <td className="px-4 py-3 text-smoke">
                      {new Date(rd.redeemedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(rd.couponCode)}
                        className="border-gold/40 text-ink hover:bg-jade"
                      >
                        {copied === rd.couponCode ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <Copy className="mr-1 h-3 w-3" />
                        )}
                        {copied === rd.couponCode ? 'Copied' : 'Copy'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-smoke">
          Codes appear in{' '}
          <Link href="/coupons" className="underline decoration-gold/60 underline-offset-2 hover:text-ink">
            My Coupons
          </Link>{' '}
          and are applied at checkout in your cart.
        </p>
      </section>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  Copy,
  DollarSign,
  Gift,
  Link2,
  Loader2,
  MousePointerClick,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface Commission {
  id: string;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  level: number;
  status: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  affiliateLink: {
    code: string;
    url: string;
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
  } | null;
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    confirmedEarnings: number;
    totalConversions: number;
  };
  config: { level1Rate: number; level2Rate: number; minWithdrawAmount: number };
  recentCommissions: Commission[];
}

export default function ReferralClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/distribution');
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [user, isLoading, load]);

  const createLink = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/distribution/links', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Your referral link is ready');
        await load();
      } else {
        toast.error(json.error || 'Failed to create link');
      }
    } finally {
      setCreating(false);
    }
  };

  // Share URL: prefer the current public origin (works behind any domain)
  const shareUrl =
    data?.affiliateLink
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${data.affiliateLink.code}`
      : '';

  const copyLink = async () => {
    if (!data?.affiliateLink) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Referral link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — select and copy manually');
    }
  };

  const withdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch('/api/distribution/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data.message);
        setWithdrawAmount('');
      } else {
        toast.error(json.error || 'Withdrawal failed');
      }
    } finally {
      setWithdrawing(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cinnabar" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <Gift className="mb-6 h-12 w-12 text-cinnabar" strokeWidth={1} />
        <h1 className="font-serif text-3xl font-light tracking-widest text-ink">
          Referral Hub
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke">
          Share FuBao with friends and earn commission on every order they place.
          Sign in to get your personal referral link.
        </p>
        <Button
          asChild
          className="mt-8 bg-cinnabar text-white hover:bg-cinnabar/90"
        >
          <Link href="/login?redirect=/referral">Sign in to continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-light tracking-widest text-ink">
          Referral Hub
        </h1>
        <p className="mt-3 text-sm text-smoke">
          Earn {(data?.config.level1Rate ?? 0.1) * 100}% of every order placed through your link
        </p>
      </header>

      {/* Link card */}
      <section className="mb-10 rounded-lg border border-gold/40 bg-jade/60 p-6">
        {data?.affiliateLink ? (
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-smoke">
              <Link2 className="h-4 w-4" />
              Your referral link
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                readOnly
                value={shareUrl}
                className="flex-1 border-gold/40 bg-white/60 font-mono text-xs"
              />
              <Button
                onClick={copyLink}
                variant="outline"
                className="border-cinnabar/50 text-cinnabar hover:bg-cinnabar/10"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-smoke">
              You haven&apos;t activated your referral link yet.
            </p>
            <Button
              onClick={createLink}
              disabled={creating}
              className="bg-cinnabar text-white hover:bg-cinnabar/90"
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              Activate referral link
            </Button>
          </div>
        )}
      </section>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: MousePointerClick, label: 'Clicks', value: data?.affiliateLink?.totalClicks ?? 0 },
          { icon: Users, label: 'Referrals', value: data?.stats.totalConversions ?? 0 },
          { icon: DollarSign, label: 'Pending', value: `$${(data?.stats.pendingEarnings ?? 0).toFixed(2)}` },
          { icon: Gift, label: 'Total earned', value: `$${(data?.stats.totalEarnings ?? 0).toFixed(2)}` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gold/30 bg-paper p-5 text-center"
          >
            <s.icon className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.5} />
            <div className="font-serif text-2xl text-ink">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.15em] text-smoke">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Withdraw */}
      {data && data.stats.confirmedEarnings > 0 && (
        <section className="mb-10 rounded-lg border border-gold/30 p-6">
          <h2 className="mb-1 font-serif text-xl text-ink">Withdraw earnings</h2>
          <p className="mb-4 text-xs text-smoke">
            Confirmed balance: ${data.stats.confirmedEarnings.toFixed(2)} · Minimum $
            {data.config.minWithdrawAmount}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="number"
              min={data.config.minWithdrawAmount}
              step="0.01"
              placeholder={`Amount (min $${data.config.minWithdrawAmount})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={withdraw}
              disabled={withdrawing}
              className="bg-cinnabar text-white hover:bg-cinnabar/90"
            >
              {withdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Request withdrawal
            </Button>
          </div>
        </section>
      )}

      {/* Commission history */}
      <section>
        <h2 className="mb-4 font-serif text-xl text-ink">Commission history</h2>
        {data && data.recentCommissions.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gold/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/30 bg-jade/50 text-left text-xs uppercase tracking-[0.15em] text-smoke">
                  <th className="px-4 py-3 font-normal">Order</th>
                  <th className="px-4 py-3 font-normal">Amount</th>
                  <th className="px-4 py-3 font-normal">Commission</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCommissions.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gold/20 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-smoke">
                      {c.orderId}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      ${c.orderAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-medium text-cinnabar">
                      +${c.commissionAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs uppercase tracking-wider ${
                          c.status === 'confirmed'
                            ? 'text-gold'
                            : 'text-smoke'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gold/40 p-8 text-center text-sm text-smoke">
            No commissions yet. Share your link — when a referred friend places an order, your
            commission appears here.
          </p>
        )}
      </section>
    </div>
  );
}

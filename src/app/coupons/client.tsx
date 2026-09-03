'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Copy, Loader2, Tag, Ticket } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategories?: string[];
  isActive: boolean;
}

interface MyCoupon extends Coupon {
  claimedAt: string;
  used: boolean;
}

function describeCoupon(c: Coupon): string {
  if (c.type === 'percentage') return `${c.value}% OFF`;
  if (c.type === 'fixed') return `$${c.value} OFF`;
  return 'FREE SHIPPING';
}

function termsLine(c: Coupon): string[] {
  const terms: string[] = [];
  if (c.minOrderAmount) terms.push(`Min. order $${c.minOrderAmount}`);
  if (c.type === 'percentage' && c.maxDiscount)
    terms.push(`Up to $${c.maxDiscount} off`);
  if (c.applicableCategories?.length)
    terms.push(`${c.applicableCategories.join(', ')} only`);
  terms.push(`Expires ${new Date(c.validUntil).toLocaleDateString()}`);
  return terms;
}

export default function CouponsClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [available, setAvailable] = useState<Coupon[]>([]);
  const [mine, setMine] = useState<MyCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (res.ok && json.success) {
        setAvailable(json.data.available ?? []);
        setMine(json.data.mine ?? []);
      }
    } catch {
      // keep last known state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  const claim = async (code: string) => {
    if (!user) {
      router.push('/login?redirect=/coupons');
      return;
    }
    setClaiming(code);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Failed to claim');
        return;
      }
      toast.success(`${code} claimed — apply it in your cart`);
      await refresh();
    } catch {
      toast.error('Network error, please retry');
    } finally {
      setClaiming(null);
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

  const myCodes = new Set(mine.map((c) => c.code));

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-smoke" />
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-14">
      {/* My coupons */}
      {user && (
        <section>
          <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl font-light text-ink">
            <Ticket className="h-5 w-5 text-gold" />
            My Coupons
          </h2>
          {mine.length === 0 ? (
            <p className="rounded-lg border border-gold/20 bg-jade/40 px-6 py-8 text-center text-sm text-smoke">
              No coupons claimed yet — pick one below.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {mine.map((c) => (
                <div
                  key={c.code}
                  className={`relative overflow-hidden rounded-lg border border-gold/30 bg-jade/60 p-5 ${
                    c.used ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium tracking-wider text-ink">
                        {c.code}
                      </p>
                      <p className="mt-1 font-serif text-2xl font-light text-cinnabar">
                        {describeCoupon(c)}
                      </p>
                    </div>
                    {c.used ? (
                      <span className="rounded-full border border-smoke/30 px-3 py-1 text-xs uppercase tracking-wider text-smoke">
                        Used
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(c.code)}
                        className="border-gold/40 text-ink hover:bg-jade"
                      >
                        {copied === c.code ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <Copy className="mr-1 h-3 w-3" />
                        )}
                        {copied === c.code ? 'Copied' : 'Copy'}
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-smoke">
                    Claimed {new Date(c.claimedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Available */}
      <section>
        <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl font-light text-ink">
          <Tag className="h-5 w-5 text-gold" />
          Available Coupons
        </h2>
        {available.length === 0 ? (
          <p className="rounded-lg border border-gold/20 bg-jade/40 px-6 py-8 text-center text-sm text-smoke">
            No active coupons right now — check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {available.map((c) => {
              const claimed = myCodes.has(c.code);
              return (
                <div
                  key={c.code}
                  className="relative overflow-hidden rounded-lg border border-gold/30 bg-paper p-5"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-cinnabar/70" />
                  <div className="flex items-start justify-between gap-3 pl-3">
                    <div>
                      <p className="font-mono text-sm font-medium tracking-wider text-ink">
                        {c.code}
                      </p>
                      <p className="mt-1 font-serif text-3xl font-light text-cinnabar">
                        {describeCoupon(c)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => claim(c.code)}
                      disabled={claimed || claiming === c.code}
                      className={
                        claimed
                          ? 'border border-gold/40 bg-jade text-smoke hover:bg-jade'
                          : 'bg-cinnabar text-paper hover:bg-cinnabar/90'
                      }
                    >
                      {claiming === c.code ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : null}
                      {claimed ? 'Claimed' : user ? 'Claim' : 'Sign in'}
                    </Button>
                  </div>
                  <ul className="mt-4 space-y-1 pl-3">
                    {termsLine(c).map((t) => (
                      <li key={t} className="text-xs text-smoke">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 pl-3 text-xs text-smoke">
                    {c.usedCount} claimed · limit {c.perUserLimit} per person
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

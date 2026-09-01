'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, MapPin, Mail, Copy, Check, Loader2, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { saveSpreeCartToken, getSpreeCartToken } from '@/lib/spree/client';

type Method = 'pickup' | 'mail';

interface Claim {
  userId: string;
  method: Method;
  createdAt: string;
  pickupCode?: string;
  cartToken?: string | null;
}

interface BlessingConfig {
  active: boolean;
  startAt: string | null;
  endAt: string | null;
  totalQuota: number;
  pickupAddress: string;
  pickupHours: string;
  note: string;
}

interface Availability {
  status: 'open' | 'inactive' | 'not_started' | 'ended' | 'full';
  message: string;
}

export function BlessingClaimFlow() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [config, setConfig] = useState<BlessingConfig | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [claimLoading, setClaimLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Method | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isLoading) return;
      try {
        const res = await fetch('/api/blessing');
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setConfig(data.config as BlessingConfig);
          setAvailability(data.availability as Availability);
          setClaim((data.claim as Claim | null) ?? null);
        }
      } catch {
        // network hiccup — leave defaults; the POST path re-checks server-side
      } finally {
        if (!cancelled) setClaimLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, isLoading]);

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Pickup code copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please note the code manually');
    }
  }, []);

  const submitClaim = useCallback(
    async (method: Method) => {
      setSubmitting(method);
      try {
        const res = await fetch('/api/blessing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, cartToken: getSpreeCartToken() }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error ?? 'Could not claim your blessing');
          if (data.availability) setAvailability(data.availability as Availability);
          return;
        }
        setClaim(data.claim as Claim);
        if (data.availability) setAvailability(data.availability as Availability);
        if (method === 'mail' && data.cartToken) {
          saveSpreeCartToken(data.cartToken as string);
          toast.success('Free blessing added to your cart — pay only shipping');
        } else if (method === 'pickup') {
          toast.success('Your blessing is reserved for pickup');
        }
      } catch {
        toast.error('Something went wrong — please try again');
      } finally {
        setSubmitting(null);
      }
    },
    []
  );

  const goToCheckout = useCallback(async () => {
    setSubmitting('mail');
    try {
      // Re-run the mail claim so the blessing is guaranteed to be in a live
      // cart even if the previous guest token expired or a cart was completed.
      const res = await fetch('/api/blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'mail', cartToken: getSpreeCartToken() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaim(data.claim as Claim);
        if (data.cartToken) saveSpreeCartToken(data.cartToken as string);
      } else {
        toast.error(data.error ?? 'Could not prepare your cart');
        return;
      }
      router.push('/checkout');
    } catch {
      toast.error('Something went wrong — please try again');
    } finally {
      setSubmitting(null);
    }
  }, [router]);

  const formatWindow = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  // Checking auth/claim state
  if (isLoading || claimLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-smoke">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking eligibility…</span>
        </div>
      </section>
    );
  }

  // Activity closed — takes precedence over the sign-in prompt (visitors
  // should see the activity is not claimable before creating an account)
  if (availability && availability.status !== 'open' && !claim) {
    const closedCopy: Record<string, { title: string }> = {
      inactive: { title: 'The Blessing Ceremony Is Paused' },
      not_started: { title: 'The Blessing Has Not Begun' },
      ended: { title: 'This Round of Blessings Has Ended' },
      full: { title: 'All Blessings in This Round Are Claimed' },
    };
    const copy = closedCopy[availability.status] ?? { title: 'Unavailable' };
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md border border-border bg-card p-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-smoke" strokeWidth={1.25} />
          <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-ink">
            {copy.title}
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-smoke">
            {availability.message}
          </p>
          {(config?.startAt || config?.endAt) && availability.status === 'not_started' && (
            <p className="mt-2 text-xs text-smoke">
              Opens {formatWindow(config?.startAt ?? null)}
            </p>
          )}
          <Link
            href="/talisman"
            className="mt-6 inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-cinnabar underline-offset-4 hover:underline"
          >
            BROWSE TALISMANS
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md border border-border bg-card p-10 text-center">
          <Gift className="mx-auto h-8 w-8 text-cinnabar" strokeWidth={1.25} />
          <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-ink">
            Sign in to receive your blessing
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-smoke">
            One free blessing per account — your talisman is prepared after you
            claim it, so we need to know it is yours.
          </p>
          <Link
            href="/login?redirect=/blessing"
            className="mt-6 inline-flex w-full items-center justify-center bg-cinnabar px-6 py-3 text-xs font-medium tracking-[0.2em] text-paper transition-colors hover:bg-cinnabar/90"
          >
            SIGN IN / REGISTER
          </Link>
        </div>
      </section>
    );
  }

  // Already claimed — pickup
  if (claim && claim.method === 'pickup') {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md border border-gold/30 bg-card p-10 text-center">
          <Check className="mx-auto h-8 w-8 text-gold" strokeWidth={1.25} />
          <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-ink">
            Your Blessing Awaits
          </h2>
          <p className="mt-2 text-xs text-smoke">
            Reserved under {user.email} — show this code at the temple gate
          </p>
          <button
            type="button"
            onClick={() => claim.pickupCode && copyCode(claim.pickupCode)}
            className="group mt-6 inline-flex items-center gap-3 border border-cinnabar/40 bg-jade/60 px-8 py-4 font-serif text-3xl font-light tracking-[0.3em] text-cinnabar transition-colors hover:bg-jade"
          >
            {claim.pickupCode}
            {copied ? (
              <Check className="h-4 w-4 text-gold" strokeWidth={1.5} />
            ) : (
              <Copy className="h-4 w-4 text-cinnabar/50 transition-colors group-hover:text-cinnabar" strokeWidth={1.5} />
            )}
          </button>
          <div className="mt-8 space-y-2 border-t border-border pt-6 text-left text-xs leading-relaxed text-smoke">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cinnabar/70" strokeWidth={1.5} />
              <span>
                {config?.pickupAddress || 'Qingyun Temple — 8 Temple Street, Yau Ma Tei, Hong Kong'}
                <br />
                {config?.pickupHours || 'Daily 9:00 – 17:00 (UTC+8)'}
              </span>
            </p>
            <p>
              Please bring your reservation code. Unclaimed blessings are
              returned to the temple after 30 days.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Already claimed — mail
  if (claim && claim.method === 'mail') {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md border border-gold/30 bg-card p-10 text-center">
          <Check className="mx-auto h-8 w-8 text-gold" strokeWidth={1.25} />
          <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-ink">
            Blessing Reserved for Delivery
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-smoke">
            Your free blessing talisman is in your cart. Complete checkout and
            pay only the shipping fee.
          </p>
          <button
            type="button"
            onClick={goToCheckout}
            disabled={submitting !== null}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-cinnabar px-6 py-3 text-xs font-medium tracking-[0.2em] text-paper transition-colors hover:bg-cinnabar/90 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            )}
            PROCEED TO CHECKOUT
          </button>
          <Link
            href="/notifications"
            className="mt-4 block text-xs text-cinnabar underline-offset-4 hover:underline"
          >
            View confirmation in notifications
          </Link>
        </div>
      </section>
    );
  }

  // Unclaimed — method choice
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center font-serif text-2xl font-light tracking-wide text-ink sm:text-3xl">
        Choose How to Receive It
      </h2>
      <p className="mt-3 text-center text-xs text-smoke">
        The talisman is free — one per account
      </p>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* On-site pickup */}
        <div className="flex flex-col border border-border bg-card p-8">
          <MapPin className="h-6 w-6 text-cinnabar" strokeWidth={1.25} />
          <h3 className="mt-4 font-serif text-xl font-light tracking-wide text-ink">
            On-Site Pickup
          </h3>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Completely Free</p>
          <p className="mt-4 flex-1 text-xs leading-relaxed text-smoke">
            Collect your talisman in person at{' '}
            {config?.pickupAddress || 'Qingyun Temple, Yau Ma Tei, Hong Kong'}. We
            will reserve it under a unique pickup code for 30 days.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-smoke">
            <li>· Hand it to you at the temple gate</li>
            <li>· No payment of any kind</li>
            <li>· {config?.pickupHours || 'Daily 9:00 – 17:00'}</li>
          </ul>
          <button
            type="button"
            onClick={() => submitClaim('pickup')}
            disabled={submitting !== null}
            className="mt-6 inline-flex items-center justify-center border border-cinnabar bg-transparent px-6 py-3 text-xs font-medium tracking-[0.2em] text-cinnabar transition-colors hover:bg-cinnabar hover:text-paper disabled:opacity-60"
          >
            {submitting === 'pickup' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'RESERVE FOR PICKUP'
            )}
          </button>
        </div>

        {/* Mail delivery */}
        <div className="flex flex-col border border-cinnabar/40 bg-card p-8">
          <Mail className="h-6 w-6 text-cinnabar" strokeWidth={1.25} />
          <h3 className="mt-4 font-serif text-xl font-light tracking-wide text-ink">
            Delivered to You
          </h3>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Pay Shipping Only</p>
          <p className="mt-4 flex-1 text-xs leading-relaxed text-smoke">
            We ship the consecrated talisman worldwide in a sealed protective
            envelope with its ceremony record. The talisman is free — you only
            cover the actual shipping cost.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-smoke">
            <li>· Standard worldwide shipping from Hong Kong</li>
            <li>· Sealed with its consecration record</li>
            <li>· Same care as paid orders</li>
          </ul>
          <button
            type="button"
            onClick={() => submitClaim('mail')}
            disabled={submitting !== null}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-cinnabar px-6 py-3 text-xs font-medium tracking-[0.2em] text-paper transition-colors hover:bg-cinnabar/90 disabled:opacity-60"
          >
            {submitting === 'mail' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                CLAIM — PAY SHIPPING ONLY
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </>
            )}
          </button>
        </div>
      </div>

      {config?.note && (
        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-smoke">
          {config.note}
        </p>
      )}
      <p className="mx-auto mt-4 max-w-md text-center text-[10px] leading-relaxed text-smoke/70">
        One free blessing per account. Offered as a cultural keepsake — for
        entertainment purposes only.
      </p>
    </section>
  );
}

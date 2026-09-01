'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Check, PackageOpen, Flame } from 'lucide-react';

interface AccountOrder {
  id: string;
  number: string;
  state: string;
  paymentState: string | null;
  itemCount: number;
  total: number;
  createdAt: string;
}

interface CheckInState {
  canCheckIn: boolean;
  streak: number;
  totalDays: number;
  lastCheckIn: string | null;
  nextReward: number;
}

// Mirrors the server-side check-in cycle (points per day in a week cycle)
const CHECKIN_REWARDS = [5, 5, 10, 10, 15, 15, 30];

// Mirrors server-side level thresholds (user-store.ts addPoints)
const LEVELS: { name: string; points: number }[] = [
  { name: 'Bronze', points: 0 },
  { name: 'Silver', points: 500 },
  { name: 'Gold', points: 2000 },
  { name: 'Platinum', points: 5000 },
];

const stateColors: Record<string, string> = {
  complete: 'text-emerald-600',
  paid: 'text-emerald-600',
  cart: 'text-muted-foreground',
  address: 'text-muted-foreground',
  delivery: 'text-muted-foreground',
  payment: 'text-muted-foreground',
  confirm: 'text-muted-foreground',
  canceled: 'text-destructive',
};

export function AccountPageClient() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkIn, setCheckIn] = useState<CheckInState | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);

  const currentLevel = user
    ? [...LEVELS].reverse().find((l) => user.points >= l.points) ?? LEVELS[0]
    : LEVELS[0];
  const nextLevel = user ? LEVELS.find((l) => l.points > user.points) : undefined;
  const levelProgress =
    user && nextLevel
      ? (user.points - currentLevel.points) / (nextLevel.points - currentLevel.points)
      : 1;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/v2/storefront/account/orders', {
      headers: { Accept: 'application/vnd.api+json' },
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json: { data?: Array<{ id: string; attributes?: Record<string, unknown> }> }) => {
        if (cancelled) return;
        const list = (json.data ?? []).map((o) => {
          const a = o.attributes ?? {};
          return {
            id: o.id,
            number: String(a.number ?? o.id),
            state: String(a.state ?? ''),
            paymentState: (a.payment_state as string | null) ?? null,
            itemCount: Number(a.item_count ?? 0),
            total: Number.parseFloat(String(a.total ?? '0')) || 0,
            createdAt: String(a.created_at ?? ''),
          };
        });
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/user/checkin')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: CheckInState } | null) => {
        if (cancelled) return;
        if (json?.data) setCheckIn(json.data);
      })
      .catch(() => {
        /* check-in state unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const doCheckIn = async () => {
    if (!user || checkingIn || checkIn?.canCheckIn === false) return;
    setCheckingIn(true);
    setCheckInMsg(null);
    try {
      const res = await fetch('/api/user/checkin', { method: 'POST' });
      const json = (await res.json()) as {
        success: boolean;
        data?: { streak: number; pointsEarned: number; message: string };
        error?: string;
      };
      if (res.ok && json.success && json.data) {
        setCheckInMsg(json.data.message);
        void refreshUser();
        const status = await fetch('/api/user/checkin');
        const statusJson = (await status.json()) as { success: boolean; data?: CheckInState };
        if (statusJson.success && statusJson.data) setCheckIn(statusJson.data);
      } else {
        setCheckInMsg(json.error ?? 'Check-in failed');
      }
    } catch {
      setCheckInMsg('Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const copyReferral = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const levelColors: Record<string, string> = {
    bronze: 'bg-amber-700/10 text-amber-700',
    silver: 'bg-gray-400/10 text-gray-500',
    gold: 'bg-yellow-500/10 text-yellow-600',
    platinum: 'bg-purple-500/10 text-purple-600',
  };

  const completedOrders = orders?.filter((o) => o.state === 'complete') ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-foreground mb-8">My Account</h1>

      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="font-serif text-xl text-foreground mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-foreground">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${levelColors[user.level] || levelColors.bronze}`}>
            {user.level.charAt(0).toUpperCase() + user.level.slice(1)} Member
          </div>
          <div className="text-3xl font-bold text-foreground mt-2">{user.points}</div>
          <div className="text-sm text-muted-foreground">Points</div>
          {nextLevel && (
            <div className="mt-4">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round(levelProgress * 100))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {nextLevel.points - user.points} more points to {nextLevel.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-foreground mb-1">Daily Check-in</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              {checkIn !== null && (
                <Flame className={`h-4 w-4 ${checkIn.streak > 0 ? 'text-primary' : 'text-muted-foreground/40'}`} />
              )}
              <span>
                {checkIn === null
                  ? 'Loading check-in status...'
                  : `Current streak: ${checkIn.streak} day${checkIn.streak === 1 ? '' : 's'} · Next reward: +${checkIn.nextReward} points`}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              type="button"
              onClick={doCheckIn}
              disabled={checkingIn || checkIn === null || checkIn.canCheckIn === false}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingIn ? 'Checking in...' : checkIn?.canCheckIn === false ? 'Checked in today' : 'Check in'}
            </button>
            {checkInMsg && <p className="text-xs text-muted-foreground">{checkInMsg}</p>}
          </div>
        </div>
        {checkIn !== null && (
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">7-Day Rewards</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CHECKIN_REWARDS.map((r, i) => {
                // Days already claimed in the current week cycle:
                // - can check in now: previous cycle days (streak % 7; 7 means full week -> new cycle)
                // - already checked in today: includes today ((streak - 1) % 7) + 1
                const done = checkIn.canCheckIn ? checkIn.streak % 7 : ((checkIn.streak - 1) % 7) + 1;
                const isNext = checkIn.canCheckIn && i === done % 7;
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 w-12 h-14 rounded-md border flex flex-col items-center justify-center text-xs ${
                      i < done
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : isNext
                          ? 'border-primary bg-background text-foreground ring-1 ring-primary/30'
                          : 'bg-muted/50 border-border text-muted-foreground'
                    }`}
                  >
                    <span className="font-semibold">+{r}</span>
                    <span className="text-[10px]">Day {i + 1}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Total check-ins: {checkIn.totalDays} day{checkIn.totalDays === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{orders === null ? '—' : orders.length}</div>
          <div className="text-sm text-muted-foreground">Orders</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">${user.walletBalance.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Wallet</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground text-accent">{user.referralCode}</div>
          <div className="text-sm text-muted-foreground">Referral Code</div>
        </div>
      </div>

      {/* Order History */}
      <div id="orders" className="bg-card border border-border rounded-lg p-6 mb-8 scroll-mt-24">
        <h2 className="font-serif text-xl text-foreground mb-4">Order History</h2>
        {orders === null ? (
          <p className="text-sm text-muted-foreground py-4">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <PackageOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <Link href="/talisman" className="mt-3 inline-flex text-sm text-accent underline underline-offset-4">
              Browse talismans
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.slice(0, 8).map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.number}`}
                className="flex items-center justify-between py-3 group"
              >
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {o.number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    {' · '}{o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs uppercase tracking-wide ${stateColors[o.state] ?? 'text-muted-foreground'}`}>
                    {o.state}
                  </span>
                  <span className="text-sm text-foreground">${o.total.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {completedOrders !== null && completedOrders.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            {completedOrders.length} completed {completedOrders.length === 1 ? 'order' : 'orders'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-serif text-xl text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="#orders"
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium">Orders</span>
            <span className="text-xs text-muted-foreground">View order history</span>
          </a>
          <Link
            href="/referral"
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium">Referral Hub</span>
            <span className="text-xs text-muted-foreground">Link, clicks & commissions</span>
          </Link>
          <Link
            href="/talisman"
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium">Favorites</span>
            <span className="text-xs text-muted-foreground">Browse talismans</span>
          </Link>
          <Link
            href="/ai-chat"
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium">AI Assistant</span>
            <span className="text-xs text-muted-foreground">Talisman guidance</span>
          </Link>
          <Link
            href="/giveaways"
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium">Giveaways</span>
            <span className="text-xs text-muted-foreground">Claim seasonal prizes</span>
          </Link>
          <button
            onClick={copyReferral}
            className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
          >
            <span className="block font-medium flex items-center gap-1.5">
              Referrals
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </span>
            <span className="text-xs text-muted-foreground">
              {copied ? 'Code copied!' : 'Copy referral code'}
            </span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8 text-center">
        <button
          onClick={async () => { await logout(); router.push('/'); }}
          className="px-6 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquareQuote,
  RefreshCw,
  Star,
  Trash2,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants' },
  { label: 'Wishes', href: '/admin/wishes', active: true },
];

interface WishView {
  id: string;
  orderId?: string;
  userName: string;
  productName: string;
  content: string;
  mediaType: 'text' | 'image' | 'video';
  rating: number;
  createdAt: string;
  approved: boolean;
}

interface WishesData {
  wishes: WishView[];
  stats: { total: number; approved: number; pending: number };
}

export function AdminWishesClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<WishesData | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/wishes');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const body = await res.json();
      setData(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishes');
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login?redirect=/admin/wishes');
      return;
    }
    if (user.role !== 'admin') {
      setError('Admin access required.');
      return;
    }
    load();
  }, [isLoading, user, router, load]);

  const setApproval = async (wish: WishView, approved: boolean) => {
    setWorking(wish.id);
    try {
      const res = await fetch('/api/admin/wishes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wish.id, approved }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to update wish');
      toast.success(approved ? 'Wish approved and published.' : 'Wish unpublished.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update wish');
    } finally {
      setWorking('');
    }
  };

  const removeWish = async (wish: WishView) => {
    if (!window.confirm(`Delete the wish from "${wish.userName}"? This cannot be undone.`)) return;
    setWorking(wish.id);
    try {
      const res = await fetch(`/api/admin/wishes?id=${encodeURIComponent(wish.id)}`, {
        method: 'DELETE',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to delete wish');
      toast.success('Wish deleted.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete wish');
    } finally {
      setWorking('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading moderation console…
        </div>
      </div>
    );
  }

  const wishes = data?.wishes ?? [];
  const visible = wishes.filter((w) =>
    filter === 'all' ? true : filter === 'pending' ? !w.approved : w.approved
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Admin nav */}
        <nav className="mb-8 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                item.active
                  ? 'border-[var(--cinnabar)] bg-[var(--cinnabar)] text-white'
                  : 'border-border text-muted-foreground hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground flex items-center gap-3">
              <MessageSquareQuote className="h-7 w-7 text-[var(--cinnabar)]" />
              Wish Moderation
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review customer wishes before they appear on the public wall.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        ) : null}

        {/* Stats */}
        {data ? (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-semibold text-foreground">{data.stats.total}</div>
              <div className="text-xs text-muted-foreground">Total wishes</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                <Clock className="h-5 w-5 text-[var(--gold)]" />
                {data.stats.pending}
              </div>
              <div className="text-xs text-muted-foreground">Pending review</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {data.stats.approved}
              </div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
          </div>
        ) : null}

        {/* Filter pills */}
        <div className="mb-4 flex gap-2">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                filter === f
                  ? 'border-[var(--cinnabar)] bg-[var(--cinnabar)] text-white'
                  : 'border-border text-muted-foreground hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Wish list */}
        <div className="space-y-4">
          {visible.map((wish) => (
            <div
              key={wish.id}
              className={`rounded-lg border bg-card p-5 ${
                wish.approved ? 'border-border' : 'border-[var(--gold)]/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{wish.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      on {wish.productName}
                    </span>
                    {wish.orderId ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {wish.orderId}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: wish.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                      ))}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        wish.approved
                          ? 'bg-green-600/10 text-green-700'
                          : 'bg-[var(--gold)]/15 text-[var(--gold)]'
                      }`}
                    >
                      {wish.approved ? 'Published' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    “{wish.content}”
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(wish.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {wish.approved ? (
                    <button
                      onClick={() => setApproval(wish, false)}
                      disabled={working === wish.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => setApproval(wish, true)}
                      disabled={working === wish.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--cinnabar)] px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve & Publish
                    </button>
                  )}
                  <button
                    onClick={() => removeWish(wish)}
                    disabled={working === wish.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visible.length === 0 && !error ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-12 text-center">
              <Heart className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {filter === 'pending'
                  ? 'No wishes waiting for review.'
                  : filter === 'approved'
                    ? 'No published wishes yet.'
                    : 'No wishes submitted yet.'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

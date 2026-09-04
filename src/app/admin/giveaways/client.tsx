'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Gift, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways', active: true },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants' },
  { label: 'Wishes', href: '/admin/wishes' },
  { label: 'Newsletter', href: '/admin/newsletter' },
];

interface WinnerView {
  id: string;
  userId: string;
  userName: string;
  claimedAt: string;
  prizeFulfilled?: boolean;
}

interface GiveawayView {
  id: string;
  title: string;
  description: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  totalPrizes: number;
  claimedCount: number;
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  winners: WinnerView[];
  createdAt: string;
}

interface GiveawaysData {
  giveaways: GiveawayView[];
  stats: { total: number; active: number; totalPrizes: number; claimed: number; fulfilled: number };
}

const toLocalInput = (iso: string) => iso.slice(0, 16);
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const plusDaysLocal = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyForm = {
  title: '',
  description: '',
  productName: '',
  productSlug: '',
  totalPrizes: '10',
  status: 'active' as GiveawayView['status'],
  startDate: nowLocal(),
  endDate: plusDaysLocal(14),
};

export function AdminGiveawaysClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<GiveawaysData | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [working, setWorking] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/giveaways');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load giveaways');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const createGiveaway = async () => {
    setWorking('create');
    try {
      const res = await fetch('/api/admin/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          productName: createForm.productName.trim(),
          productSlug: createForm.productSlug.trim().toLowerCase(),
          totalPrizes: Number(createForm.totalPrizes),
          status: createForm.status,
          startDate: new Date(createForm.startDate).toISOString(),
          endDate: new Date(createForm.endDate).toISOString(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Create failed');
      toast.success(body.message ?? 'Giveaway created');
      setCreateForm(emptyForm);
      setCreating(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setWorking('');
    }
  };

  const setStatus = async (g: GiveawayView, status: GiveawayView['status']) => {
    setWorking(g.id);
    try {
      const res = await fetch('/api/admin/giveaways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: g.id, updates: { status } }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      toast.success(body.message ?? 'Giveaway updated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const fulfillWinner = async (g: GiveawayView, w: WinnerView) => {
    setWorking(w.id);
    try {
      const res = await fetch('/api/admin/giveaways', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: g.id, winnerId: w.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Fulfill failed');
      toast.success(body.message ?? 'Prize marked fulfilled');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Fulfill failed');
    } finally {
      setWorking('');
    }
  };

  const deleteGiveaway = async (g: GiveawayView) => {
    if (!window.confirm(`Delete giveaway "${g.title}" and all its winners?`)) return;
    setWorking(g.id);
    try {
      const res = await fetch(`/api/admin/giveaways?id=${encodeURIComponent(g.id)}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Delete failed');
      toast.success(body.message ?? 'Giveaway deleted');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setWorking('');
    }
  };

  if (isLoading || (!data && !error)) {
    return <p className="text-muted-foreground py-12 text-center">Loading giveaways…</p>;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="w-8 h-8 text-cinnabar" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-foreground">Giveaway Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setCreating(!creating)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Giveaway
          </button>
        </div>
      </div>

      <nav className="flex gap-4 mb-8 border-b border-border pb-4 overflow-x-auto">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`text-sm whitespace-nowrap px-3 py-1 rounded-md ${
              item.active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Campaigns', value: data?.stats.total },
          { label: 'Active Now', value: data?.stats.active },
          { label: 'Total Prizes', value: data?.stats.totalPrizes },
          { label: 'Claimed', value: data?.stats.claimed },
          { label: 'Fulfilled', value: data?.stats.fulfilled },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4">Create Giveaway</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Title</label>
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="Lunar New Year Amulet Giveaway"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Prize Product Name</label>
              <input
                value={createForm.productName}
                onChange={(e) => setCreateForm({ ...createForm, productName: e.target.value })}
                placeholder="Jade Pendant"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Prize Product Slug</label>
              <input
                value={createForm.productSlug}
                onChange={(e) => setCreateForm({ ...createForm, productSlug: e.target.value })}
                placeholder="jade-pendant"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Total Prizes</label>
              <input
                type="number"
                min="1"
                value={createForm.totalPrizes}
                onChange={(e) => setCreateForm({ ...createForm, totalPrizes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as GiveawayView['status'] })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Start</label>
              <input
                type="datetime-local"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">End</label>
              <input
                type="datetime-local"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Description</label>
              <input
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="One entry per account — cultural keepsake, for entertainment purposes only"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              disabled={working === 'create' || !createForm.title || !createForm.productSlug || !createForm.productName}
              onClick={() => void createGiveaway()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data?.giveaways.map((g) => {
          const pct = g.totalPrizes > 0 ? Math.round((g.claimedCount / g.totalPrizes) * 100) : 0;
          return (
            <div key={g.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <Gift className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <div className="text-foreground font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.productName} · {new Date(g.startDate).toLocaleDateString()} →{' '}
                      {new Date(g.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.status === 'active' ? (
                    <button
                      disabled={working === g.id}
                      onClick={() => void setStatus(g, 'ended')}
                      className="px-3 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      End Campaign
                    </button>
                  ) : (
                    <button
                      disabled={working === g.id || g.claimedCount >= g.totalPrizes}
                      onClick={() => void setStatus(g, 'active')}
                      className="px-3 py-1 text-xs border border-emerald-700/40 text-emerald-700 rounded-md hover:bg-emerald-600/10 disabled:opacity-50 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    disabled={working === g.id}
                    onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                    className="px-3 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    {g.winners.length} Winners
                  </button>
                  <button
                    disabled={working === g.id}
                    onClick={() => void deleteGiveaway(g)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-cinnabar/40 text-cinnabar rounded-md hover:bg-cinnabar/10 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${g.status === 'ended' ? 'bg-gold' : 'bg-cinnabar'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {g.claimedCount}/{g.totalPrizes} claimed
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      g.status === 'active'
                        ? 'bg-emerald-600/10 text-emerald-700'
                        : g.status === 'upcoming'
                          ? 'bg-gold/15 text-gold'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
              </div>
              {expanded === g.id && (
                <div className="border-t border-border bg-muted/20 p-4">
                  {g.winners.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No winners yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Winner</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Claimed At</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Prize</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.winners.map((w) => (
                          <tr key={w.id} className="border-t border-border/50">
                            <td className="py-2 px-3 text-foreground">{w.userName}</td>
                            <td className="py-2 px-3 text-muted-foreground text-xs">
                              {new Date(w.claimedAt).toLocaleString()}
                            </td>
                            <td className="py-2 px-3">
                              {w.prizeFulfilled ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                                </span>
                              ) : (
                                <span className="text-xs text-gold">Pending</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {!w.prizeFulfilled && (
                                <button
                                  disabled={working === w.id}
                                  onClick={() => void fulfillWinner(g, w)}
                                  className="px-3 py-1 text-xs border border-border rounded-md hover:bg-background disabled:opacity-50 transition-colors"
                                >
                                  Mark Fulfilled
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Active campaigns appear on /giveaways with one claim per account; claims fire a notification to the winner.
      </p>
    </div>
  );
}

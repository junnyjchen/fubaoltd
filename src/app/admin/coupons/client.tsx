'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { AlertCircle, Plus, RefreshCw, Save, Tag, Trash2, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons', active: true },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants' },
];

interface AdminCouponView {
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
  isActive: boolean;
  createdAt: string;
}

interface CouponsData {
  coupons: AdminCouponView[];
  stats: { total: number; active: number; expired: number; disabled: number };
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
  code: '',
  type: 'percentage' as AdminCouponView['type'],
  value: '10',
  minOrderAmount: '0',
  usageLimit: '100',
  perUserLimit: '1',
  validFrom: nowLocal(),
  validUntil: plusDaysLocal(30),
};

export function AdminCouponsClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<CouponsData | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [working, setWorking] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load coupons');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const createCoupon = async () => {
    setWorking('create');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: createForm.code.toUpperCase().trim(),
          type: createForm.type,
          value: Number(createForm.value),
          minOrderAmount: createForm.minOrderAmount ? Number(createForm.minOrderAmount) : undefined,
          usageLimit: createForm.usageLimit ? Number(createForm.usageLimit) : undefined,
          perUserLimit: createForm.perUserLimit ? Number(createForm.perUserLimit) : undefined,
          validFrom: new Date(createForm.validFrom).toISOString(),
          validUntil: new Date(createForm.validUntil).toISOString(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Create failed');
      toast.success(body.message ?? 'Coupon created');
      setCreateForm(emptyForm);
      setCreating(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setWorking('');
    }
  };

  const toggleActive = async (c: AdminCouponView) => {
    setWorking(c.code);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c.code, updates: { isActive: !c.isActive } }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      toast.success(body.message ?? 'Coupon updated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const deleteCoupon = async (c: AdminCouponView) => {
    if (!window.confirm(`Delete coupon "${c.code}" permanently?`)) return;
    setWorking(c.code);
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(c.code)}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Delete failed');
      toast.success(body.message ?? 'Coupon deleted');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setWorking('');
    }
  };

  if (isLoading || (!data && !error)) {
    return <p className="text-muted-foreground py-12 text-center">Loading coupons…</p>;
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
        <h1 className="font-serif text-3xl text-foreground">Coupon Management</h1>
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
            <Plus className="w-4 h-4" /> New Coupon
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Coupons', value: data?.stats.total },
          { label: 'Active Now', value: data?.stats.active },
          { label: 'Expired', value: data?.stats.expired },
          { label: 'Disabled', value: data?.stats.disabled },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4">Create Coupon</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Code</label>
              <input
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                placeholder="SPRING25"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Type</label>
              <select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as AdminCouponView['type'] })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                {createForm.type === 'percentage'
                  ? 'Percent Off (%)'
                  : createForm.type === 'fixed'
                    ? 'Amount Off ($)'
                    : 'Value'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={createForm.value}
                onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Min Order ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={createForm.minOrderAmount}
                onChange={(e) => setCreateForm({ ...createForm, minOrderAmount: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Valid From</label>
              <input
                type="datetime-local"
                value={createForm.validFrom}
                onChange={(e) => setCreateForm({ ...createForm, validFrom: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Valid Until</label>
              <input
                type="datetime-local"
                value={createForm.validUntil}
                onChange={(e) => setCreateForm({ ...createForm, validUntil: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Usage Limit (total)</label>
              <input
                type="number"
                min="1"
                value={createForm.usageLimit}
                onChange={(e) => setCreateForm({ ...createForm, usageLimit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Per-User Limit</label>
              <input
                type="number"
                min="1"
                value={createForm.perUserLimit}
                onChange={(e) => setCreateForm({ ...createForm, perUserLimit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              disabled={working === 'create' || !createForm.code || !createForm.value}
              onClick={() => void createCoupon()}
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

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Code</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Discount</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Min Order</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Validity</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Usage</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.coupons.map((c) => {
              const now = new Date().toISOString();
              const expired = c.validUntil <= now;
              const exhausted = c.usedCount >= c.usageLimit;
              return (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2 text-foreground font-mono font-medium">
                      <Tag className="w-4 h-4 text-gold" /> {c.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {c.type === 'percentage'
                      ? `${c.value}% off`
                      : c.type === 'fixed'
                        ? `$${c.value.toFixed(2)} off`
                        : 'Free shipping'}
                    {c.maxDiscount !== undefined && c.type === 'percentage' && (
                      <span className="block text-xs text-muted-foreground">max ${c.maxDiscount.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {c.minOrderAmount ? `$${c.minOrderAmount.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(c.validFrom).toLocaleDateString()} → {new Date(c.validUntil).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {c.usedCount} / {c.usageLimit}
                    <span className="block text-xs">per-user: {c.perUserLimit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        !c.isActive
                          ? 'bg-muted text-muted-foreground'
                          : expired
                            ? 'bg-gold/15 text-gold'
                            : exhausted
                              ? 'bg-gold/15 text-gold'
                              : 'bg-emerald-600/10 text-emerald-700'
                      }`}
                    >
                      {!c.isActive ? 'Disabled' : expired ? 'Expired' : exhausted ? 'Exhausted' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex gap-2">
                      <button
                        disabled={working === c.code}
                        onClick={() => void toggleActive(c)}
                        className="px-3 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        disabled={working === c.code}
                        onClick={() => void deleteCoupon(c)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-cinnabar/40 text-cinnabar rounded-md hover:bg-cinnabar/10 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Coupons apply at cart checkout via the Spree promo engine — every cart mutation revalidates codes against the
        new item total.
      </p>
    </div>
  );
}

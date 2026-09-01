'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import {
  Gift, MapPin, Clock, Users, CheckCircle2, Trash2, RefreshCw, Save,
  Package, AlertCircle,
} from 'lucide-react';

interface BlessingConfig {
  active: boolean;
  startAt: string | null;
  endAt: string | null;
  totalQuota: number;
  pickupAddress: string;
  pickupHours: string;
  note: string;
}

interface BlessingClaimView {
  claimId: string;
  userId: string;
  method: 'pickup' | 'mail';
  pickupCode?: string;
  cartToken?: string;
  status: 'claimed' | 'fulfilled';
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  orderNumber: string | null;
  orderState: string | null;
}

interface BlessingStats {
  totalClaims: number;
  pickupClaims: number;
  mailClaims: number;
  fulfilled: number;
  quota: number;
  quotaUsed: number;
}

interface AdminBlessingData {
  config: BlessingConfig;
  claims: BlessingClaimView[];
  stats: BlessingStats;
  availability: { status: string; message: string };
  product: { name: string; slug: string; price: string | number; imageKey: string; description: string };
}

/** datetime-local value <-> ISO string (empty string = null) */
function isoToLocal(iso: string | null): string {
  return iso ? iso.slice(0, 16) : '';
}
function localToIso(local: string): string {
  return local ? new Date(local).toISOString() : '';
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  inactive: 'Paused',
  not_started: 'Not Started',
  ended: 'Ended',
  full: 'Quota Full',
};

export function AdminBlessingClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<AdminBlessingData | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState('');

  // form state (mirrors config once loaded)
  const [form, setForm] = useState({
    active: true,
    startAt: '',
    endAt: '',
    totalQuota: 0,
    pickupAddress: '',
    pickupHours: '',
    note: '',
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blessing');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body);
      setForm({
        active: body.config.active,
        startAt: isoToLocal(body.config.startAt),
        endAt: isoToLocal(body.config.endAt),
        totalQuota: body.config.totalQuota,
        pickupAddress: body.config.pickupAddress,
        pickupHours: body.config.pickupHours,
        note: body.config.note,
      });
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blessing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: form.active,
          startAt: localToIso(form.startAt),
          endAt: localToIso(form.endAt),
          totalQuota: form.totalQuota,
          pickupAddress: form.pickupAddress,
          pickupHours: form.pickupHours,
          note: form.note,
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      toast.success('Blessing activity settings saved');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const markFulfilled = async (claimId: string) => {
    setWorking(claimId);
    try {
      const res = await fetch('/api/admin/blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', claimId }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      toast.success('Claim marked as fulfilled');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const deleteClaim = async (claimId: string) => {
    setWorking(claimId);
    try {
      const res = await fetch(`/api/admin/blessing?claimId=${encodeURIComponent(claimId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      toast.success('Claim deleted — the account can claim again');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setWorking('');
    }
  };

  if (isLoading || (!data && !error)) {
    return <p className="text-smoke py-12 text-center">Loading blessing activity…</p>;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="w-8 h-8 text-cinnabar" />
        <p className="text-smoke">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const statusLabel = STATUS_LABELS[data.availability.status] ?? data.availability.status;

  return (
    <div className="space-y-10">
      {/* Activity status + stats */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="font-serif text-xl text-ink">Activity Overview</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs tracking-wide uppercase ${
              data.availability.status === 'open'
                ? 'bg-jade text-ink'
                : 'bg-cinnabar/10 text-cinnabar'
            }`}
          >
            {statusLabel}
          </span>
          {data.availability.message && (
            <span className="text-xs text-smoke">{data.availability.message}</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Gift, label: 'Total Claims', value: data.stats.totalClaims },
            { icon: MapPin, label: 'Pickup', value: data.stats.pickupClaims },
            { icon: Package, label: 'Mail', value: data.stats.mailClaims },
            { icon: CheckCircle2, label: 'Fulfilled', value: data.stats.fulfilled },
            {
              icon: Users,
              label: 'Quota',
              value: data.stats.quota > 0 ? `${data.stats.quotaUsed} / ${data.stats.quota}` : 'Unlimited',
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-jade/60 border border-gold/30 rounded-md p-3">
              <Icon className="w-4 h-4 text-gold mb-1.5" />
              <div className="text-lg font-semibold text-ink">{value}</div>
              <div className="text-xs text-smoke">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product card */}
      <section className="bg-jade/60 border border-gold/30 rounded-md p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-paper border border-gold/40 flex items-center justify-center shrink-0">
          <span className="font-serif text-cinnabar text-lg">福</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-ink">{data.product.name}</div>
          <div className="text-xs text-smoke truncate">{data.product.description}</div>
        </div>
        <a
          href={`/talisman/${data.product.slug}`}
          className="text-xs text-cinnabar underline underline-offset-4 whitespace-nowrap"
        >
          View product →
        </a>
      </section>

      {/* Settings form */}
      <section>
        <h2 className="font-serif text-xl text-ink mb-4">Activity Settings</h2>
        <div className="bg-jade/60 border border-gold/30 rounded-md p-5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 accent-cinnabar"
            />
            <span className="text-sm text-ink">
              Activity active
              <span className="text-smoke"> — uncheck to pause claims without changing the schedule</span>
            </span>
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide">Starts at</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={e => setForm({ ...form, startAt: e.target.value })}
                className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide">Ends at</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={e => setForm({ ...form, endAt: e.target.value })}
                className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide">
                Total quota (0 = unlimited)
              </label>
              <input
                type="number"
                min={0}
                value={form.totalQuota}
                onChange={e => setForm({ ...form, totalQuota: Number(e.target.value) })}
                className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pickup hours
              </label>
              <input
                type="text"
                value={form.pickupHours}
                onChange={e => setForm({ ...form, pickupHours: e.target.value })}
                className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Pickup address
            </label>
            <input
              type="text"
              value={form.pickupAddress}
              onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
              className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs text-smoke mb-1.5 uppercase tracking-wide">Note for guests</label>
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-ink resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-cinnabar text-paper text-sm tracking-wide px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 text-sm text-smoke hover:text-ink transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
          </div>
        </div>
      </section>

      {/* Claims table */}
      <section>
        <h2 className="font-serif text-xl text-ink mb-4">
          Claims
          <span className="ml-2 text-sm text-smoke font-sans">({data.claims.length})</span>
        </h2>
        {data.claims.length === 0 ? (
          <p className="text-sm text-smoke py-8 text-center border border-dashed border-border rounded-md">
            No claims yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-jade/70 text-left text-xs uppercase tracking-wide text-smoke">
                  <th className="px-4 py-2.5 font-normal">Guest</th>
                  <th className="px-4 py-2.5 font-normal">Method</th>
                  <th className="px-4 py-2.5 font-normal">Code / Order</th>
                  <th className="px-4 py-2.5 font-normal">Status</th>
                  <th className="px-4 py-2.5 font-normal">Claimed at</th>
                  <th className="px-4 py-2.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.claims.map(claim => (
                  <tr key={claim.claimId} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <div className="text-ink">{claim.userName ?? '—'}</div>
                      <div className="text-xs text-smoke">{claim.userEmail ?? claim.userId}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      {claim.method === 'pickup' ? 'On-site Pickup' : 'Mail (shipping paid)'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {claim.pickupCode ?? claim.orderNumber ?? '—'}
                      {claim.orderState && (
                        <span className="ml-1 text-smoke">({claim.orderState})</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {claim.status === 'fulfilled' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                        </span>
                      ) : (
                        <span className="text-xs text-cinnabar">Awaiting fulfillment</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-smoke whitespace-nowrap">
                      {new Date(claim.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {claim.status !== 'fulfilled' && (
                        <button
                          onClick={() => void markFulfilled(claim.claimId)}
                          disabled={working === claim.claimId}
                          className="text-xs text-ink hover:text-cinnabar underline underline-offset-4 mr-3 disabled:opacity-50"
                        >
                          Mark fulfilled
                        </button>
                      )}
                      <button
                        onClick={() => void deleteClaim(claim.claimId)}
                        disabled={working === claim.claimId}
                        className="inline-flex items-center gap-1 text-xs text-smoke hover:text-cinnabar disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

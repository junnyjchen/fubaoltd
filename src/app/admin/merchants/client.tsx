'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { AlertCircle, BadgeCheck, RefreshCw, Store, Wallet, XCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants', active: true },
];

interface ApplicationView {
  id: string;
  shopName: string;
  contactName: string;
  contactEmail: string;
  country: string;
  city?: string;
  specialties: string[];
  businessDescription: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userEmail?: string | null;
  userName?: string | null;
}

interface WithdrawalView {
  id: string;
  merchantId: string;
  amount: number;
  currency: 'USD' | 'USDT';
  payoutMethod: 'crypto' | 'bank';
  cryptoAddress?: string;
  cryptoNetwork?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  txHash?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface MerchantsData {
  applications: ApplicationView[];
  withdrawals: WithdrawalView[];
  stats: {
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    pendingWithdrawals: number;
    pendingWithdrawalAmount: number;
  };
}

const withdrawalStatusMeta: Record<WithdrawalView['status'], { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-gold/15 text-gold' },
  processing: { label: 'Processing', cls: 'bg-muted text-muted-foreground' },
  completed: { label: 'Paid', cls: 'bg-emerald-600/10 text-emerald-700' },
  rejected: { label: 'Rejected', cls: 'bg-cinnabar/10 text-cinnabar' },
};

export function AdminMerchantsClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<MerchantsData | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/merchants');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load merchants');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const review = async (
    action: 'review_application' | 'review_withdrawal',
    decision: 'approve' | 'reject',
    payload: { applicationId?: string; withdrawalId?: string }
  ) => {
    const key = payload.applicationId ?? payload.withdrawalId ?? '';
    setWorking(key);
    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, decision, ...payload }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Review failed');
      toast.success(body.message ?? 'Reviewed');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setWorking('');
    }
  };

  if (isLoading || (!data && !error)) {
    return <p className="text-muted-foreground py-12 text-center">Loading merchants…</p>;
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
        <h1 className="font-serif text-3xl text-foreground">Merchant Management</h1>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
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
          { label: 'Pending Applications', value: data?.stats.pendingApplications },
          { label: 'Approved Merchants', value: data?.stats.approvedApplications },
          { label: 'Rejected', value: data?.stats.rejectedApplications },
          { label: 'Pending Withdrawals', value: data?.stats.pendingWithdrawals },
          { label: 'Pending Amount', value: `$${(data?.stats.pendingWithdrawalAmount ?? 0).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
        <Store className="w-5 h-5 text-gold" /> Merchant Applications
      </h2>
      <div className="space-y-3 mb-10">
        {data?.applications.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg text-foreground">{a.shopName}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      a.status === 'approved'
                        ? 'bg-emerald-600/10 text-emerald-700'
                        : a.status === 'rejected'
                          ? 'bg-cinnabar/10 text-cinnabar'
                          : 'bg-gold/15 text-gold'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {a.contactName} · {a.userEmail ?? a.contactEmail} · {a.city ? `${a.city}, ` : ''}
                  {a.country}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{a.businessDescription}</p>
                {a.specialties.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {a.specialties.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Applied {new Date(a.createdAt).toLocaleString()}
                  {a.website ? ` · ${a.website}` : ''}
                </p>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={working === a.id}
                    onClick={() => void review('review_application', 'approve', { applicationId: a.id })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 disabled:opacity-50 transition-colors"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    disabled={working === a.id}
                    onClick={() => void review('review_application', 'reject', { applicationId: a.id })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {data?.applications.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">No merchant applications yet.</p>
        )}
      </div>

      <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-gold" /> Withdrawal Requests
      </h2>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Merchant</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payout</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Requested</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.withdrawals.map((w) => {
              const meta = withdrawalStatusMeta[w.status];
              return (
                <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-4 text-foreground font-mono text-xs">{w.merchantId}</td>
                  <td className="py-3 px-4 text-foreground font-medium">
                    {w.amount.toFixed(2)} {w.currency}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {w.payoutMethod === 'crypto' ? `Crypto${w.cryptoNetwork ? ` · ${w.cryptoNetwork}` : ''}` : 'Bank'}
                    {w.cryptoAddress && (
                      <span className="block text-xs font-mono opacity-70">{w.cryptoAddress}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {w.status === 'pending' ? (
                      <div className="inline-flex gap-2">
                        <button
                          disabled={working === w.id}
                          onClick={() => void review('review_withdrawal', 'approve', { withdrawalId: w.id })}
                          className="px-3 py-1 text-xs bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 disabled:opacity-50 transition-colors"
                        >
                          Approve Payout
                        </button>
                        <button
                          disabled={working === w.id}
                          onClick={() => void review('review_withdrawal', 'reject', { withdrawalId: w.id })}
                          className="px-3 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {w.reviewedAt ? `reviewed ${new Date(w.reviewedAt).toLocaleDateString()}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {data?.withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-center text-muted-foreground text-sm">
                  No withdrawal requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Approving an application provisions the shop in /artisans and grants merchant portal access; rejecting a
        withdrawal releases the held funds back to the merchant balance.
      </p>
    </div>
  );
}

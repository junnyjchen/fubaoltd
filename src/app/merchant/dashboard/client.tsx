'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface MerchantStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  settledRevenue: number;
  pendingRevenue: number;
  totalWithdrawals: number;
  shopName?: string;
}

interface MerchantProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  stock: number;
}

interface MerchantOrder {
  id: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

type Tab = 'overview' | 'products' | 'orders' | 'withdrawals';

const statusColors: Record<string, string> = {
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  fulfilled: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  processing: 'text-amber-700 bg-amber-50 border-amber-200',
  inactive: 'text-smoke bg-jade border-border',
  rejected: 'text-red-700 bg-red-50 border-red-200',
  cancelled: 'text-red-700 bg-red-50 border-red-200',
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'text-smoke bg-jade border-border';
  return (
    <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

export default function MerchantDashboardClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    if (isLoading || !user) return;
    if (user.role !== 'merchant') {
      setError('This portal is for verified merchants only.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [statsRes, productsRes, ordersRes, withdrawalsRes] = await Promise.all([
        fetch('/api/merchant/dashboard'),
        fetch('/api/merchant/products'),
        fetch('/api/merchant/orders'),
        fetch('/api/merchant/withdraw'),
      ]);
      const [statsJson, productsJson, ordersJson, withdrawalsJson] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        ordersRes.json(),
        withdrawalsRes.json(),
      ]);
      if (statsJson.success) setStats(statsJson.data);
      if (productsJson.success) setProducts(productsJson.data ?? []);
      if (ordersJson.success) setOrders(ordersJson.data ?? []);
      if (withdrawalsJson.success) setWithdrawals(withdrawalsJson.data ?? []);
    } catch {
      setError('Failed to load merchant data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [status, user]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/merchant/login');
      return;
    }
    loadAll();
  }, [status, router, loadAll]);

  if (status === 'loading' || (loading && !stats)) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-smoke font-serif text-lg">Loading your shop…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-cinnabar mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="text-ink underline underline-offset-4 hover:text-cinnabar">
              Back to Store
            </Link>
            <Link href="/merchant/login" className="text-ink underline underline-offset-4 hover:text-cinnabar">
              Merchant Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: `Products (${products.length})` },
    { key: 'orders', label: `Orders (${orders.length})` },
    { key: 'withdrawals', label: `Withdrawals (${withdrawals.length})` },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-ink">
              {stats?.shopName ?? 'Merchant Center'}
            </h1>
            <p className="text-sm text-smoke mt-0.5">
              Signed in as {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/merchant/apply" className="text-sm text-smoke hover:text-cinnabar transition-colors">
              Shop Profile
            </Link>
            <Link href="/" className="text-sm text-smoke hover:text-cinnabar transition-colors">
              View Store
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <p className="mb-6 border border-cinnabar/30 bg-cinnabar/5 text-cinnabar px-4 py-2 text-sm">
            {error}
          </p>
        )}

        {/* Tabs */}
        <nav className="flex flex-wrap gap-2 mb-8 border-b border-border pb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-cinnabar text-cinnabar'
                  : 'border-transparent text-smoke hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Products', value: String(stats.activeProducts ?? 0) },
                { label: 'Total Orders', value: String(stats.totalOrders ?? 0) },
                { label: 'Pending Orders', value: String(stats.pendingOrders ?? 0) },
                { label: 'Total Revenue', value: `$${(stats.totalRevenue ?? 0).toFixed(2)}` },
              ].map((c) => (
                <div key={c.label} className="bg-card border border-border rounded-md p-5">
                  <p className="text-xs uppercase tracking-widest text-smoke">{c.label}</p>
                  <p className="mt-2 font-serif text-2xl text-ink">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-jade/60 border border-border rounded-md p-5">
                <p className="text-xs uppercase tracking-widest text-smoke">Settled Revenue</p>
                <p className="mt-2 font-serif text-xl text-ink">${(stats.settledRevenue ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-jade/60 border border-border rounded-md p-5">
                <p className="text-xs uppercase tracking-widest text-smoke">Pending Settlement</p>
                <p className="mt-2 font-serif text-xl text-ink">${(stats.pendingRevenue ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-jade/60 border border-border rounded-md p-5">
                <p className="text-xs uppercase tracking-widest text-smoke">Withdrawal Requests</p>
                <p className="mt-2 font-serif text-xl text-ink">{stats.totalWithdrawals ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-jade text-left text-xs uppercase tracking-wider text-smoke">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-smoke">{p.category}</td>
                    <td className="px-4 py-3 text-ink">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-smoke">{p.stock}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-smoke">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-jade text-left text-xs uppercase tracking-wider text-smoke">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-mono text-xs text-ink">{o.id}</td>
                    <td className="px-4 py-3 text-ink">{o.customerName}</td>
                    <td className="px-4 py-3 text-smoke">{o.productName}</td>
                    <td className="px-4 py-3 text-ink">${o.amount.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-smoke">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'withdrawals' && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-jade text-left text-xs uppercase tracking-wider text-smoke">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Currency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 font-mono text-xs text-ink">{w.id}</td>
                    <td className="px-4 py-3 text-ink">${w.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-smoke">{w.currency}</td>
                    <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-3 text-smoke">{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-smoke">
                      No withdrawal requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

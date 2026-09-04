'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import {
  AlertCircle,
  ChevronDown,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders', active: true },
  { label: 'Products', href: '/admin/products' },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants' },
  { label: 'Wishes', href: '/admin/wishes' },
  { label: 'Newsletter', href: '/admin/newsletter' },
];

interface AdminOrderView {
  number: string;
  email: string;
  userId: string | null;
  state: string;
  paymentStatus: string;
  shipmentStatus: string;
  couponCode: string | null;
  itemCount: number;
  itemTotal: number;
  shipTotal: number;
  promoTotal: number;
  total: number;
  createdAt: string;
  completedAt: string | null;
  shipTo: { name: string; city: string; country: string } | null;
  items: { name: string; slug: string; quantity: number; price: number; personalization: string | null }[];
}

interface OrdersData {
  orders: AdminOrderView[];
  stats: {
    totalOrders: number;
    completed: number;
    inProgress: number;
    awaitingFulfillment: number;
    revenue: number;
  };
}

const STATE_OPTIONS = ['all', 'cart', 'address', 'delivery', 'payment', 'confirm', 'complete'];

const stateBadge = (state: string) =>
  state === 'complete'
    ? 'bg-emerald-600/10 text-emerald-700'
    : state === 'cart'
      ? 'bg-muted text-muted-foreground'
      : 'bg-amber-500/10 text-amber-700';

export function AdminOrdersClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<OrdersData | null>(null);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string>('');
  const [working, setWorking] = useState('');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (stateFilter !== 'all') params.set('state', stateFilter);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    }
  }, [stateFilter, query]);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const setShipment = async (orderNumber: string, shipmentStatus: 'shipped' | 'delivered') => {
    setWorking(orderNumber + shipmentStatus);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, shipmentStatus }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Update failed (${res.status})`);
      toast.success(body.message ?? 'Order updated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const stats = useMemo(
    () =>
      data
        ? [
            { label: 'Total Orders', value: data.stats.totalOrders },
            { label: 'Completed', value: data.stats.completed },
            { label: 'In Progress', value: data.stats.inProgress },
            { label: 'Awaiting Fulfillment', value: data.stats.awaitingFulfillment },
            { label: 'Revenue', value: `$${data.stats.revenue.toFixed(2)}` },
          ]
        : [],
    [data]
  );

  if (isLoading || (!data && !error)) {
    return <p className="text-muted-foreground py-12 text-center">Loading orders…</p>;
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
        <h1 className="font-serif text-3xl text-foreground">Order Management</h1>
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
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order number / email / item…"
            className="w-72 pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring capitalize"
        >
          {STATE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All states' : s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Items</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">State</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Shipment</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted-foreground">
                  No orders match the current filter.
                </td>
              </tr>
            )}
            {data?.orders.map((order) => (
              <Fragment key={order.number}>
                <tr className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setExpanded(expanded === order.number ? '' : order.number)}
                      className="inline-flex items-center gap-1.5 text-foreground font-medium hover:text-cinnabar transition-colors"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${expanded === order.number ? 'rotate-180' : ''}`}
                      />
                      {order.number}
                    </button>
                    {order.couponCode && (
                      <span className="ml-2 text-xs text-muted-foreground">({order.couponCode})</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{order.email || '—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{order.itemCount}</td>
                  <td className="py-3 px-4 text-foreground font-medium">${order.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${stateBadge(order.state)}`}>
                      {order.state}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-muted-foreground capitalize">
                      {order.state === 'complete' ? order.shipmentStatus : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {order.state === 'complete' && order.shipmentStatus === 'ready' && (
                      <button
                        disabled={working === order.number + 'shipped'}
                        onClick={() => void setShipment(order.number, 'shipped')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 disabled:opacity-50 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark Shipped
                      </button>
                    )}
                    {order.state === 'complete' && order.shipmentStatus === 'shipped' && (
                      <button
                        disabled={working === order.number + 'delivered'}
                        onClick={() => void setShipment(order.number, 'delivered')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-700 text-white rounded-md hover:bg-emerald-700/90 disabled:opacity-50 transition-colors"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    )}
                    {order.state !== 'complete' && (
                      <span className="text-xs text-muted-foreground">In checkout</span>
                    )}
                  </td>
                </tr>
                {expanded === order.number && (
                  <tr className="border-b border-border/50 bg-muted/20">
                    <td colSpan={8} className="py-4 px-8">
                      <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div>
                          <h4 className="text-foreground font-medium mb-2">Line Items</h4>
                          <ul className="space-y-1.5">
                            {order.items.map((item, i) => (
                              <li key={i} className="text-muted-foreground">
                                <span className="text-foreground">{item.quantity} × {item.name}</span> — $
                                {(item.price * item.quantity).toFixed(2)}
                                {item.personalization && (
                                  <span className="block text-xs italic pl-4">“{item.personalization}”</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-foreground font-medium mb-2">Ship To</h4>
                          {order.shipTo ? (
                            <p className="text-muted-foreground">
                              {order.shipTo.name}
                              <br />
                              {order.shipTo.city}, {order.shipTo.country}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">No address yet</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-foreground font-medium mb-2">Totals</h4>
                          <p className="text-muted-foreground space-y-1">
                            <span className="block">Items: ${order.itemTotal.toFixed(2)}</span>
                            <span className="block">Shipping: ${order.shipTotal.toFixed(2)}</span>
                            {order.promoTotal > 0 && (
                              <span className="block text-cinnabar">
                                Discount: −${order.promoTotal.toFixed(2)}
                              </span>
                            )}
                            <span className="block text-foreground font-medium">
                              Total: ${order.total.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

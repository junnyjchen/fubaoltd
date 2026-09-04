'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

interface AdminStats {
  overview: { totalProducts: number; totalCoupons: number; activeGiveaways: number; totalOrders: number; totalRevenue: number; newUsers: number };
  recentOrders: { id: string; customer: string; total: number; status: string; date: string }[];
  topProducts: { name: string; sales: number; revenue: string }[];
}

export function AdminDashboardClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(data => { if (data.success) setStats(data.data); else setError(data.error); })
        .catch(() => setError('Failed to load stats'));
    }
  }, [user]);

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user || user.role !== 'admin') return null;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!stats) return <div className="p-8 text-center">Loading stats...</div>;

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', active: true },
    { label: 'Orders', href: '/admin/orders' },
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl text-foreground mb-6">Admin Dashboard</h1>

      {/* Sidebar Nav */}
      <nav className="flex gap-4 mb-8 border-b border-border pb-4 overflow-x-auto">
        {navItems.map(item => (
          <a key={item.href} href={item.href} className={`text-sm whitespace-nowrap px-3 py-1 rounded-md ${item.active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(stats.overview).map(([key, value]) => (
          <div key={key} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {key === 'totalRevenue' ? `$${(value as number).toFixed(2)}` : value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="font-serif text-xl text-foreground mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground">Order ID</th>
            <th className="text-left py-2 text-muted-foreground">Customer</th>
            <th className="text-left py-2 text-muted-foreground">Total</th>
            <th className="text-left py-2 text-muted-foreground">Status</th>
            <th className="text-left py-2 text-muted-foreground">Date</th>
          </tr></thead>
          <tbody>
            {stats.recentOrders.map(order => (
              <tr key={order.id} className="border-b border-border/50">
                <td className="py-2 text-foreground">{order.id}</td>
                <td className="py-2 text-foreground">{order.customer}</td>
                <td className="py-2 text-foreground">${order.total}</td>
                <td className="py-2"><span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">{order.status}</span></td>
                <td className="py-2 text-muted-foreground">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Products */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-serif text-xl text-foreground mb-4">Top Products</h2>
        <div className="space-y-3">
          {stats.topProducts.map((product, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-foreground">{product.name}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">{product.sales} sales</span>
                <span className="text-accent font-medium">${product.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

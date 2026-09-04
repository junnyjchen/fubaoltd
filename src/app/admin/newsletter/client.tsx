'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Blessing', href: '/admin/blessing' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Merchants', href: '/admin/merchants' },
  { label: 'Wishes', href: '/admin/wishes' },
  { label: 'Newsletter', href: '/admin/newsletter' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Knowledge', href: '/admin/knowledge' },
];

interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

interface Stats {
  total: number;
  last7Days: number;
}

export function AdminNewsletterClient() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, last7Days: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSubs(json.data?.subscribers ?? []);
      setStats(json.data?.stats ?? { total: 0, last7Days: 0 });
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = query
    ? subs.filter((s) => s.email.toLowerCase().includes(query.toLowerCase()))
    : subs;

  const exportCsv = () => {
    const rows = ['email,source,subscribed_at', ...subs.map((s) => `${s.email},${s.source},${s.createdAt}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fubao-newsletter.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subs.map((s) => s.email).join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="min-h-screen bg-jade pb-20">
      <header className="border-b border-ink/10 bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-smoke">FuBao Admin</p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Newsletter Subscribers</h1>
          <p className="mt-2 text-sm text-smoke">
            Emails collected from the footer subscription form. Export to CSV for your email platform.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  item.href === '/admin/newsletter'
                    ? 'border-cinnabar bg-cinnabar text-paper'
                    : 'border-ink/20 text-ink hover:border-cinnabar hover:text-cinnabar'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-ink/10 bg-paper p-6">
            <p className="text-xs uppercase tracking-widest text-smoke">Total Subscribers</p>
            <p className="mt-2 font-serif text-4xl text-ink">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper p-6">
            <p className="text-xs uppercase tracking-widest text-smoke">Last 7 Days</p>
            <p className="mt-2 font-serif text-4xl text-cinnabar">{stats.last7Days}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email…"
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={subs.length === 0}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={copyAll} disabled={subs.length === 0}>
            {copied ? 'Copied' : 'Copy All Emails'}
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-paper">
          {loading ? (
            <div className="p-10 text-center text-sm text-smoke">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-smoke">
              {subs.length === 0 ? 'No subscribers yet.' : 'No matches for your search.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-widest text-smoke">
                  <th className="px-4 py-3 font-normal">Email</th>
                  <th className="px-4 py-3 font-normal">Source</th>
                  <th className="px-4 py-3 font-normal">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 text-ink">{s.email}</td>
                    <td className="px-4 py-3 text-smoke">{s.source}</td>
                    <td className="px-4 py-3 text-smoke">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

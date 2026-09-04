'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { AlertCircle, Eye, EyeOff, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Products', href: '/admin/products', active: true },
  { label: 'Knowledge Base', href: '/admin/knowledge' },
  { label: 'AI Training', href: '/admin/ai-training' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Giveaways', href: '/admin/giveaways' },
  { label: 'Free Blessing', href: '/admin/blessing' },
  { label: 'Merchants', href: '/admin/merchants' },
  { label: 'Wishes', href: '/admin/wishes' },
  { label: 'Newsletter', href: '/admin/newsletter' },
];

interface AdminProductView {
  slug: string;
  name: string;
  price: number;
  category: string;
  tagline: string;
  imageKey: string;
  stock: number | null;
  isActive: boolean;
  isFreeGift: boolean;
  rating: number;
  reviewCount: number;
  soldUnits: number;
  salesRevenue: number;
}

interface ProductsData {
  products: AdminProductView[];
  stats: { total: number; active: number; inactive: number; lowStock: number };
}

const CATEGORIES = ['Protection', 'Home Blessing', 'Career', 'Gift Sets'];

const emptyForm = { slug: '', name: '', price: '', category: 'Protection', tagline: '', imageKey: '' };

export function AdminProductsClient() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<ProductsData | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editing, setEditing] = useState('');
  const [editForm, setEditForm] = useState({ price: '', stock: '', tagline: '' });
  const [working, setWorking] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = await res.json();
      setData(body.data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') void load();
    if (!isLoading && user && user.role !== 'admin') setError('Admin access required');
    if (!isLoading && !user) setError('Please sign in with an admin account');
  }, [isLoading, user, load]);

  const uploadProductImage = async (file: File): Promise<string | null> => {
    setWorking('upload');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Upload failed');
      toast.success('Image uploaded');
      return body.data.key as string;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
      return null;
    } finally {
      setWorking('');
    }
  };

  const createProduct = async () => {
    setWorking('create');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: createForm.slug,
          name: createForm.name,
          price: Number(createForm.price),
          category: createForm.category,
          tagline: createForm.tagline,
          imageKey: createForm.imageKey || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Create failed');
      toast.success(body.message ?? 'Product created');
      setCreateForm(emptyForm);
      setCreating(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setWorking('');
    }
  };

  const startEdit = (p: AdminProductView) => {
    setEditing(p.slug);
    setEditForm({
      price: String(p.price),
      stock: p.stock === null ? '' : String(p.stock),
      tagline: p.tagline,
    });
  };

  const saveEdit = async (slug: string) => {
    setWorking(slug);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          updates: {
            price: Number(editForm.price),
            stock: editForm.stock === '' ? undefined : Number(editForm.stock),
            tagline: editForm.tagline,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      toast.success(body.message ?? 'Product updated');
      setEditing('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const toggleActive = async (p: AdminProductView) => {
    setWorking(p.slug);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: p.slug, updates: { isActive: !p.isActive } }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      toast.success(p.isActive ? `${p.name} removed from the storefront` : `${p.name} is now listed`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setWorking('');
    }
  };

  const deleteProduct = async (p: AdminProductView) => {
    if (!window.confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) return;
    setWorking(p.slug);
    try {
      const res = await fetch(`/api/admin/products?slug=${encodeURIComponent(p.slug)}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Delete failed');
      toast.success(body.message ?? 'Product deleted');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setWorking('');
    }
  };

  if (isLoading || (!data && !error)) {
    return <p className="text-muted-foreground py-12 text-center">Loading catalog…</p>;
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
        <h1 className="font-serif text-3xl text-foreground">Product Management</h1>
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
            <Plus className="w-4 h-4" /> New Product
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
          { label: 'Total Products', value: data?.stats.total },
          { label: 'Listed', value: data?.stats.active },
          { label: 'Unlisted', value: data?.stats.inactive },
          { label: 'Low Stock (≤10)', value: data?.stats.lowStock },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4">Create Product</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Slug (URL)</label>
              <input
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                placeholder="peace-talisman"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Name</label>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Peace Talisman"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                placeholder="29.90"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tagline</label>
              <input
                value={createForm.tagline}
                onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
                placeholder="Hand-drawn keepsake for inner calm"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Product Image (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={working === 'upload'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadProductImage(file).then((key) => {
                      if (key) setCreateForm((f) => ({ ...f, imageKey: key }));
                    });
                    e.target.value = '';
                  }}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:px-2 file:py-1 file:text-xs file:border file:border-border file:rounded-md file:bg-background file:text-foreground cursor-pointer"
                />
                {createForm.imageKey && (
                  <img
                    src={`/api/images/${encodeURIComponent(createForm.imageKey)}`}
                    alt="preview"
                    className="w-10 h-10 object-cover rounded-md border border-border"
                  />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {createForm.imageKey || 'Without an image the storefront falls back to the hand-drawn talisman motif.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              disabled={working === 'create' || !createForm.slug || !createForm.name || !createForm.price}
              onClick={() => void createProduct()}
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
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Stock</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Sold</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products.map((p) => (
              <tr key={p.slug} className="border-b border-border/50 hover:bg-muted/20 align-top">
                <td className="py-3 px-4">
                  <div className="text-foreground font-medium">
                    {p.name}
                    {p.isFreeGift && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide bg-gold/15 text-gold">
                        Free Gift
                      </span>
                    )}
                  </div>
                  {editing === p.slug ? (
                    <input
                      value={editForm.tagline}
                      onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                      className="mt-1 w-full max-w-md px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground">{p.tagline}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">{p.category}</td>
                <td className="py-3 px-4">
                  {editing === p.slug ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-24 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    <span className="text-foreground font-medium">${p.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editing === p.slug ? (
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      placeholder="—"
                      className="w-20 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : p.stock === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className={p.stock <= 10 ? 'text-cinnabar font-medium' : 'text-foreground'}>{p.stock}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {p.soldUnits}
                  {p.soldUnits > 0 && <span className="block text-xs">${p.salesRevenue.toFixed(2)}</span>}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.isActive ? 'bg-emerald-600/10 text-emerald-700' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {p.isActive ? 'Listed' : 'Unlisted'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  {editing === p.slug ? (
                    <div className="inline-flex gap-2">
                      <button
                        disabled={working === p.slug}
                        onClick={() => void saveEdit(p.slug)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-cinnabar text-white rounded-md hover:bg-cinnabar/90 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditing('')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                        title="Edit price / stock / tagline"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        disabled={working === p.slug}
                        onClick={() => void toggleActive(p)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                        title={p.isActive ? 'Remove from storefront' : 'List on storefront'}
                      >
                        {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {p.isActive ? 'Unlist' : 'List'}
                      </button>
                      {!p.isFreeGift && (
                        <button
                          disabled={working === p.slug}
                          onClick={() => void deleteProduct(p)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-cinnabar/40 text-cinnabar rounded-md hover:bg-cinnabar/10 disabled:opacity-50 transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Edits apply instantly to the storefront, cart pricing and the Spree API layer. Deleting is blocked while an
        order references the product — unlist it instead.
      </p>
    </div>
  );
}

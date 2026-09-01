'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Clock, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useFavorites } from '@/lib/favorites/favorites-context';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';
import { FavoriteButton } from '@/components/shared/favorite-button';
import type { Product } from '@/lib/data/types';

interface HistoryItem {
  productSlug: string;
  productName: string;
  visitedAt: string;
}

export function WishlistClient({ products }: { products: Product[] }) {
  const { user, isLoading } = useAuth();
  const { favorites, initialized } = useFavorites();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/history')
      .then((res) => (res.ok ? res.json() : { data: { history: [] } }))
      .then((d) => setHistory(d.data.history ?? []))
      .catch(() => {});
  }, [user]);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const favoriteProducts = favorites
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => Boolean(p));
  const recent = history
    .map((h) => bySlug.get(h.productSlug))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  return (
    <div className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
            Saved
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Wishlist
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke">
            Talismans you have saved for later. Your wishlist follows your
            account across devices.
          </p>
        </div>

        {isLoading ? (
          <div className="border border-border bg-jade/40 px-8 py-16 text-center text-sm text-smoke">
            Loading…
          </div>
        ) : !user ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 border border-border bg-jade/40 px-8 py-16 text-center">
            <LogIn className="h-6 w-6 text-smoke" strokeWidth={1.5} />
            <p className="text-sm text-smoke">
              Sign in to keep a wishlist. It only takes a moment.
            </p>
            <Link
              href="/login"
              className="border border-cinnabar bg-cinnabar px-6 py-2.5 text-xs tracking-[0.1em] text-white transition-colors duration-300 hover:bg-cinnabar/90"
            >
              Sign In
            </Link>
          </div>
        ) : initialized && favoriteProducts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 border border-border bg-jade/40 px-8 py-16 text-center">
            <Heart className="h-6 w-6 text-smoke" strokeWidth={1.5} />
            <p className="text-sm text-smoke">
              Your wishlist is empty. Tap the heart on any talisman to save it
              here.
            </p>
            <Link
              href="/talisman"
              className="border border-cinnabar bg-cinnabar px-6 py-2.5 text-xs tracking-[0.1em] text-white transition-colors duration-300 hover:bg-cinnabar/90"
            >
              Browse Talismans
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/talisman/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-jade transition-all duration-500">
                  <div className="flex h-full w-full items-center justify-center p-8 transition-transform duration-700 group-hover:scale-[1.03]">
                    <TalismanSVG
                      variant={getTalismanVariant(product.slug)}
                      className="h-full w-auto max-w-[180px] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>
                  <FavoriteButton slug={product.slug} />
                </div>
                <div className="mt-5">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-smoke/60">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-lg font-light text-ink transition-colors duration-300 group-hover:text-cinnabar">
                    {product.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-cinnabar">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-xs text-smoke">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Recently viewed */}
        {user && recent.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <h2 className="mb-8 flex items-center gap-2 font-serif text-2xl font-light text-ink">
              <Clock className="h-4 w-4 text-smoke" strokeWidth={1.5} />
              Recently Viewed
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((product) => (
                <Link
                  key={product.slug}
                  href={`/talisman/${product.slug}`}
                  className="group flex items-center gap-4 border border-border p-3 transition-all duration-300 hover:border-cinnabar/40"
                >
                  <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center bg-jade">
                    <TalismanSVG
                      variant={getTalismanVariant(product.slug)}
                      className="h-12 w-auto opacity-80"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-ink transition-colors duration-300 group-hover:text-cinnabar">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-cinnabar">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

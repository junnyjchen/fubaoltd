'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

interface FavoritesContextType {
  /** Slugs the current user has saved (empty when signed out). */
  favorites: string[];
  /** True once the initial load finished (avoids heart flicker). */
  initialized: boolean;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => Promise<{ ok: boolean; action?: 'added' | 'removed'; error?: string }>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setFavorites([]);
      setInitialized(true);
      return;
    }
    let cancelled = false;
    fetch('/api/user/favorites')
      .then((res) => (res.ok ? res.json() : { data: { favorites: [] } }))
      .then((d) => {
        if (!cancelled) {
          setFavorites(d.data.favorites ?? []);
          setInitialized(true);
        }
      })
      .catch(() => {
        if (!cancelled) setInitialized(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isLoading]);

  const toggleFavorite = useCallback(
    async (slug: string) => {
      if (!user) return { ok: false, error: 'auth' };
      try {
        const res = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: slug }),
        });
        if (!res.ok) return { ok: false, error: 'error' };
        const d = await res.json();
        setFavorites((prev) =>
          d.data.action === 'added'
            ? [...prev, slug]
            : prev.filter((s) => s !== slug)
        );
        return { ok: true, action: d.data.action };
      } catch {
        return { ok: false, error: 'error' };
      }
    },
    [user]
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, initialized, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}

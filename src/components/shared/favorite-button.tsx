'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/favorites/favorites-context';

interface Props {
  slug: string;
  /** 'card' floats over product images; 'detail' sits inline next to Add to Cart. */
  variant?: 'card' | 'detail';
}

export function FavoriteButton({ slug, variant = 'card' }: Props) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, initialized } = useFavorites();
  const [busy, setBusy] = useState(false);
  const active = isFavorite(slug);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const result = await toggleFavorite(slug);
    if (!result.ok && result.error === 'auth') {
      router.push('/login');
      return;
    }
    setBusy(false);
  };

  if (variant === 'detail') {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
        className="flex w-full items-center justify-center gap-2 border border-border py-3 text-xs tracking-[0.1em] text-smoke transition-all duration-300 hover:border-cinnabar hover:text-cinnabar disabled:opacity-50"
      >
        <Heart
          className={`h-4 w-4 transition-colors duration-300 ${
            active ? 'fill-cinnabar text-cinnabar' : 'text-current'
          }`}
        />
        {initialized && active ? 'Saved to Wishlist' : 'Save to Wishlist'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-paper/90 text-smoke shadow-sm backdrop-blur-sm transition-all duration-300 hover:text-cinnabar disabled:opacity-50"
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          active ? 'fill-cinnabar text-cinnabar' : 'text-current'
        }`}
      />
    </button>
  );
}

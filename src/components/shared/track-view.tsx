'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Silently records a product view for the logged-in user's browsing history.
 * Renders nothing; failures are ignored (history is a nicety, not a feature gate).
 */
export function TrackView({ slug, name }: { slug: string; name: string }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;
    fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug: slug, productName: name }),
    }).catch(() => {});
  }, [user, isLoading, slug, name]);

  return null;
}

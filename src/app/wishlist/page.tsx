import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { WishlistClient } from './client';

export const metadata: Metadata = {
  title: 'Wishlist',
  description:
    'Talismans you have saved for later. Sign in to keep your wishlist across devices.',
};

export default async function WishlistPage() {
  // The full catalog is tiny — hand it to the client and let it resolve
  // favorite slugs locally (single fetch, no per-slug round trips).
  const products = await getProducts();

  return <WishlistClient products={products} />;
}

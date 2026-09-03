import type { Metadata } from 'next';
import { AdminWishesClient } from './client';

export const metadata: Metadata = {
  title: 'Wish Moderation — FuBao Admin',
  description: 'Review and moderate customer wishes before they appear on the public wall.',
};

export default function AdminWishesPage() {
  return <AdminWishesClient />;
}

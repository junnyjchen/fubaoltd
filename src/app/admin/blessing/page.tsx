import type { Metadata } from 'next';
import { AdminBlessingClient } from './client';

export const metadata: Metadata = {
  title: 'Free Blessing Admin — FuBao',
  description: 'Manage the free blessing activity: products, claims, activity window.',
};

export default function AdminBlessingPage() {
  return <AdminBlessingClient />;
}

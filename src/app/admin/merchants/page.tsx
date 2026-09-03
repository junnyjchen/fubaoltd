import type { Metadata } from 'next';
import { AdminMerchantsClient } from './client';

export const metadata: Metadata = {
  title: 'Merchant Management — FuBao Admin',
  description: 'Review merchant applications and withdrawal requests.',
};

export default function AdminMerchantsPage() {
  return <AdminMerchantsClient />;
}

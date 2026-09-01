import type { Metadata } from 'next';
import MerchantDashboardClient from './client';

export const metadata: Metadata = {
  title: 'Merchant Center | FuBao',
  description: 'Manage your products, orders, settlements and shop profile.',
  robots: { index: false, follow: false },
};

export default function MerchantDashboardPage() {
  return <MerchantDashboardClient />;
}

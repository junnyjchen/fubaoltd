import type { Metadata } from 'next';
import { AccountPageClient } from './client';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your FuBao account, orders, and preferences.',
};

export default function AccountPage() {
  return <AccountPageClient />;
}

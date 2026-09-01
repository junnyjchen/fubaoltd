import type { Metadata } from 'next';
import { NotificationsClient } from './client';

export const metadata: Metadata = {
  title: 'Notifications',
  description:
    'Order updates, promotions, and account news from FuBao.',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}

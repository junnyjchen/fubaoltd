import type { Metadata } from 'next';
import { AdminOrdersClient } from './client';

export const metadata: Metadata = {
  title: 'Order Management — FuBao Admin',
  description: 'Manage orders: search, fulfillment status, revenue overview.',
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}

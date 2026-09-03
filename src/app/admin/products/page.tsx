import type { Metadata } from 'next';
import { AdminProductsClient } from './client';

export const metadata: Metadata = {
  title: 'Product Management — FuBao Admin',
  description: 'Manage the talisman catalog: pricing, stock, visibility.',
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}

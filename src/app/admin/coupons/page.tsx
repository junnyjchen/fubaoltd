import type { Metadata } from 'next';
import { AdminCouponsClient } from './client';

export const metadata: Metadata = {
  title: 'Coupon Management — FuBao Admin',
  description: 'Create and manage promotional coupon codes.',
};

export default function AdminCouponsPage() {
  return <AdminCouponsClient />;
}

import type { Metadata } from 'next';
import { AdminDashboardClient } from './client';

export const metadata: Metadata = {
  title: 'Admin Dashboard — FuBao',
  description: 'FuBao administration dashboard.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

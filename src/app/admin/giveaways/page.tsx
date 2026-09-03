import type { Metadata } from 'next';
import { AdminGiveawaysClient } from './client';

export const metadata: Metadata = {
  title: 'Giveaway Management — FuBao Admin',
  description: 'Create and manage giveaway campaigns.',
};

export default function AdminGiveawaysPage() {
  return <AdminGiveawaysClient />;
}

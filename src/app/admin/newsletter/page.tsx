import type { Metadata } from 'next';
import { AdminNewsletterClient } from './client';

export const metadata: Metadata = {
  title: 'Newsletter · FuBao Admin',
};

export default function AdminNewsletterPage() {
  return <AdminNewsletterClient />;
}

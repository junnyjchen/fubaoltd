import type { Metadata } from 'next';
import { RegisterPageClient } from './client';

export const metadata: Metadata = {
  title: 'Register — FuBao',
  description: 'Create your FuBao account and start your spiritual journey.',
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

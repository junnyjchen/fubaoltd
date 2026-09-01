import type { Metadata } from 'next';
import { LoginPageClient } from './client';

export const metadata: Metadata = {
  title: 'Login — FuBao',
  description: 'Sign in to your FuBao account to access your talismans, orders, and more.',
};

export default function LoginPage() {
  return <LoginPageClient />;
}

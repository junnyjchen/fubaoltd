import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPageClient } from './client';

export const metadata: Metadata = {
  title: 'Login — FuBao',
  description: 'Sign in to your FuBao account to access your talismans, orders, and more.',
};

// useSearchParams() 在静态预渲染（static prerender）期间必须在 Suspense 边界内，
// 否则 next build 报 missing-suspense-with-csr-bailout 导致 /login 构建失败。
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}

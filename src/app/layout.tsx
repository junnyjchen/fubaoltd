import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FontPreload } from '@/components/layout/font-preload';
import { AuthProvider } from '@/lib/auth/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FuBao — Hand-drawn Taoist Talismans',
    template: '%s | FuBao',
  },
  description:
    'Discover hand-drawn Taoist talismans crafted by Master Chen in Hong Kong. Authentic cultural artifacts for protection, home blessing, and career success.',
  keywords: [
    'Taoist talisman',
    'FuBao',
    'protection talisman',
    'Eastern spirituality',
    'cultural artifact',
    'hand-drawn talisman',
    'Hong Kong temple',
  ],
  authors: [{ name: 'FuBao', url: 'https://fubao.co' }],
  openGraph: {
    title: 'FuBao — Hand-drawn Taoist Talismans',
    description:
      'Authentic Taoist talismans hand-drawn by Master Chen in Hong Kong. Cultural artifacts for protection, harmony, and prosperity.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <FontPreload />
        <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

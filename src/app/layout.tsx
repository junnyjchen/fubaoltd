import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FontPreload } from '@/components/layout/font-preload';
import { RefCapture } from '@/components/shared/ref-capture';
import { AIAssistantFab } from '@/components/shared/ai-assistant-fab';
import { AuthProvider } from '@/lib/auth/auth-context';
import { FavoritesProvider } from '@/lib/favorites/favorites-context';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.co'),
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
    images: [
      {
        url: '/og-brand.png',
        width: 2560,
        height: 1440,
        alt: 'FuBao — Hand-drawn Taoist Talismans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FuBao — Hand-drawn Taoist Talismans',
    description:
      'Authentic Taoist talismans hand-drawn by Master Chen in Hong Kong. Cultural artifacts for protection, harmony, and prosperity.',
    images: ['/og-brand.png'],
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
        <RefCapture />
        <LocaleProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Header />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
              <AIAssistantFab />
              <Toaster position="bottom-right" offset="104px" />
            </FavoritesProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

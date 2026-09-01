import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  description: 'Your FuBao order has been confirmed.',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cinnabar/30">
            <span className="font-serif text-3xl text-cinnabar">✓</span>
          </div>
          <h1 className="font-serif text-3xl font-light text-ink sm:text-4xl">
            Order Confirmed
          </h1>
          <p className="mt-4 text-sm text-smoke">
            Thank you for your order. We have received your order and will
            begin processing it shortly.
          </p>
          <div className="mt-6 border border-border p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-smoke">
              Order ID
            </p>
            <p className="mt-1 font-mono text-lg text-cinnabar">{id}</p>
          </div>
          <p className="mt-6 text-sm text-smoke">
            You will receive a confirmation email with tracking details once
            your order ships from Hong Kong.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="border border-cinnabar bg-cinnabar px-8 py-3 text-sm text-white transition-colors hover:bg-cinnabar/90"
            >
              Return Home
            </Link>
            <Link
              href="/talisman"
              className="border border-border px-8 py-3 text-sm text-ink transition-colors hover:border-ink"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

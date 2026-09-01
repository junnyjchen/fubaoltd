import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrderDetailForOrderNumber } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  description: 'Your FuBao order has been confirmed.',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderDetailForOrderNumber(id);

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
            {order ? (
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-smoke">Status</span>
                  <span className="font-medium capitalize text-ink">
                    {order.state}
                  </span>
                </div>
                {order.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-ink">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-smoke">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-medium text-cinnabar">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-smoke">
                A confirmation email with tracking details will follow once
                your order ships from Hong Kong.
              </p>
            )}
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

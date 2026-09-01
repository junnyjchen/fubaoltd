import type { Metadata } from 'next';
import { VerifyClient } from './client';

export const metadata: Metadata = {
  title: 'Verify Your Talisman',
  description:
    'Enter your FuBao talisman\'s unique code to view its consecration certificate and verify authenticity.',
};

export default function VerifyPage() {
  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
            Authenticity
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Verify Your Talisman
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke">
            Enter the unique code found on your talisman&apos;s certificate to
            view its consecration details and verify its authenticity.
          </p>
        </div>
        <VerifyClient />
      </div>
    </div>
  );
}

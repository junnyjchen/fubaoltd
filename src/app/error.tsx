'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to server logs for diagnosis (digest correlates with the log entry)
    console.error('Unhandled page error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-background">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <div
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-gold/40 bg-jade/50"
        >
          <span className="font-serif text-2xl font-semibold text-gold">
            Qi
          </span>
        </div>

        <h1 className="mt-8 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          A Moment of Stillness
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke">
          Something disrupted the flow of this page. The energy has been
          logged and our caretakers will restore balance shortly.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="bg-cinnabar text-white hover:bg-cinnabar/90">
            Try Again
          </Button>
          <Button asChild variant="outline" className="border-ink/20 text-ink hover:bg-jade/60">
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-12 text-xs text-smoke/60">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}

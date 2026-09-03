import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-background">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        {/* Decorative seal-style 404 */}
        <div
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-cinnabar/40 bg-jade/50"
        >
          <span className="font-serif text-3xl font-semibold tracking-wide text-cinnabar">
            404
          </span>
        </div>

        <h1 className="mt-8 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          This Path Has No Destination
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke">
          Like a wandering spirit, the page you seek has drifted beyond the
          mortal realm — or perhaps it never existed at all. Let us guide you
          back to the temple grounds.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-cinnabar text-white hover:bg-cinnabar/90">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" className="border-ink/20 text-ink hover:bg-jade/60">
            <Link href="/talisman">Browse Talismans</Link>
          </Button>
        </div>

        <p className="mt-12 text-xs italic text-smoke/70">
          &ldquo;The Tao that can be walked is not the eternal Tao.&rdquo;
        </p>
      </div>
    </main>
  );
}

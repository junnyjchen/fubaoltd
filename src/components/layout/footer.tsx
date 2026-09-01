import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-serif text-2xl font-light tracking-[0.2em] text-ink"
            >
              FU<span className="text-cinnabar">BAO</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-smoke">
              Hand-drawn Taoist talismans from Hong Kong. Each piece carries
              centuries of cultural heritage, crafted with intention and care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/talisman?category=Protection"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Protection
                </Link>
              </li>
              <li>
                <Link
                  href="/talisman?category=Home+Blessing"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Home Blessing
                </Link>
              </li>
              <li>
                <Link
                  href="/talisman?category=Career"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Career
                </Link>
              </li>
              <li>
                <Link
                  href="/talisman?category=Gift+Sets"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Gift Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Verify Talisman
                </Link>
              </li>
              <li>
                <Link
                  href="/elements-quiz"
                  className="text-sm text-smoke transition-colors hover:text-ink"
                >
                  Five Elements Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Stay Connected
            </h4>
            <p className="mb-4 text-sm text-smoke">
              Receive insights on Taoist culture and early access to new
              collections.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-smoke">
            Contact:{' '}
            <a
              href="mailto:hello@fubao.co"
              className="underline transition-colors hover:text-ink"
            >
              hello@fubao.co
            </a>
          </p>
          <p className="text-center text-xs italic text-smoke/70">
            For entertainment purposes only. FuBao talismans are cultural
            artifacts and spiritual keepsakes.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-smoke/50">Instagram</span>
            <span className="text-xs text-smoke/50">Twitter</span>
            <span className="text-xs text-smoke/50">Pinterest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/talisman', label: 'Talismans' },
  { href: '/elements-quiz', label: 'Five Elements Quiz' },
  { href: '/verify', label: 'Verify' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl font-light tracking-[0.2em] text-ink"
        >
          FU<span className="text-cinnabar">BAO</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-smoke transition-colors duration-300 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-ink transition-colors duration-300 hover:text-cinnabar"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-cinnabar text-[10px] text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="text-ink md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-smoke transition-colors duration-300 hover:text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

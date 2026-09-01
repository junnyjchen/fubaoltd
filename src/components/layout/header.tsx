'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useScrollPosition } from '@/hooks/use-scroll-reveal';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/talisman', label: 'Talismans' },
  { href: '/elements-quiz', label: 'Five Elements' },
  { href: '/verify', label: 'Verify' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 50;

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border/80 bg-paper/95 shadow-sm backdrop-blur-md'
            : 'border-b border-transparent bg-paper'
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${isScrolled ? 'h-14' : 'h-16'}`}>
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl font-light tracking-[0.25em] text-ink transition-all duration-300 sm:text-2xl"
          >
            FU<span className="text-cinnabar">BAO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs tracking-[0.1em] text-smoke transition-colors duration-300 hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cinnabar after:transition-all after:duration-300 hover:after:w-full"
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
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-cinnabar text-[10px] font-medium text-white">
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
      </header>

      {/* Mobile Nav Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-all duration-300 md:hidden ${
          mobileOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif text-2xl font-light tracking-wide text-ink transition-all duration-300 hover:text-cinnabar"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.3s ease ${i * 60}ms, transform 0.3s ease ${i * 60}ms`,
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 h-px w-16 bg-gold/30" />
        </div>
      </div>
    </>
  );
}

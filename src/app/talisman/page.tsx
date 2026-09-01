import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import type { ProductCategory } from '@/lib/data/types';
import { Star } from 'lucide-react';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';
import { RevealSection } from '@/components/shared/reveal-section';

export const metadata: Metadata = {
  title: 'Talismans',
  description:
    'Browse our collection of hand-drawn Taoist talismans. Protection, home blessing, career success, and gift sets — each crafted by Master Chen in Hong Kong.',
};

const categories: Array<{ label: string; value: ProductCategory | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'Protection', value: 'Protection' },
  { label: 'Home Blessing', value: 'Home Blessing' },
  { label: 'Career', value: 'Career' },
  { label: 'Gift Sets', value: 'Gift Sets' },
];

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function TalismanPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryFilter = params.category as ProductCategory | undefined;
  const products = await getProducts(categoryFilter);

  return (
    <div className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
            Collection
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Our Talismans
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke">
            Each talisman is hand-drawn by Master Chen using traditional
            cinnabar ink, following ancient consecration rituals in our Hong
            Kong temple.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const isActive =
              cat.value === 'All'
                ? !categoryFilter
                : cat.value === categoryFilter;
            const href =
              cat.value === 'All'
                ? '/talisman'
                : `/talisman?category=${encodeURIComponent(cat.value)}`;
            return (
              <Link
                key={cat.value}
                href={href}
                className={`border px-5 py-2 text-xs tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'border-cinnabar bg-cinnabar text-white'
                    : 'border-border text-smoke hover:border-ink hover:text-ink'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => {
            const variant = getTalismanVariant(product.slug);
            return (
              <RevealSection key={product.slug} delay={i * 80}>
                <Link
                  href={`/talisman/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-jade transition-all duration-500">
                    <div className="flex h-full w-full items-center justify-center p-8 transition-transform duration-700 group-hover:scale-[1.03]">
                      <TalismanSVG
                        variant={variant}
                        className="h-full w-auto max-w-[180px] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-smoke/60">
                      {product.category}
                    </p>
                    <h3 className="font-serif text-lg font-light text-ink transition-colors duration-300 group-hover:text-cinnabar">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-smoke line-clamp-2">
                      {product.tagline}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-cinnabar">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <span className="text-xs text-smoke">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealSection>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm text-smoke">
              No talismans found in this category.
            </p>
            <Link
              href="/talisman"
              className="mt-4 inline-flex text-sm text-cinnabar underline underline-offset-4"
            >
              View all talismans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import type { ProductCategory } from '@/lib/data/types';
import { Star } from 'lucide-react';

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
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
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
        <div className="mb-12 flex flex-wrap justify-center gap-3">
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
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/talisman/${product.slug}`}
              className="group"
            >
              <div className="aspect-[3/4] overflow-hidden bg-jade">
                <div className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-cinnabar/20 flex items-center justify-center">
                      <span className="font-serif text-3xl text-cinnabar/40">符</span>
                    </div>
                    <p className="text-xs tracking-widest text-smoke/60 uppercase">
                      {product.category}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-lg font-light text-ink transition-colors group-hover:text-cinnabar">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-smoke line-clamp-2">
                  {product.tagline}
                </p>
                <div className="mt-2 flex items-center justify-between">
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
          ))}
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

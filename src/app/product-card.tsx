'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { RevealSection } from '@/components/shared/reveal-section';
import type { Product } from '@/lib/data/types';

export function ProductCard({ product, delay }: { product: Product; delay: number }) {
  return (
    <RevealSection delay={delay}>
      <Link href={`/talisman/${product.slug}`} className="group block">
        <div className="aspect-[3/4] overflow-hidden bg-jade transition-all duration-500">
          <div className="transition-transform duration-700 group-hover:scale-[1.03]">
            <ProductImage
              slug={product.slug}
              imageKey={product.image_key}
              className="h-full w-full"
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
              <span className="text-xs text-smoke">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </RevealSection>
  );
}

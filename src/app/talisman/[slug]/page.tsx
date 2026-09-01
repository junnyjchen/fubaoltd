import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/api';
import { ProductDetailClient } from './client';
import { reviews } from '@/lib/data/products';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.tagline,
    openGraph: {
      title: `${product.name} | FuBao`,
      description: product.tagline,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-smoke">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/talisman" className="hover:text-ink">Talismans</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden bg-jade">
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 h-32 w-32 rounded-full border-2 border-cinnabar/20 flex items-center justify-center">
                  <span className="font-serif text-5xl text-cinnabar/40">符</span>
                </div>
                <p className="text-xs tracking-widest text-smoke/60 uppercase">
                  {product.category}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cinnabar">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-smoke">{product.tagline}</p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-gold text-gold'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-smoke">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="mt-6 text-2xl font-light text-cinnabar">
              ${product.price.toFixed(2)} USD
            </p>

            {/* Add to Cart */}
            <ProductDetailClient product={product} />

            {/* Shipping */}
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ink">
                Shipping
              </h3>
              <p className="text-sm leading-relaxed text-smoke">
                Ships from Hong Kong within 3-5 business days. International
                delivery typically takes 7-14 business days. Each talisman is
                carefully packaged in a protective sleeve with a certificate of
                consecration.
              </p>
            </div>

            {/* Blessing Ritual */}
            <div className="mt-6 border border-cinnabar/20 bg-jade/50 p-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-cinnabar">
                Blessing Ritual
              </h3>
              <p className="text-sm leading-relaxed text-smoke">
                Each talisman is hand-drawn by Master Chen at Qingyun Temple in
                Hong Kong, following the traditional seven-step consecration
                process — from auspicious date selection through cinnabar
                preparation, hand-drawing, chanting, and the final sealing
                ceremony.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-smoke">
                <span className="font-medium text-ink">Master:</span>{' '}
                {product.ritual_info.master}
                <br />
                <span className="font-medium text-ink">Location:</span>{' '}
                {product.ritual_info.location}
              </p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="mt-16 max-w-3xl">
          <h2 className="mb-6 font-serif text-2xl font-light text-ink">
            Cultural Story
          </h2>
          {product.story.map((paragraph, i) => (
            <p
              key={i}
              className="mb-4 text-sm leading-relaxed text-smoke"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="mb-8 font-serif text-2xl font-light text-ink">
            Reviews
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {getReviewsForProduct(product.slug).map((review) => (
              <div key={review.id} className="border border-border p-6">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating
                          ? 'fill-gold text-gold'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-smoke italic">
                  &ldquo;{review.content}&rdquo;
                </p>
                <p className="mt-3 text-xs font-medium text-ink">
                  {review.author}
                </p>
                <p className="text-xs text-smoke">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getReviewsForProduct(slug: string) {
  return reviews.filter((r) => r.productSlug === slug);
}

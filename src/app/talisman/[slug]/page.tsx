import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts, getArtisanForProduct } from '@/lib/api';
import { ProductDetailClient } from './client';
import { reviews } from '@/lib/data/products';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { TalismanSVG, getTalismanVariant } from '@/components/shared/talisman-svg';

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

  const variant = getTalismanVariant(product.slug);
  const artisan = await getArtisanForProduct(slug);

  return (
    <div className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-smoke">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span className="text-border">/</span>
          <Link href="/talisman" className="transition-colors hover:text-ink">Talismans</Link>
          <span className="text-border">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden bg-jade">
            <div className="flex h-full w-full items-center justify-center p-12">
              <TalismanSVG
                variant={variant}
                className="h-full w-auto max-w-[260px] opacity-90"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-cinnabar">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-smoke">{product.tagline}</p>

            {/* Artisan attribution */}
            {artisan && (
              <p className="mt-3 text-xs text-smoke">
                Hand-drawn by{' '}
                <Link
                  href="/artisans"
                  className="text-cinnabar underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {artisan.name}
                </Link>
                {artisan.certification === 'gold' ? ' — Gold Certified' : ' — Certified'} · {artisan.city ? `${artisan.city}, ` : ''}{artisan.country}
              </p>
            )}

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-gold text-gold'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-smoke">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="mt-6 text-2xl font-light text-cinnabar">
              ${product.price.toFixed(2)} <span className="text-sm text-smoke">USD</span>
            </p>

            {/* Add to Cart */}
            <ProductDetailClient product={product} />

            {/* Shipping & Ritual Info */}
            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-smoke" />
                <div>
                  <p className="text-xs font-medium text-ink">Ships from Hong Kong</p>
                  <p className="mt-0.5 text-xs text-smoke">
                    3-5 business days processing. International delivery 7-14 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-smoke" />
                <div>
                  <p className="text-xs font-medium text-ink">Authenticity Guaranteed</p>
                  <p className="mt-0.5 text-xs text-smoke">
                    Each talisman includes a unique verification code and certificate of consecration.
                  </p>
                </div>
              </div>
            </div>

            {/* Blessing Ritual */}
            <div className="mt-6 border border-cinnabar/15 bg-jade/30 p-5">
              <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-cinnabar">
                Blessing Ritual
              </h3>
              <p className="text-xs leading-relaxed text-smoke">
                {artisan
                  ? `Hand-drawn by ${artisan.name} in ${artisan.city || artisan.country}, following the traditional seven-step consecration process.`
                  : 'Hand-drawn following the traditional seven-step consecration process.'}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-smoke">Master</span>
                  <p className="font-medium text-ink">{product.ritual_info.master}</p>
                </div>
                <div>
                  <span className="text-smoke">Location</span>
                  <p className="font-medium text-ink">{product.ritual_info.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="mt-20 max-w-3xl">
          <h2 className="mb-6 font-serif text-2xl font-light text-ink">
            Cultural Story
          </h2>
          <div className="h-px w-12 bg-gold/30 mb-8" />
          {product.story.map((paragraph, i) => (
            <p
              key={i}
              className="mb-5 text-sm leading-[1.9] text-smoke"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="mb-2 font-serif text-2xl font-light text-ink">
            Reviews
          </h2>
          <div className="h-px w-12 bg-gold/30 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            {getReviewsForProduct(product.slug).map((review) => (
              <div key={review.id} className="border border-border p-6 transition-all duration-300 hover:shadow-sm">
                <div className="mb-3 flex gap-0.5">
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
                <p className="text-sm leading-[1.8] text-smoke italic">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div className="mt-4 border-t border-border/50 pt-3">
                  <p className="text-xs font-medium text-ink">{review.author}</p>
                  <p className="text-xs text-smoke">{review.date}</p>
                </div>
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

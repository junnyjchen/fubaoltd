import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import { FeaturedHeader } from './featured-header';
import { ProductCard } from './product-card';
import { RitualGrid } from './ritual-grid';
import { MasterImage } from './master-image';
import { TestimonialCard } from './testimonial-card';

const testimonials = [
  {
    quote:
      'The craftsmanship is extraordinary. You can feel the intention behind every brushstroke. It arrived beautifully packaged with a handwritten note.',
    author: 'Sarah M.',
    location: 'London, UK',
  },
  {
    quote:
      'I bought the Energy Blessing Box as a housewarming gift. My friends were deeply moved by the cultural story behind each piece.',
    author: 'James L.',
    location: 'New York, USA',
  },
  {
    quote:
      'More than a product — it is a bridge to an ancient tradition. The verification certificate gave me confidence in its authenticity.',
    author: 'Emily R.',
    location: 'Sydney, Australia',
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-paper">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M40 0C17.909 0 0 17.909 0 40s17.909 40 40 40 40-17.909 40-40S62.091 0 40 0zm0 78C19.013 78 2 60.987 2 40S19.013 2 40 2s38 17.013 38 38-17.013 38-38 38z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute left-[15%] top-0 h-full w-px bg-gradient-to-b from-transparent via-cinnabar/5 to-transparent" />
        <div className="absolute right-[15%] top-0 h-full w-px bg-gradient-to-b from-transparent via-cinnabar/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex items-center gap-3">
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-smoke">
              Hand-drawn in Hong Kong
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </div>

          <h1 className="font-serif text-5xl font-light leading-[1.15] tracking-wide text-ink sm:text-6xl md:text-7xl lg:text-8xl">
            Ancient Wisdom,
            <br />
            <span className="italic text-cinnabar">Drawn by Hand</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
            Each FuBao talisman is hand-drawn by Master Chen in a Hong Kong
            Taoist temple, carrying centuries of cultural heritage through
            authentic consecration rituals.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/talisman"
              className="group inline-flex items-center gap-2 border border-cinnabar bg-cinnabar px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-cinnabar/90"
            >
              Shop Talismans
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center border border-ink/20 px-8 py-3.5 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-white"
            >
              Our Story
            </Link>
          </div>

          <div className="mt-16 flex flex-col items-center gap-2">
            <div className="h-8 w-px bg-gradient-to-b from-transparent to-smoke/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-smoke/30" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedHeader />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <ProductCard key={product.slug} product={product} delay={i * 100} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              href="/talisman"
              className="group inline-flex items-center gap-2 text-sm tracking-wide text-ink underline underline-offset-4 transition-colors hover:text-cinnabar"
            >
              View All Talismans
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ritual Process */}
      <section className="bg-jade py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
              The Sacred Process
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              Seven Steps of Consecration
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke">
              Every FuBao talisman undergoes a meticulous seven-step ritual
              process, ensuring each piece carries the full weight of Taoist
              tradition.
            </p>
          </div>
          <RitualGrid />
        </div>
      </section>

      {/* Master Section */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <MasterImage />
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
                The Master
              </p>
              <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
                Master Chen Zhiwei
              </h2>
              <div className="mt-1 h-px w-12 bg-gold/40" />
              <p className="mt-6 text-sm leading-[1.8] text-smoke">
                With over thirty years of dedicated practice in Taoist arts,
                Master Chen Zhiwei is one of Hong Kong&apos;s most respected
                talisman practitioners. Trained under the lineage of Qingyun
                Temple, he carries forward a tradition that spans generations.
              </p>
              <p className="mt-4 text-sm leading-[1.8] text-smoke">
                Each talisman that bears his hand is drawn during auspicious
                hours, using traditional cinnabar ink and consecrated paper.
                His brushwork is not merely calligraphy — it is a meditative
                act that channels centuries of spiritual knowledge into every
                stroke.
              </p>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 text-sm tracking-wide text-ink underline underline-offset-4 transition-colors hover:text-cinnabar"
              >
                Read the full story
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-jade py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
              Testimonials
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              Words from Our Community
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* Giveaway strip */}
      <section className="border-y border-gold/20 bg-jade/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
              Community Event
            </p>
            <p className="mt-1.5 text-sm text-ink">
              Seasonal giveaways are open — claim a hand-drawn talisman keepsake.
            </p>
          </div>
          <Link
            href="/giveaways"
            className="inline-flex items-center gap-2 border border-cinnabar px-6 py-2.5 text-sm font-medium tracking-wide text-cinnabar transition-all duration-300 hover:bg-cinnabar hover:text-white"
          >
            View Giveaways
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
              Discover Your Element
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
            Find the Talisman That
            <br />
            <span className="italic">Resonates with You</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-smoke">
            Take our Five Elements Quiz to discover your dominant element based
            on traditional Taoist principles, and receive personalized talisman
            recommendations.
          </p>
          <Link
            href="/elements-quiz"
            className="group mt-10 inline-flex items-center gap-2 border border-cinnabar bg-cinnabar px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-cinnabar/90"
          >
            Take the Quiz
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

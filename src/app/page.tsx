import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import { Star } from 'lucide-react';

const ritualSteps = [
  {
    step: 1,
    title: 'Selection of Auspicious Date',
    desc: 'Master Chen consults the Taoist almanac to identify the most harmonious date for the ceremony.',
  },
  {
    step: 2,
    title: 'Purification',
    desc: 'A period of fasting and meditation to cleanse the body and mind before the sacred work begins.',
  },
  {
    step: 3,
    title: 'Cinnabar Ink',
    desc: 'Premium cinnabar is carefully prepared — its deep red hue symbolizes life force and spiritual power.',
  },
  {
    step: 4,
    title: 'Hand-drawn Talisman',
    desc: 'With decades of practice, Master Chen draws each symbol with precise, intentional brushstrokes.',
  },
  {
    step: 5,
    title: 'Chanting',
    desc: 'Ancient sutras are chanted to infuse the talisman with focused spiritual energy and intention.',
  },
  {
    step: 6,
    title: 'Consecration Ceremony',
    desc: 'The completed talisman undergoes a formal consecration ritual in the temple hall.',
  },
  {
    step: 7,
    title: 'Sealing',
    desc: 'The talisman is sealed with the temple stamp, a unique code, and prepared for its journey to you.',
  },
];

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
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-paper">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-smoke">
            Hand-drawn in Hong Kong
          </p>
          <h1 className="font-serif text-5xl font-light leading-tight tracking-wide text-ink sm:text-6xl md:text-7xl">
            Ancient Wisdom,
            <br />
            <span className="italic text-cinnabar">Drawn by Hand</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-smoke">
            Each FuBao talisman is hand-drawn by Master Chen in a Hong Kong
            Taoist temple, carrying centuries of cultural heritage through
            authentic consecration rituals.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/talisman"
              className="inline-flex items-center border border-cinnabar bg-cinnabar px-8 py-3 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-cinnabar/90"
            >
              Shop Talismans
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center border border-ink px-8 py-3 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:bg-ink hover:text-white"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
              Collection
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              Featured Talismans
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.slug}
                href={`/talisman/${product.slug}`}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-jade">
                  <div className="flex h-full w-full items-center justify-center">
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
                  <p className="mt-1 text-sm text-smoke">{product.tagline}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-cinnabar">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-xs text-smoke">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/talisman"
              className="inline-flex items-center text-sm tracking-wide text-ink underline underline-offset-4 transition-colors hover:text-cinnabar"
            >
              View All Talismans →
            </Link>
          </div>
        </div>
      </section>

      {/* Ritual Process */}
      <section className="bg-jade py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ritualSteps.map((item) => (
              <div
                key={item.step}
                className="relative border border-border bg-paper p-6 transition-all duration-300 hover:border-cinnabar/30"
              >
                <span className="font-serif text-4xl font-light text-cinnabar/20">
                  {String(item.step).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-serif text-base font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Section */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="aspect-square overflow-hidden bg-jade">
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 rounded-full border-2 border-cinnabar/20 flex items-center justify-center">
                    <span className="font-serif text-4xl text-cinnabar/40">道</span>
                  </div>
                  <p className="text-sm tracking-widest text-smoke/60 uppercase">
                    Master Chen Zhiwei
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
                The Master
              </p>
              <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
                Master Chen Zhiwei
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-smoke">
                With over thirty years of dedicated practice in Taoist arts,
                Master Chen Zhiwei is one of Hong Kong&apos;s most respected
                talisman practitioners. Trained under the lineage of Qingyun
                Temple, he carries forward a tradition that spans generations.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-smoke">
                Each talisman that bears his hand is drawn during auspicious
                hours, using traditional cinnabar ink and consecrated paper.
                His brushwork is not merely calligraphy — it is a meditative
                act that channels centuries of spiritual knowledge into every
                stroke.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center text-sm tracking-wide text-ink underline underline-offset-4 transition-colors hover:text-cinnabar"
              >
                Read the full story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-jade py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
              Testimonials
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
              Words from Our Community
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="border border-border bg-paper p-8"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3 w-3 fill-gold text-gold"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-ink italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="text-sm font-medium text-ink">{t.author}</p>
                  <p className="text-xs text-smoke">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
            Discover Your Element
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-smoke">
            Take our Five Elements Quiz to find which talisman resonates with
            your unique energy. Based on traditional Taoist principles of
            balance and harmony.
          </p>
          <Link
            href="/elements-quiz"
            className="mt-8 inline-flex items-center border border-cinnabar bg-cinnabar px-8 py-3 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-cinnabar/90"
          >
            Take the Quiz
          </Link>
        </div>
      </section>
    </div>
  );
}

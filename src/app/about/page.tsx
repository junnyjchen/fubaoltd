import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About FuBao',
  description:
    'Learn about Master Chen, our Hong Kong temple, and the ancient tradition of Taoist talisman artistry.',
};

const ritualSteps = [
  {
    step: 1,
    title: 'Selection of Auspicious Date',
    desc: 'Master Chen consults the Taoist almanac (通书) to identify the most harmonious date and hour for the ceremony, aligned with celestial cycles and the talisman\'s intended purpose.',
  },
  {
    step: 2,
    title: 'Purification',
    desc: 'A period of fasting, meditation, and ritual bathing prepares the body and mind. The workspace is cleansed with incense and blessed water.',
  },
  {
    step: 3,
    title: 'Cinnabar Ink Preparation',
    desc: 'Premium cinnabar (朱砂) is ground and mixed with a proprietary blend of natural ingredients. The deep red hue symbolizes life force and spiritual power.',
  },
  {
    step: 4,
    title: 'Hand-drawn Talisman',
    desc: 'With decades of practice, Master Chen draws each symbol with precise, intentional brushstrokes. Each stroke follows exact specifications from ancient Taoist texts.',
  },
  {
    step: 5,
    title: 'Chanting of Sutras',
    desc: 'Ancient sutras are chanted to infuse the talisman with focused spiritual energy. The vibrations are believed to activate the symbols\' inherent power.',
  },
  {
    step: 6,
    title: 'Consecration Ceremony',
    desc: 'The completed talisman undergoes a formal consecration ritual in the main temple hall, witnessed by senior monks and aligned with the temple\'s spiritual lineage.',
  },
  {
    step: 7,
    title: 'Sealing & Documentation',
    desc: 'The talisman is sealed with the temple stamp, assigned a unique verification code, and carefully packaged for its journey to you.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
            Our Story
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Bridging Ancient Wisdom
            <br />
            <span className="italic">and Modern Life</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-smoke">
            FuBao was born from a simple belief: the profound beauty and
            wisdom of Taoist talisman tradition deserves to be shared with
            the world. Each piece we offer is a bridge between ancient
            spiritual practice and contemporary life — a tangible connection
            to centuries of cultural heritage.
          </p>
        </div>
      </section>

      {/* Master Chen */}
      <section className="bg-jade py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="aspect-[4/5] overflow-hidden bg-paper">
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 rounded-full border-2 border-cinnabar/20 flex items-center justify-center">
                    <span className="font-serif text-5xl text-cinnabar/40">道</span>
                  </div>
                  <p className="text-sm tracking-widest text-smoke/60 uppercase">
                    Master Chen Zhiwei
                  </p>
                  <p className="mt-1 text-xs text-smoke/40">
                    Qingyun Temple, Hong Kong
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
                The Master
              </p>
              <h2 className="font-serif text-3xl font-light tracking-wide text-ink">
                Master Chen Zhiwei
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-smoke">
                Born into a family of Taoist practitioners, Master Chen
                Zhiwei began his training at the age of twelve under the
                guidance of his grandfather, a renowned talisman master at
                Qingyun Temple in Hong Kong&apos;s New Territories.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-smoke">
                Over thirty years of dedicated practice, he has mastered the
                intricate art of talisman creation — from the precise
                preparation of cinnabar ink to the meditative brushwork that
                brings each symbol to life. His work is recognized
                throughout Hong Kong&apos;s Taoist community for its
                authenticity and spiritual depth.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-smoke">
                Today, Master Chen continues the lineage at Qingyun Temple,
                where he creates each FuBao talisman with the same devotion
                and precision that has defined his family&apos;s practice for
                generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Temple */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
            The Temple
          </p>
          <h2 className="font-serif text-3xl font-light tracking-wide text-ink">
            Qingyun Temple, Hong Kong
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-smoke">
            Nestled in the verdant hills of Hong Kong&apos;s New Territories,
            Qingyun Temple has been a center of Taoist practice for over a
            century. The temple&apos;s serene halls, filled with the scent
            of sandalwood incense, provide the sacred environment necessary
            for authentic talisman consecration.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-smoke">
            It is here, in this timeless setting, that Master Chen performs
            each consecration ritual — surrounded by the spiritual energy
            that generations of practitioners have cultivated within these
            walls.
          </p>
        </div>
      </section>

      {/* Ritual Steps */}
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
          <div className="space-y-6">
            {ritualSteps.map((item) => (
              <div
                key={item.step}
                className="flex gap-6 border border-border bg-paper p-6 transition-all duration-300 hover:border-cinnabar/30"
              >
                <span className="font-serif text-4xl font-light text-cinnabar/20">
                  {String(item.step).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Context */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
              Cultural Heritage
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-ink">
              Understanding Talismans
            </h2>
          </div>
          <div className="mt-8 space-y-6">
            <p className="text-sm leading-relaxed text-smoke">
              Taoist talismans (符, fú) are sacred symbols with a history
              spanning over a thousand years. In Taoist tradition, they serve
              as conduits for spiritual energy — carefully designed symbols
              that encode specific intentions and blessings.
            </p>
            <p className="text-sm leading-relaxed text-smoke">
              The creation of a talisman is not merely a craft but a
              spiritual practice. Each element — from the type of ink to the
              direction of brushstrokes to the timing of the ceremony —
              carries deep symbolic meaning rooted in Taoist cosmology.
            </p>
            <p className="text-sm leading-relaxed text-smoke">
              At FuBao, we approach these artifacts with deep respect for
              their cultural significance. Our talismans are offered as
              cultural artifacts and spiritual keepsakes — tangible
              connections to a living tradition that has endured for
              centuries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

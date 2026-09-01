import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about FuBao talismans, shipping, returns, and Taoist cultural heritage.',
};

const faqSections = [
  {
    title: 'Shipping & Delivery',
    items: [
      {
        q: 'Where do you ship from?',
        a: 'All talismans are shipped directly from Hong Kong. Each piece is carefully packaged in a protective sleeve with its certificate of consecration.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders are processed within 3-5 business days. International delivery typically takes 7-14 business days depending on your location. Express shipping options are available at checkout.',
      },
      {
        q: 'Do you ship worldwide?',
        a: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination. You can see the exact cost at checkout.',
      },
      {
        q: 'How is the talisman packaged?',
        a: 'Each talisman is placed in a protective silk-lined sleeve, accompanied by its consecration certificate and a cultural context card. Gift sets come in a handmade wooden box.',
      },
    ],
  },
  {
    title: 'Products & Authenticity',
    items: [
      {
        q: 'Are the talismans really hand-drawn?',
        a: 'Yes. Every FuBao talisman is individually hand-drawn by Master Chen Zhiwei at Qingyun Temple in Hong Kong, using traditional cinnabar ink and consecrated paper.',
      },
      {
        q: 'How can I verify my talisman is authentic?',
        a: 'Each talisman comes with a unique verification code (format: FB-2026-XXXXXX). You can enter this code on our Verify page to view the full consecration certificate and confirm authenticity.',
      },
      {
        q: 'What is cinnabar ink?',
        a: 'Cinnabar (朱砂) is a naturally occurring mineral (mercury sulfide) that has been used in Taoist rituals for centuries. Its deep red color symbolizes life force and spiritual power. The ink used in our talismans is prepared following traditional methods.',
      },
      {
        q: 'What is the Personalized Birth-Chart Talisman?',
        a: 'This is a bespoke talisman created based on your birth year, season, and personal focus. Master Chen analyzes your elemental balance using the Ba Zi (Four Pillars of Destiny) system and creates a unique talisman aligned with your spiritual blueprint.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'Due to the sacred and personalized nature of our talismans, we generally do not accept returns. However, if your talisman arrives damaged, please contact us within 7 days with photos and we will arrange a replacement.',
      },
      {
        q: 'Can I exchange a talisman?',
        a: 'We do not offer exchanges on consecrated talismans. Please review your selection carefully before ordering. If you need guidance choosing the right talisman, our Five Elements Quiz can help.',
      },
    ],
  },
  {
    title: 'Cultural Information',
    items: [
      {
        q: 'What is the significance of the Five Elements?',
        a: 'In Taoist philosophy, the Five Elements (Wu Xing — Metal, Wood, Water, Fire, Earth) represent fundamental energies that interact to shape all aspects of existence. Understanding your dominant element can provide insight into your strengths and areas for growth.',
      },
      {
        q: 'Do I need to follow Taoism to use a talisman?',
        a: 'Not at all. Our talismans are offered as cultural artifacts and spiritual keepsakes. People from all backgrounds appreciate them for their artistic beauty, cultural significance, and the intention behind their creation.',
      },
      {
        q: 'What does "For entertainment purposes only" mean?',
        a: 'FuBao talismans are cultural artifacts and works of art. While they carry deep cultural and spiritual significance within Taoist tradition, we do not claim they produce specific supernatural effects. They are offered as meaningful keepsakes and connections to Eastern cultural heritage.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
            Help Center
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke">
            Find answers to common questions about our talismans, shipping,
            and the cultural traditions behind our work.
          </p>
        </div>

        <div className="space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-6 border-b border-border pb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.items.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-medium text-ink">
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-smoke">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-16 border-t border-border pt-12 text-center">
          <h2 className="font-serif text-xl font-light text-ink">
            Still have questions?
          </h2>
          <p className="mt-2 text-sm text-smoke">
            We&apos;re here to help. Reach out to us at{' '}
            <a
              href="mailto:hello@fubao.co"
              className="text-cinnabar underline underline-offset-2"
            >
              hello@fubao.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

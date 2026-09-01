'use client';

import { Compass, Sparkles, Shield } from 'lucide-react';
import { RevealSection } from '@/components/shared/reveal-section';

const ritualSteps = [
  { step: 1, title: 'Selection of Auspicious Date', desc: 'Master Chen consults the Taoist almanac to identify the most harmonious date for the ceremony.', iconType: 'compass' as const },
  { step: 2, title: 'Purification', desc: 'A period of fasting and meditation to cleanse the body and mind before the sacred work begins.', iconType: 'sparkles' as const },
  { step: 3, title: 'Cinnabar Ink', desc: 'Premium cinnabar is carefully prepared \u2014 its deep red hue symbolizes life force and spiritual power.', iconType: 'shield' as const },
  { step: 4, title: 'Hand-drawn Talisman', desc: 'With decades of practice, Master Chen draws each symbol with precise, intentional brushstrokes.', iconType: 'sparkles' as const },
  { step: 5, title: 'Chanting', desc: 'Ancient sutras are chanted to infuse the talisman with focused spiritual energy and intention.', iconType: 'compass' as const },
  { step: 6, title: 'Consecration Ceremony', desc: 'The completed talisman undergoes a formal consecration ritual in the temple hall.', iconType: 'shield' as const },
  { step: 7, title: 'Sealing', desc: 'The talisman is sealed with the temple stamp, a unique code, and prepared for its journey to you.', iconType: 'sparkles' as const },
];

function getIcon(type: 'compass' | 'sparkles' | 'shield') {
  switch (type) {
    case 'compass': return Compass;
    case 'sparkles': return Sparkles;
    case 'shield': return Shield;
  }
}

export function RitualGrid() {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-cinnabar/10 lg:block" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ritualSteps.map((item, i) => {
          const Icon = getIcon(item.iconType);
          return (
            <RevealSection key={item.step} delay={i * 80}>
              <div className="group relative border border-border bg-paper p-6 transition-all duration-500 hover:border-cinnabar/30 hover:shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="font-serif text-3xl font-light text-cinnabar/15 transition-colors group-hover:text-cinnabar/30">
                    {String(item.step).padStart(2, '0')}
                  </span>
                  <Icon className="h-4 w-4 text-cinnabar/30 transition-colors group-hover:text-cinnabar/60" />
                </div>
                <h3 className="font-serif text-sm font-medium text-ink">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-smoke">{item.desc}</p>
              </div>
            </RevealSection>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { RevealSection } from '@/components/shared/reveal-section';

export function FeaturedHeader() {
  return (
    <RevealSection className="mb-16 text-center">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
        Collection
      </p>
      <h2 className="font-serif text-3xl font-light tracking-wide text-ink sm:text-4xl">
        Featured Talismans
      </h2>
    </RevealSection>
  );
}

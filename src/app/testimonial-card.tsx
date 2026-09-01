'use client';

import { Star } from 'lucide-react';
import { RevealSection } from '@/components/shared/reveal-section';

export function TestimonialCard({
  testimonial,
  delay,
}: {
  testimonial: { quote: string; author: string; location: string };
  delay: number;
}) {
  return (
    <RevealSection delay={delay}>
      <div className="border border-border bg-paper p-8 transition-all duration-500 hover:shadow-sm">
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star key={j} className="h-3 w-3 fill-gold text-gold" />
          ))}
        </div>
        <p className="text-sm leading-[1.8] text-ink/80 italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <div className="mt-6 border-t border-border/50 pt-4">
          <p className="text-sm font-medium text-ink">{testimonial.author}</p>
          <p className="text-xs text-smoke">{testimonial.location}</p>
        </div>
      </div>
    </RevealSection>
  );
}

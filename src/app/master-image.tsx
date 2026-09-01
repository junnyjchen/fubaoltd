'use client';

import { RevealSection } from '@/components/shared/reveal-section';

export function MasterImage() {
  return (
    <RevealSection>
      <div className="aspect-[4/5] overflow-hidden bg-jade">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-36 w-36">
              <div className="absolute inset-0 rounded-full border border-cinnabar/15" />
              <div className="absolute inset-3 rounded-full border border-cinnabar/10" />
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-serif text-5xl text-cinnabar/25">道</span>
              </div>
            </div>
            <p className="text-xs tracking-[0.2em] text-smoke/50 uppercase">Master Chen Zhiwei</p>
            <p className="mt-1 text-[10px] tracking-wider text-smoke/40">Qingyun Temple, Hong Kong</p>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

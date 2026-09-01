import type { Metadata } from 'next';
import { QuizClient } from './client';

export const metadata: Metadata = {
  title: 'Five Elements Quiz',
  description:
    'Discover your dominant element through our Five Elements Quiz based on Taoist principles. Get personalized talisman recommendations.',
};

export default function ElementsQuizPage() {
  return (
    <div className="bg-paper py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-cinnabar">
            Discover Your Element
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Five Elements Quiz
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke">
            In Taoist philosophy, the Five Elements (Wu Xing) shape our
            energy and destiny. Answer a few questions to discover your
            dominant element and find the talisman that resonates with you.
          </p>
        </div>
        <QuizClient />
      </div>
    </div>
  );
}

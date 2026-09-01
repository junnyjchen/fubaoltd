'use client';

import { useState } from 'react';
import { getQuizResult } from '@/lib/api';
import { useCart } from '@/hooks/use-cart';
import type { QuizAnswers, QuizResult, LifeFocus } from '@/lib/data/types';
import Link from 'next/link';
import { Loader2, ChevronRight, RotateCcw } from 'lucide-react';

const elementColors: Record<string, string> = {
  Metal: 'text-ink',
  Wood: 'text-green-700',
  Water: 'text-blue-700',
  Fire: 'text-cinnabar',
  Earth: 'text-amber-700',
};

const elementSymbols: Record<string, string> = {
  Metal: '金',
  Wood: '木',
  Water: '水',
  Fire: '火',
  Earth: '土',
};

export function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());

  const questions = [
    {
      key: 'birthYear',
      question: 'What is your birth year?',
      type: 'number' as const,
      placeholder: 'e.g., 1990',
    },
    {
      key: 'birthSeason',
      question: 'Which season were you born in?',
      type: 'choice' as const,
      options: [
        { value: 'spring', label: 'Spring' },
        { value: 'summer', label: 'Summer' },
        { value: 'autumn', label: 'Autumn' },
        { value: 'winter', label: 'Winter' },
      ],
    },
    {
      key: 'gender',
      question: 'How do you identify?',
      type: 'choice' as const,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'focus',
      question: 'What area of life are you most focused on right now?',
      type: 'choice' as const,
      options: [
        { value: 'career', label: 'Career & Growth' },
        { value: 'family', label: 'Family & Home' },
        { value: 'health', label: 'Health & Protection' },
        { value: 'relationships', label: 'Relationships' },
      ],
    },
  ];

  const currentQ = questions[step];

  const handleAnswer = (value: string | number) => {
    const key = currentQ.key as keyof QuizAnswers;
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit(newAnswers as QuizAnswers);
    }
  };

  const handleSubmit = async (completeAnswers: QuizAnswers) => {
    setLoading(true);
    const res = await getQuizResult(completeAnswers);
    setResult(res);
    setLoading(false);
  };

  const handleAddToCart = (slug: string) => {
    addItem(slug, 1);
    setAddedSlugs((prev) => new Set(prev).add(slug));
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setAddedSlugs(new Set());
  };

  if (result) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-8 text-center">
          <span className={`font-serif text-6xl ${elementColors[result.element]}`}>
            {elementSymbols[result.element]}
          </span>
          <h2 className="mt-4 font-serif text-3xl font-light text-ink">
            Your Element: {result.element}
          </h2>
        </div>

        <div className="mb-8 border border-border p-6">
          <p className="text-sm leading-relaxed text-smoke">
            {result.elementDescription}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
            Your Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-smoke">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cinnabar" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-smoke">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-ink">
            Recommended Talismans
          </h3>
          <div className="space-y-3">
            {result.recommendedProducts.map((slug) => (
              <div
                key={slug}
                className="flex items-center justify-between border border-border p-4"
              >
                <Link
                  href={`/talisman/${slug}`}
                  className="font-serif text-sm text-ink hover:text-cinnabar"
                >
                  {slug
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </Link>
                <button
                  onClick={() => handleAddToCart(slug)}
                  className={`border px-4 py-1.5 text-xs tracking-wide transition-all ${
                    addedSlugs.has(slug)
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-cinnabar text-cinnabar hover:bg-cinnabar hover:text-white'
                  }`}
                >
                  {addedSlugs.has(slug) ? 'Added' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-smoke transition-colors hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 transition-colors ${
                i <= step ? 'bg-cinnabar' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-smoke">
          Question {step + 1} of {questions.length}
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cinnabar" />
          <p className="mt-4 text-sm text-smoke">
            Analyzing your elemental balance...
          </p>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <h2 className="mb-8 font-serif text-2xl font-light text-ink">
            {currentQ.question}
          </h2>

          {currentQ.type === 'number' ? (
            <div>
              <input
                type="number"
                placeholder={currentQ.placeholder}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-smoke/40 focus:border-cinnabar focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt(
                      (e.target as HTMLInputElement).value,
                      10
                    );
                    if (val > 1900 && val < 2030) {
                      handleAnswer(val);
                    }
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  const input = document.querySelector(
                    'input[type="number"]'
                  ) as HTMLInputElement;
                  const val = parseInt(input?.value, 10);
                  if (val > 1900 && val < 2030) {
                    handleAnswer(val);
                  }
                }}
                className="mt-4 inline-flex items-center gap-2 border border-cinnabar bg-cinnabar px-6 py-2.5 text-sm text-white transition-colors hover:bg-cinnabar/90"
              >
                Continue
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentQ.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleAnswer(
                      currentQ.key === 'birthYear'
                        ? parseInt(opt.value, 10)
                        : (opt.value as LifeFocus | 'spring' | 'summer' | 'autumn' | 'winter' | 'male' | 'female' | 'other')
                    )
                  }
                  className="w-full border border-border px-6 py-4 text-left text-sm text-ink transition-all duration-300 hover:border-cinnabar hover:bg-jade/50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-6 text-xs text-smoke transition-colors hover:text-ink"
            >
              ← Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}

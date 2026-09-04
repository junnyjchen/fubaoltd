'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productSlug: string;
}

const STAR = '★';

export function ReviewForm({ productSlug }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (rating < 1) {
      setNote({ kind: 'err', text: 'Please choose a star rating.' });
      return;
    }
    if (content.trim().length < 5) {
      setNote({ kind: 'err', text: 'Please share a few words (at least 5 characters).' });
      return;
    }
    setSubmitting(true);
    setNote(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug, rating, content: content.trim() }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.status === 401) {
        setNote({ kind: 'err', text: 'Please sign in to write a review.' });
        return;
      }
      if (!res.ok) {
        setNote({ kind: 'err', text: json.error ?? 'Failed to submit review.' });
        return;
      }
      setNote({ kind: 'ok', text: 'Thank you — your review is published.' });
      setContent('');
      setRating(0);
      router.refresh();
    } catch {
      setNote({ kind: 'err', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 border border-jade bg-background/60 p-5">
      <p className="font-serif text-lg text-ink">Share Your Experience</p>
      <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={(hovered || rating) === star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className={cn(
              'text-2xl leading-none transition-colors',
              (hovered || rating) >= star ? 'text-gold' : 'text-jade',
            )}
          >
            {STAR}
          </button>
        ))}
        <span className="ml-2 text-sm text-smoke">
          {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
        </span>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What does this talisman mean to you? (5–500 characters)"
        maxLength={500}
        rows={4}
        className="mt-4 border-jade bg-background font-sans text-sm text-ink placeholder:text-smoke/70 focus-visible:ring-gold/40"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <span
          className={cn(
            'text-sm',
            note?.kind === 'ok' ? 'text-smoke' : 'text-cinnabar',
            note ? '' : 'opacity-0',
          )}
          role="status"
        >
          {note?.text ?? '\u00a0'}
        </span>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-cinnabar font-sans text-sm font-medium text-paper hover:bg-cinnabar/90 disabled:opacity-50"
        >
          {submitting ? 'Publishing…' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}

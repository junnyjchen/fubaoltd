'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await response.json()) as { error?: string };

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome to the FuBao circle. Check your inbox soon.');
        setEmail('');
        return;
      }
      // 409 already subscribed is still a "success" state for the user
      if (response.status === 409) {
        setStatus('success');
        setMessage('You are already on the list — the Dao remembers.');
        setEmail('');
        return;
      }
      setStatus('error');
      setMessage(data.error ?? 'Something went wrong. Please try again.');
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          disabled={status === 'submitting'}
          className="flex-1 rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm text-ink placeholder:text-smoke/60 focus:border-cinnabar focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'submitting' || email.trim() === ''}
          className="rounded-md bg-cinnabar px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-cinnabar/90 disabled:opacity-50"
        >
          {status === 'submitting' ? 'Joining…' : 'Subscribe'}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-xs ${status === 'error' ? 'text-cinnabar' : 'text-smoke'}`}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="mt-2 text-xs text-smoke/70">
          Monthly notes on Taoist culture and new talisman drops. No spam.
        </p>
      )}
    </div>
  );
}

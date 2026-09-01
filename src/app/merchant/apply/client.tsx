'use client';

import { useState } from 'react';
import Link from 'next/link';

const SPECIALTIES = [
  'Hand-drawn Talismans',
  'Cultural Accessories',
  'Incense & Ritual Tools',
  'Jade & Crystals',
  'Calligraphy Art',
  'Books & Media',
];

export default function MerchantApplyClient() {
  const [shopName, setShopName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [businessDescription, setBusinessDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/merchant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          contactName,
          contactEmail,
          contactPhone,
          country,
          city,
          specialties,
          businessDescription,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to submit application. Please try again.');
        return;
      }
      setSubmitted(json.data?.applicationId ?? 'submitted');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-jade">
            <span className="font-serif text-2xl text-gold">符</span>
          </div>
          <h1 className="font-serif text-3xl text-ink">Application Received</h1>
          <p className="mt-4 text-smoke leading-relaxed">
            Thank you for your interest in the FuBao merchant program. Our team will
            review your application within 3–5 business days and reach out to
            <span className="text-ink"> {contactEmail}</span> with the result.
          </p>
          <p className="mt-3 text-xs text-smoke font-mono">Reference: {submitted}</p>
          <div className="mt-8 flex justify-center gap-6">
            <Link href="/" className="text-sm text-ink underline underline-offset-4 hover:text-cinnabar">
              Back to Store
            </Link>
            <Link href="/merchant/login" className="text-sm text-ink underline underline-offset-4 hover:text-cinnabar">
              Merchant Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-ink">Become a FuBao Merchant</h1>
          <p className="mt-3 text-smoke leading-relaxed">
            Join a curated marketplace for Taoist cultural artifacts. Share your
            craft with collectors around the world.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-md p-6 md:p-8">
          {error && (
            <p className="border border-cinnabar/30 bg-cinnabar/5 text-cinnabar px-4 py-2 text-sm">
              {error}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">Shop Name *</span>
              <input
                type="text"
                required
                minLength={2}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
                placeholder="e.g. Qingyun Artifacts"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Contact Name *</span>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
                placeholder="Your full name"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">Contact Email *</span>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Phone</span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium text-ink">Country *</span>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">City *</span>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar"
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-ink">Specialties</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => {
                const active = specialties.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                        : 'border-border bg-paper text-smoke hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ink">Business Description *</span>
            <textarea
              required
              minLength={20}
              rows={4}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-cinnabar resize-y"
              placeholder="Tell us about your craft, sourcing, and cultural focus (min 20 characters)"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-cinnabar text-paper py-3 text-sm font-medium tracking-widest uppercase hover:bg-cinnabar/90 disabled:opacity-50 transition-colors rounded-sm"
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>

          <p className="text-xs text-smoke text-center leading-relaxed">
            By applying, you agree to FuBao&apos;s merchant terms. All artifacts must
            be authentic cultural works — no supernatural claims are permitted.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-smoke">
          Already a merchant?{' '}
          <Link href="/merchant/login" className="text-cinnabar underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

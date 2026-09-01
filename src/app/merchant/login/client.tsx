'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface DemoMerchant {
  email: string;
  password: string;
  name: string;
}

export default function MerchantLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoMerchants: DemoMerchant[] = [
    { email: 'merchant@fubao.com', password: 'merchant123', name: 'Qingyun Temple Crafts' },
    { email: 'craftsman@fubao.com', password: 'craft123', name: 'Li Family Talisman Workshop' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/merchant/dashboard');
      } else {
        setError(result.error ?? 'Invalid email or password.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (m: DemoMerchant) => {
    setEmail(m.email);
    setPassword(m.password);
    setError('');
    setLoading(true);
    try {
      const result = await login(m.email, m.password);
      if (result.success) {
        router.push('/merchant/dashboard');
      } else {
        setError(result.error ?? 'Quick login failed.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-cinnabar/30 bg-jade text-cinnabar font-serif text-xl">
              符
            </span>
            <span className="font-serif text-2xl tracking-wide text-ink group-hover:text-cinnabar transition-colors">
              FuBao
            </span>
          </Link>
          <h1 className="mt-6 font-serif text-3xl text-ink">Merchant Portal</h1>
          <p className="mt-2 text-sm text-smoke">
            Sign in to manage your shop, orders and settlements.
          </p>
        </div>

        <div className="rounded-md border border-ink/10 bg-card p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@fubao.com"
                className="w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 text-ink placeholder:text-smoke/50 focus:outline-none focus:ring-1 focus:ring-cinnabar focus:border-cinnabar transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-sm border border-ink/15 bg-paper px-3 py-2.5 pr-16 text-ink placeholder:text-smoke/50 focus:outline-none focus:ring-1 focus:ring-cinnabar focus:border-cinnabar transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-smoke hover:text-cinnabar transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-sm border border-cinnabar/30 bg-cinnabar/5 px-3 py-2 text-sm text-cinnabar">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-cinnabar px-4 py-2.5 text-sm font-medium text-paper hover:bg-cinnabar/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-ink/10 pt-6">
            <p className="text-xs font-medium text-smoke mb-3">
              Demo merchant accounts — one click to sign in:
            </p>
            <div className="space-y-2">
              {demoMerchants.map((m) => (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => handleQuickLogin(m)}
                  disabled={loading}
                  className="w-full flex items-center justify-between rounded-sm border border-ink/10 bg-paper px-3 py-2.5 text-left hover:border-cinnabar/40 hover:bg-jade/50 disabled:opacity-60 transition-colors group"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink group-hover:text-cinnabar transition-colors">
                      {m.name}
                    </span>
                    <span className="block text-xs text-smoke">{m.email}</span>
                  </span>
                  <span className="text-xs text-cinnabar opacity-0 group-hover:opacity-100 transition-opacity">
                    Sign in →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-smoke">
            Want to join as a merchant?{' '}
            <Link href="/merchant/apply" className="text-cinnabar hover:underline">
              Apply for a shop
            </Link>
          </p>
          <p className="text-sm text-smoke">
            Customer account?{' '}
            <Link href="/login" className="text-cinnabar hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

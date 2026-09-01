'use client';

import { useState } from 'react';
import { verifyCode } from '@/lib/api';
import type { VerificationRecord } from '@/lib/data/types';
import { ShieldCheck, ShieldX, Loader2 } from 'lucide-react';

export function VerifyClient() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setSearched(true);
    const record = await verifyCode(code.trim());
    setResult(record);
    setLoading(false);
  };

  return (
    <div>
      {/* Input */}
      <div className="mb-8">
        <label
          htmlFor="code"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink"
        >
          Talisman Code
        </label>
        <div className="flex gap-3">
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="FB-2026-XXXXXX"
            className="flex-1 border border-border bg-transparent px-4 py-3 font-mono text-sm tracking-wider text-ink placeholder:text-smoke/40 focus:border-cinnabar focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerify();
            }}
          />
          <button
            onClick={handleVerify}
            disabled={loading || !code.trim()}
            className="border border-cinnabar bg-cinnabar px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cinnabar/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-smoke">
          Format: FB-2026-XXXXXX (found on your certificate)
        </p>
      </div>

      {/* Result */}
      {searched && !loading && (
        <div className="animate-fade-in-up">
          {result ? (
            <div className="border border-cinnabar/30 bg-jade/30 p-8">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-cinnabar" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    Certificate Verified
                  </p>
                  <p className="text-xs text-smoke">
                    This talisman has been authenticated
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Talisman
                    </p>
                    <p className="mt-1 font-serif text-lg text-ink">
                      {result.productName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Master
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      {result.master}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Consecration Date
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      {result.consecrationDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      {result.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Sealing Number
                    </p>
                    <p className="mt-1 font-mono text-sm text-ink">
                      {result.sealingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-smoke">
                      Code
                    </p>
                    <p className="mt-1 font-mono text-sm text-ink">
                      {result.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 text-center">
                <p className="font-serif text-xs italic text-smoke">
                  This certificate confirms the authenticity of your FuBao
                  talisman, consecrated through the traditional seven-step
                  ritual at Qingyun Temple, Hong Kong.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-jade/30 p-8 text-center">
              <ShieldX className="mx-auto mb-4 h-8 w-8 text-smoke/40" />
              <p className="text-sm font-medium text-ink">
                Code Not Found
              </p>
              <p className="mt-2 text-sm text-smoke">
                We couldn&apos;t find a talisman with this code. Please
                double-check the code on your certificate and try again.
              </p>
              <p className="mt-4 text-xs text-smoke">
                If you continue to have issues, please contact{' '}
                <a
                  href="mailto:hello@fubao.co"
                  className="text-cinnabar underline"
                >
                  hello@fubao.co
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sample codes */}
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs text-smoke">
          Try sample codes:{' '}
          <button
            onClick={() => setCode('FB-2026-000001')}
            className="font-mono text-cinnabar underline"
          >
            FB-2026-000001
          </button>
          ,{' '}
          <button
            onClick={() => setCode('FB-2026-000002')}
            className="font-mono text-cinnabar underline"
          >
            FB-2026-000002
          </button>
        </p>
      </div>
    </div>
  );
}

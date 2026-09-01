'use client';

import { useEffect } from 'react';

/**
 * RefCapture — captures referral codes from ?ref= query params.
 *
 * On any page load with ?ref=<code>:
 *  1. Fires POST /api/distribution/track (registers the click, 30-day cookie)
 *  2. Stores the code in localStorage (`fubao_ref_code`) so the register
 *     flow can attach it (referral attribution happens server-side at
 *     registration via referredBy)
 *  3. Cleans the URL (replaces state so the code isn't shared onward)
 *
 * Renders nothing. Mounted once in the root layout.
 */
export function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (!ref || ref.length > 32) return;

      // Register the click (best-effort — failure must not break navigation).
      fetch('/api/distribution/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref }),
      }).catch(() => undefined);

      window.localStorage.setItem('fubao_ref_code', ref);

      // Strip ?ref= from the address bar without reloading.
      params.delete('ref');
      const qs = params.toString();
      const clean = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', clean);
    } catch {
      // localStorage unavailable (private mode etc.) — referral simply won't attach.
    }
  }, []);

  return null;
}

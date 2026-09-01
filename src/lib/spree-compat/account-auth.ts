/**
 * Shared auth resolution for Spree v2 /account endpoints.
 *
 * Real Spree clients authenticate with `Authorization: Bearer <JWT>` (obtained
 * from POST /spree_oauth/token). The FuBao storefront itself runs in the
 * browser, where the JWT lives in an httpOnly cookie set by /api/auth/login —
 * JavaScript cannot read it to set the header. So these endpoints accept both:
 *
 *   1. Authorization: Bearer <token>  (Spree contract)
 *   2. fubao_token session cookie      (FuBao storefront browser sessions)
 */

import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';

export async function requireSpreeUser(request: NextRequest) {
  // 1. Spree-style Bearer token.
  const authHeader = request.headers.get('Authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (bearerToken) {
    const payload = await verifyToken(bearerToken);
    if (payload?.sub) {
      const user = await getUserById(payload.sub);
      if (user) return user;
    }
  }

  // 2. FuBao session cookie (httpOnly — browser same-origin requests).
  const session = await getSession();
  if (session?.sub) {
    const user = await getUserById(session.sub);
    if (user) return user;
  }

  return null;
}

/**
 * Spree Commerce API v2 — Token generation (spree_oauth).
 *
 * POST /api/v2/storefront/spree_oauth/token
 *   grant_type=password       → authenticate user, issue access + refresh JWT
 *   grant_type=refresh_token  → verify refresh token, mint new pair
 *
 * Accepts both JSON and application/x-www-form-urlencoded bodies (OAuth spec).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/user-store';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/auth/jwt';

interface TokenRequest {
  grant_type?: string;
  username?: string;
  password?: string;
  refresh_token?: string;
}

async function parseBody(request: NextRequest): Promise<TokenRequest> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    return (await request.json()) as TokenRequest;
  }
  const form = await request.formData();
  const obj: TokenRequest = {};
  for (const key of ['grant_type', 'username', 'password', 'refresh_token']) {
    const value = form.get(key);
    if (typeof value === 'string') obj[key as keyof TokenRequest] = value;
  }
  return obj;
}

function tokenResponse(accessToken: string, refreshToken: string) {
  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 86400,
    refresh_token: refreshToken,
    scope: 'store',
    created_at: Math.floor(Date.now() / 1000),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    const grantType = body.grant_type ?? 'password';

    if (grantType === 'password') {
      const username = body.username?.trim();
      const password = body.password ?? '';
      if (!username || !password) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'The provided authorization grant is invalid: username and password are required.',
          },
          { status: 400 }
        );
      }

      const user = await authenticateUser(username, password);
      if (!user) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'The provided authorization grant is invalid: email or password is incorrect.',
          },
          { status: 400 }
        );
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = await signAccessToken(payload);
      const refreshToken = await signRefreshToken(payload);
      return tokenResponse(accessToken, refreshToken);
    }

    if (grantType === 'refresh_token') {
      const refreshToken = body.refresh_token ?? '';
      const payload = await verifyToken(refreshToken);
      if (!payload?.sub) {
        return NextResponse.json(
          {
            error: 'invalid_grant',
            error_description: 'The refresh token is invalid or expired.',
          },
          { status: 400 }
        );
      }

      const tokenPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      const accessToken = await signAccessToken(tokenPayload);
      const newRefreshToken = await signRefreshToken(tokenPayload);
      return tokenResponse(accessToken, newRefreshToken);
    }

    return NextResponse.json(
      { error: 'unsupported_grant_type', error_description: 'Use password or refresh_token.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
}

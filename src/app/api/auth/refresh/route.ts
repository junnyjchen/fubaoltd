import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('fubao_refresh')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const newAccessToken = await signAccessToken({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    const response = NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken, expiresIn: 86400 },
    });

    response.cookies.set('fubao_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

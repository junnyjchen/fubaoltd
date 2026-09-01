import { cookies } from 'next/headers';
import { verifyToken, type TokenPayload } from './jwt';

const COOKIE_NAME = 'fubao_token';

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(...roles: string[]): Promise<TokenPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  return session;
}

export { COOKIE_NAME };

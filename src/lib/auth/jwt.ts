import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_FALLBACK_SECRET = 'fubao-dev-secret-key-change-in-production-2025';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || JWT_FALLBACK_SECRET
);

// 仓库公开后兜底密钥已非秘密：生产环境漏配 JWT_SECRET 时高声告警并拒绝签发。
// 部署脚本 install.sh 会自动生成随机密钥并注入 —— 触发此错误说明 env 未生效。
const jwtInsecure = !process.env.JWT_SECRET && process.env.NODE_ENV === 'production';
if (jwtInsecure) {
  console.error(
    '[fubao/security] FATAL: JWT_SECRET is not set in production. ' +
      'Refusing to sign tokens with the public fallback secret. ' +
      'Set JWT_SECRET in deploy/fubao.env (see deploy/install.sh).'
  );
}

const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  if (jwtInsecure) throw new Error('JWT_SECRET not configured in production');
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  if (jwtInsecure) throw new Error('JWT_SECRET not configured in production');
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Simple password hashing (in production, use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fubao-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

export function generateId(): string {
  return `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function generateReferralCode(): string {
  return `FB${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

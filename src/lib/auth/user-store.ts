import type { User } from './types';
import { hashPassword, verifyPassword, generateId, generateReferralCode } from './jwt';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Postgres-backed user store.
//
// Auth remains self-hosted (email/password, SHA-256 hash, JWT session cookie) —
// Supabase Auth is NOT used. All reads/writes go through the service_role client
// (`getSupabaseClient()` with no token), which bypasses RLS; the `users` table is
// RLS-enabled with no policies so anonymous/authenticated roles are locked out.
//
// The exported function signatures match the previous in-memory store exactly so
// all 17+ route modules that import this file continue to work unchanged.

type StoredRow = Record<string, unknown>;

function rowToUser(row: StoredRow | null): User | null {
  if (!row) return null;
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    avatar: (row.avatar as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    country: (row.country as string) ?? undefined,
    role: row.role as User['role'],
    status: row.status as User['status'],
    emailVerified: Boolean(row.email_verified),
    points: Number(row.points ?? 0),
    level: row.level as User['level'],
    referralCode: row.referral_code as string,
    referredBy: (row.referred_by as string) ?? undefined,
    walletBalance: Number(row.wallet_balance ?? 0),
    walletCurrency: (row.wallet_currency as string) ?? 'USD',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const COLUMN_MAP: Record<keyof User, string> = {
  id: 'id',
  email: 'email',
  name: 'name',
  avatar: 'avatar',
  phone: 'phone',
  country: 'country',
  role: 'role',
  status: 'status',
  emailVerified: 'email_verified',
  points: 'points',
  level: 'level',
  referralCode: 'referral_code',
  referredBy: 'referred_by',
  walletBalance: 'wallet_balance',
  walletCurrency: 'wallet_currency',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

function toColumnSet(updates: Partial<User>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    const column = (COLUMN_MAP as Record<string, string>)[key] ?? key;
    // passwordHash is intentionally never writable via this path
    if (column === 'password_hash') continue;
    row[column] = value;
  }
  return row;
}

interface SeedRow {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  email_verified: boolean;
  points: number;
  level: string;
  referral_code: string;
  wallet_balance: number;
  wallet_currency: string;
  password_hash: string;
}

// Seed the four demo accounts only when the users table is empty. Best-effort:
// seeding must never crash the process (e.g. during build where env may be absent),
// but all CRUD functions below still throw real DB errors — no mock fallbacks.
async function seedIfNeeded(): Promise<void> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('users').select('id').limit(1);
    if (error) throw error;
    if (data && data.length > 0) return;

    const [demoPasswordHash, merchantHash, craftsmanHash, adminHash] = await Promise.all([
      hashPassword('demo123'),
      hashPassword('merchant123'),
      hashPassword('craft123'),
      hashPassword('admin123'),
    ]);

    const seeds: SeedRow[] = [
      {
        id: 'usr-demo-001',
        email: 'demo@fubao.com',
        name: 'Demo User',
        role: 'customer',
        status: 'active',
        email_verified: true,
        points: 500,
        level: 'silver',
        referral_code: 'FBDEMO01',
        wallet_balance: 0,
        wallet_currency: 'USD',
        password_hash: demoPasswordHash,
      },
      {
        id: 'usr-merchant-001',
        email: 'merchant@fubao.com',
        name: 'Qingyun Temple Crafts',
        role: 'merchant',
        status: 'active',
        email_verified: true,
        points: 0,
        level: 'bronze',
        referral_code: 'FBMCH001',
        wallet_balance: 0,
        wallet_currency: 'USD',
        password_hash: merchantHash,
      },
      {
        id: 'usr-merchant-002',
        email: 'craftsman@fubao.com',
        name: 'Li Family Talisman Workshop',
        role: 'merchant',
        status: 'active',
        email_verified: true,
        points: 0,
        level: 'bronze',
        referral_code: 'FBMCH002',
        wallet_balance: 0,
        wallet_currency: 'USD',
        password_hash: craftsmanHash,
      },
      {
        id: 'usr-admin-001',
        email: 'admin@fubao.com',
        name: 'FuBao Admin',
        role: 'admin',
        status: 'active',
        email_verified: true,
        points: 0,
        level: 'bronze',
        referral_code: 'FBADM001',
        wallet_balance: 0,
        wallet_currency: 'USD',
        password_hash: adminHash,
      },
    ];

    const { error: insError } = await client.from('users').insert(seeds);
    if (insError) throw insError;
    console.log('[user-store] seeded demo accounts into Postgres');
  } catch (e) {
    console.error('[user-store] seed skipped/failed (env may be absent during build):', e);
  }
}

await seedIfNeeded();

export async function createUser(
  email: string,
  password: string,
  name: string,
  referredBy?: string
): Promise<User> {
  const client = getSupabaseClient();

  const existing = await client.from('users').select('id').eq('email', email).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) throw new Error('Email already registered');

  const passwordHash = await hashPassword(password);
  const row = {
    id: generateId(),
    email,
    name,
    role: 'customer',
    status: 'active',
    email_verified: false,
    points: 100, // Welcome bonus
    level: 'bronze',
    referral_code: generateReferralCode(),
    referred_by: referredBy ?? null,
    wallet_balance: 0,
    wallet_currency: 'USD',
    password_hash: passwordHash,
  };

  const { data, error } = await client.from('users').insert(row).select().single();
  if (error) throw error;
  const user = rowToUser(data);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const isValid = await verifyPassword(password, data.password_hash as string);
  if (!isValid) return null;
  return rowToUser(data);
}

export async function getUserById(id: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return rowToUser(data);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return rowToUser(data);
}

export async function getUserByReferralCode(code: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle();
  if (error) throw error;
  return rowToUser(data);
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | null> {
  const client = getSupabaseClient();
  const row = toColumnSet(updates);
  if (Object.keys(row).length === 0) {
    return getUserById(id);
  }
  row.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from('users')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToUser(data);
}

export async function addPoints(id: string, points: number): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const newPoints = Number(data.points ?? 0) + points;
  let level = 'bronze';
  if (newPoints >= 5000) level = 'platinum';
  else if (newPoints >= 2000) level = 'gold';
  else if (newPoints >= 500) level = 'silver';

  const { data: updated, error: updError } = await client
    .from('users')
    .update({ points: newPoints, level, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (updError) throw updError;
  return rowToUser(updated);
}
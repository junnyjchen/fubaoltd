import type { User } from './types';
import { hashPassword, verifyPassword, generateId, generateReferralCode } from './jwt';

// In-memory user store (replace with database in production)
const users: Map<string, User & { passwordHash: string }> = new Map();

// Seed a demo user
const demoPasswordHash = await hashPassword('demo123');
users.set('demo@fubao.com', {
  id: 'usr-demo-001',
  email: 'demo@fubao.com',
  name: 'Demo User',
  role: 'customer',
  status: 'active',
  emailVerified: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  points: 500,
  level: 'silver',
  referralCode: 'FBDEMO01',
  walletBalance: 0,
  walletCurrency: 'USD',
  passwordHash: demoPasswordHash,
});

export async function createUser(
  email: string,
  password: string,
  name: string,
  referredBy?: string
): Promise<User> {
  if (users.has(email)) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const id = generateId();
  const referralCode = generateReferralCode();

  const user: User & { passwordHash: string } = {
    id,
    email,
    name,
    role: 'customer',
    status: 'active',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    points: 100, // Welcome bonus
    level: 'bronze',
    referralCode,
    referredBy,
    walletBalance: 0,
    walletCurrency: 'USD',
    passwordHash,
  };

  users.set(email, user);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = users.get(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string): Promise<User | null> {
  for (const user of users.values()) {
    if (user.id === id) {
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = users.get(email);
  if (!user) return null;
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | null> {
  for (const [email, user] of users.entries()) {
    if (user.id === id) {
      const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
      users.set(email, updated);
      const { passwordHash: _, ...userWithoutPassword } = updated;
      return userWithoutPassword;
    }
  }
  return null;
}

export async function addPoints(id: string, points: number): Promise<User | null> {
  for (const [email, user] of users.entries()) {
    if (user.id === id) {
      user.points += points;
      // Level up logic
      if (user.points >= 5000) user.level = 'platinum';
      else if (user.points >= 2000) user.level = 'gold';
      else if (user.points >= 500) user.level = 'silver';
      user.updatedAt = new Date().toISOString();
      users.set(email, user);
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
}

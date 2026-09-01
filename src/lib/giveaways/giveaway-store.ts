import type { Giveaway, GiveawayWinner } from './types';

// In-memory store
const giveaways: Map<string, Giveaway> = new Map();

// Seed demo giveaways
const demoGiveaways: Giveaway[] = [
  {
    id: 'giveaway-001',
    title: 'Spring Equinox Blessing Box',
    description: 'Celebrate the spring equinox with our limited edition Energy Blessing Box. Share your spiritual journey and win!',
    productName: 'Energy Blessing Box',
    productSlug: 'energy-blessing-box',
    totalPrizes: 3,
    claimedCount: 1,
    status: 'active',
    startDate: '2025-03-01',
    endDate: '2026-12-31',
    requirements: { mustBeVerified: true },
    winners: [
      { id: 'w-001', userId: 'usr-demo-001', userName: 'Demo User', claimedAt: '2025-03-15', prizeFulfilled: true },
    ],
    createdAt: '2025-02-15',
  },
  {
    id: 'giveaway-002',
    title: 'New User Welcome Gift',
    description: 'New to FuBao? Get a free Protection Talisman when you create your account and make your first purchase!',
    productName: 'Protection Talisman',
    productSlug: 'protection-talisman',
    totalPrizes: 50,
    claimedCount: 12,
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    requirements: {},
    winners: [],
    createdAt: '2025-01-01',
  },
];
demoGiveaways.forEach(g => giveaways.set(g.id, g));

export function getActiveGiveaways(): Giveaway[] {
  return Array.from(giveaways.values()).filter(g => g.status === 'active');
}

export function getAllGiveaways(): Giveaway[] {
  return Array.from(giveaways.values());
}

export function getGiveaway(id: string): Giveaway | null {
  return giveaways.get(id) || null;
}

export function claimGiveaway(giveawayId: string, userId: string, userName: string): { success: boolean; error?: string } {
  const giveaway = giveaways.get(giveawayId);
  if (!giveaway) return { success: false, error: 'Giveaway not found' };
  if (giveaway.status !== 'active') return { success: false, error: 'Giveaway is not active' };
  if (giveaway.claimedCount >= giveaway.totalPrizes) return { success: false, error: 'All prizes claimed' };

  // Check if already claimed
  const alreadyClaimed = giveaway.winners.some(w => w.userId === userId);
  if (alreadyClaimed) return { success: false, error: 'Already claimed' };

  const winner: GiveawayWinner = {
    id: `winner-${Date.now()}`,
    userId,
    userName,
    claimedAt: new Date().toISOString(),
    prizeFulfilled: false,
  };

  giveaway.winners.push(winner);
  giveaway.claimedCount++;

  if (giveaway.claimedCount >= giveaway.totalPrizes) {
    giveaway.status = 'ended';
  }

  return { success: true };
}

export function createGiveaway(data: Omit<Giveaway, 'id' | 'claimedCount' | 'winners' | 'createdAt'>): Giveaway {
  const giveaway: Giveaway = {
    ...data,
    id: `giveaway-${Date.now()}`,
    claimedCount: 0,
    winners: [],
    createdAt: new Date().toISOString(),
  };
  giveaways.set(giveaway.id, giveaway);
  return giveaway;
}

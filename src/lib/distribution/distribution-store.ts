import type { AffiliateLink, Commission, DistributionConfig } from './types';
import { DEFAULT_CONFIG } from './types';

// Stores persisted on globalThis so all route modules share one instance in dev
const globalStore = globalThis as unknown as {
  __fubaoAffiliateLinks?: Map<string, AffiliateLink>;
  __fubaoCommissions?: Map<string, Commission>;
  __fubaoDistributionConfig?: DistributionConfig;
};
const affiliateLinks: Map<string, AffiliateLink> = (globalStore.__fubaoAffiliateLinks ??= new Map());
const commissions: Map<string, Commission> = (globalStore.__fubaoCommissions ??= new Map());
let config: DistributionConfig = (globalStore.__fubaoDistributionConfig ??= { ...DEFAULT_CONFIG });

export function getConfig(): DistributionConfig { return config; }
export function updateConfig(updates: Partial<DistributionConfig>): DistributionConfig {
  config = { ...config, ...updates };
  globalStore.__fubaoDistributionConfig = config;
  return config;
}

export function getOrCreateAffiliateLink(userId: string, code: string): AffiliateLink {
  const existing = Array.from(affiliateLinks.values()).find(l => l.userId === userId);
  if (existing) return existing;

  const link: AffiliateLink = {
    id: `aff-${Date.now()}`,
    userId,
    code,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    createdAt: new Date().toISOString(),
  };
  affiliateLinks.set(link.id, link);
  return link;
}

export function recordClick(code: string): void {
  const link = Array.from(affiliateLinks.values()).find(l => l.code === code);
  if (link) link.totalClicks++;
}

export function calculateCommission(orderId: string, orderAmount: number, affiliateUserId: string, parentUserId?: string): Commission[] {
  const result: Commission[] = [];
  const link = Array.from(affiliateLinks.values()).find(l => l.userId === affiliateUserId);
  if (!link) return result;

  // Level 1 commission
  const level1Amount = orderAmount * (config.level1Rate / 100);
  const comm1: Commission = {
    id: `comm-${Date.now()}-1`,
    affiliateId: affiliateUserId,
    orderId,
    orderAmount,
    commissionRate: config.level1Rate,
    commissionAmount: Math.round(level1Amount * 100) / 100,
    level: 1,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  commissions.set(comm1.id, comm1);
  result.push(comm1);
  link.totalConversions++;
  link.totalEarnings += comm1.commissionAmount;

  // Level 2 commission (if parent exists)
  if (parentUserId) {
    const parentLink = Array.from(affiliateLinks.values()).find(l => l.userId === parentUserId);
    if (parentLink) {
      const level2Amount = orderAmount * (config.level2Rate / 100);
      const comm2: Commission = {
        id: `comm-${Date.now()}-2`,
        affiliateId: parentUserId,
        orderId,
        orderAmount,
        commissionRate: config.level2Rate,
        commissionAmount: Math.round(level2Amount * 100) / 100,
        level: 2,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      commissions.set(comm2.id, comm2);
      result.push(comm2);
      parentLink.totalEarnings += comm2.commissionAmount;
    }
  }

  return result;
}

export function getUserCommissions(userId: string): Commission[] {
  return Array.from(commissions.values()).filter(c => c.affiliateId === userId);
}

export function hasCommissionForOrder(orderId: string): boolean {
  return Array.from(commissions.values()).some(c => c.orderId === orderId);
}

export function getAffiliateLink(userId: string): AffiliateLink | null {
  return Array.from(affiliateLinks.values()).find(l => l.userId === userId) || null;
}

export function getPendingWithdrawals(): Commission[] {
  return Array.from(commissions.values()).filter(c => c.status === 'pending');
}

export function confirmCommission(commissionId: string): Commission | null {
  const comm = commissions.get(commissionId);
  if (comm) comm.status = 'confirmed';
  return comm || null;
}

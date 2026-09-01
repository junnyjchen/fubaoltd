// Distribution / Affiliate types
export interface AffiliateLink {
  id: string;
  userId: string;
  code: string; // unique referral code
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  orderAmount: number;
  commissionRate: number; // percentage
  commissionAmount: number;
  level: number; // 1 = direct, 2 = indirect
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface DistributionConfig {
  level1Rate: number; // Direct referral commission %
  level2Rate: number; // Indirect referral commission %
  minWithdrawAmount: number;
  withdrawFee: number;
  cookieDuration: number; // days
}

export const DEFAULT_CONFIG: DistributionConfig = {
  level1Rate: 10,
  level2Rate: 3,
  minWithdrawAmount: 20,
  withdrawFee: 1,
  cookieDuration: 30,
};

import type { Coupon, UserCoupon, CouponValidation } from './types';

// In-memory stores
const coupons: Map<string, Coupon> = new Map();
const userCoupons: Map<string, UserCoupon[]> = new Map();

// Seed demo coupons
const demoCoupons: Coupon[] = [
  {
    id: 'coupon-001', code: 'WELCOME10', type: 'percentage', value: 10,
    minOrderAmount: 20, validFrom: '2025-01-01', validUntil: '2026-12-31',
    usageLimit: 1000, usedCount: 42, perUserLimit: 1, isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'coupon-002', code: 'SAVE5', type: 'fixed', value: 5,
    minOrderAmount: 30, validFrom: '2025-01-01', validUntil: '2026-12-31',
    usageLimit: 500, usedCount: 15, perUserLimit: 3, isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'coupon-003', code: 'FREESHIP', type: 'free_shipping', value: 12.99,
    minOrderAmount: 50, validFrom: '2025-01-01', validUntil: '2026-12-31',
    usageLimit: 200, usedCount: 8, perUserLimit: 2, isActive: true, createdAt: '2025-01-01',
  },
  {
    id: 'coupon-004', code: 'VIP20', type: 'percentage', value: 20,
    minOrderAmount: 100, maxDiscount: 50, validFrom: '2025-01-01', validUntil: '2026-12-31',
    usageLimit: 100, usedCount: 3, perUserLimit: 1, applicableCategories: ['Gift Sets'],
    isActive: true, createdAt: '2025-01-01',
  },
];
demoCoupons.forEach(c => coupons.set(c.code, c));

export function validateCoupon(code: string, orderAmount: number, userId?: string, category?: string): CouponValidation {
  const coupon = coupons.get(code.toUpperCase());
  if (!coupon) return { valid: false, discount: 0, error: 'Invalid coupon code' };
  if (!coupon.isActive) return { valid: false, discount: 0, error: 'Coupon is no longer active' };

  const now = new Date();
  if (now < new Date(coupon.validFrom)) return { valid: false, discount: 0, error: 'Coupon not yet valid' };
  if (now > new Date(coupon.validUntil)) return { valid: false, discount: 0, error: 'Coupon has expired' };
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return { valid: false, discount: 0, error: `Minimum order amount: $${coupon.minOrderAmount}` };
  }

  // Check per-user limit
  if (userId) {
    const userCouponList = userCoupons.get(userId)?.filter(uc => uc.couponId === coupon.id) || [];
    if (userCouponList.length >= coupon.perUserLimit) {
      return { valid: false, discount: 0, error: 'You have already used this coupon' };
    }
  }

  // Check category restriction
  if (coupon.applicableCategories?.length && category && !coupon.applicableCategories.includes(category)) {
    return { valid: false, discount: 0, error: `Only applicable for: ${coupon.applicableCategories.join(', ')}` };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = orderAmount * (coupon.value / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, orderAmount);
  } else if (coupon.type === 'free_shipping') {
    discount = coupon.value;
  }

  return { valid: true, coupon, discount: Math.round(discount * 100) / 100 };
}

export function claimCoupon(code: string, userId: string): { success: boolean; error?: string } {
  const coupon = coupons.get(code.toUpperCase());
  if (!coupon) return { success: false, error: 'Invalid coupon code' };
  if (!coupon.isActive) return { success: false, error: 'Coupon not available' };

  if (!userCoupons.has(userId)) userCoupons.set(userId, []);
  const list = userCoupons.get(userId)!;
  const existing = list.filter(uc => uc.couponId === coupon.id);
  if (existing.length >= coupon.perUserLimit) return { success: false, error: 'Already claimed' };

  list.push({
    id: `uc-${Date.now()}`,
    couponId: coupon.id,
    userId,
    claimedAt: new Date().toISOString(),
  });

  return { success: true };
}

export function useCoupon(code: string, userId: string, orderId: string): boolean {
  const coupon = coupons.get(code.toUpperCase());
  if (!coupon) return false;

  coupon.usedCount++;
  const list = userCoupons.get(userId);
  if (list) {
    const uc = list.find(uc => uc.couponId === coupon.id && !uc.usedAt);
    if (uc) { uc.usedAt = new Date().toISOString(); uc.orderId = orderId; }
  }
  return true;
}

export function getUserCoupons(userId: string): (Coupon & { claimedAt: string; used: boolean })[] {
  const list = userCoupons.get(userId) || [];
  return list.map(uc => {
    const coupon = Array.from(coupons.values()).find(c => c.id === uc.couponId);
    if (!coupon) return null;
    return { ...coupon, claimedAt: uc.claimedAt, used: !!uc.usedAt };
  }).filter(Boolean) as (Coupon & { claimedAt: string; used: boolean })[];
}

export function getAllCoupons(): Coupon[] {
  return Array.from(coupons.values());
}

export function createCoupon(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon {
  const coupon: Coupon = { ...data, id: `coupon-${Date.now()}`, usedCount: 0, createdAt: new Date().toISOString() };
  coupons.set(coupon.code, coupon);
  return coupon;
}

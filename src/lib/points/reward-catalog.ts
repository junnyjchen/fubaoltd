// Points redemption reward catalog — pure constants, client-safe.
// Each coupon reward mints a personal coupon (isPersonal) via the coupon engine
// when redeemed, so the code is honored by the live cart promo validation.

export interface PointReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  /** Coupon shape minted on redemption */
  couponType: 'percentage' | 'fixed' | 'free_shipping';
  /** percent (15 = 15%) for percentage, USD amount for fixed, shipping value for free_shipping */
  couponValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  /** Days the minted coupon stays valid */
  validityDays: number;
}

export const POINTS_REWARDS: PointReward[] = [
  {
    id: 'pts-2off',
    title: '$2 OFF Coupon',
    description: 'A small thank-you token — $2 off any order of $10 or more. New members can redeem it right away with their welcome bonus.',
    pointsCost: 100,
    couponType: 'fixed',
    couponValue: 2,
    minOrderAmount: 10,
    validityDays: 90,
  },
  {
    id: 'pts-5off',
    title: '$5 OFF Coupon',
    description: 'Five dollars off orders of $30 or more — the classic saver.',
    pointsCost: 400,
    couponType: 'fixed',
    couponValue: 5,
    minOrderAmount: 30,
    validityDays: 90,
  },
  {
    id: 'pts-freeship',
    title: 'Free Shipping Coupon',
    description: 'We cover standard shipping on orders of $40 or more.',
    pointsCost: 700,
    couponType: 'free_shipping',
    couponValue: 12.99,
    minOrderAmount: 40,
    validityDays: 90,
  },
  {
    id: 'pts-15pct',
    title: '15% OFF Coupon',
    description: 'Fifteen percent off orders of $60 or more (up to $25 off).',
    pointsCost: 1200,
    couponType: 'percentage',
    couponValue: 15,
    minOrderAmount: 60,
    maxDiscount: 25,
    validityDays: 90,
  },
  {
    id: 'pts-25pct',
    title: '25% OFF Coupon',
    description: 'The collector\u2019s reward — 25% off orders of $120 or more (up to $60 off).',
    pointsCost: 3000,
    couponType: 'percentage',
    couponValue: 25,
    minOrderAmount: 120,
    maxDiscount: 60,
    validityDays: 90,
  },
];

export function getRewardById(id: string): PointReward | undefined {
  return POINTS_REWARDS.find((r) => r.id === id);
}

/** Human label for the coupon a reward mints (mirrors coupons client copy). */
export function describeRewardCoupon(reward: PointReward): string {
  if (reward.couponType === 'percentage') return `${reward.couponValue}% OFF`;
  if (reward.couponType === 'free_shipping') return 'Free Shipping';
  return `$${reward.couponValue.toFixed(2)} OFF`;
}

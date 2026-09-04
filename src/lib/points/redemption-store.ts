// Points redemption store — persists on globalThis (see AGENTS.md store rule).
// redeemReward validates the balance, mints a PERSONAL coupon through the live
// coupon engine (so it is claimable/usable exactly once by this user), deducts
// the points, and records the redemption.

import { getUserById, addPoints } from '@/lib/auth/user-store';
import { createCoupon, claimCoupon } from '@/lib/coupons/coupon-store';
import { getRewardById, type PointReward } from './reward-catalog';

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  couponCode: string;
  redeemedAt: string;
}

const globalStore = globalThis as unknown as {
  __fubaoRedemptions?: Map<string, Redemption[]>;
};
const redemptions: Map<string, Redemption[]> = (globalStore.__fubaoRedemptions ??= new Map());

export type RedeemOutcome =
  | { ok: true; redemption: Redemption; pointsRemaining: number }
  | { ok: false; status: 400 | 404; error: string };

function mintPersonalCouponCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `PTS-${suffix}`;
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getRedemptionsForUser(userId: string): Redemption[] {
  return [...(redemptions.get(userId) ?? [])].sort(
    (a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
  );
}

export async function redeemReward(userId: string, rewardId: string): Promise<RedeemOutcome> {
  const reward: PointReward | undefined = getRewardById(rewardId);
  if (!reward) return { ok: false, status: 404, error: 'Reward not found' };

  const user = await getUserById(userId);
  if (!user) return { ok: false, status: 404, error: 'User not found' };

  if (user.points < reward.pointsCost) {
    const missing = reward.pointsCost - user.points;
    return { ok: false, status: 400, error: `Not enough points — ${missing} more needed.` };
  }

  // Mint the personal coupon (single-use, single-user) and claim it for this user.
  const code = mintPersonalCouponCode();
  createCoupon({
    code,
    type: reward.couponType,
    value: reward.couponValue,
    minOrderAmount: reward.minOrderAmount,
    maxDiscount: reward.maxDiscount,
    validFrom: isoDate(0),
    validUntil: isoDate(reward.validityDays),
    usageLimit: 1,
    perUserLimit: 1,
    isActive: true,
    isPersonal: true,
  });
  const claim = claimCoupon(code, userId);
  if (!claim.success) {
    return { ok: false, status: 400, error: 'Could not issue the coupon — please try again.' };
  }

  const updatedUser = await addPoints(userId, -reward.pointsCost);

  const redemption: Redemption = {
    id: `rd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsCost,
    couponCode: code,
    redeemedAt: new Date().toISOString(),
  };
  const list = redemptions.get(userId) ?? [];
  list.push(redemption);
  redemptions.set(userId, list);

  return { ok: true, redemption, pointsRemaining: updatedUser?.points ?? 0 };
}

import { calculateCommission, hasCommissionForOrder } from '@/lib/distribution/distribution-store';
import { getUserById, getUserByReferralCode } from '@/lib/auth/user-store';
import type { SpreeOrderState } from '@/lib/spree-compat/types';

/**
 * Records affiliate commission when an order completes.
 * Rules (mirrors distribution config):
 * - Buyer must be a registered user (order.userId)
 * - Buyer's referrer earns commission on the order item total (excluding shipping/promo)
 * - Self-referral not allowed; each order earns at most one commission
 * Fire-and-forget safe: never throws.
 */
export async function recordOrderCommission(order: SpreeOrderState): Promise<void> {
  try {
    if (!order.userId || order.itemTotal <= 0) return;
    if (hasCommissionForOrder(order.number)) return;

    const buyer = await getUserById(order.userId);
    if (!buyer?.referredBy) return;

    const referrer = await getUserByReferralCode(buyer.referredBy);
    if (!referrer || referrer.id === buyer.id) return;

    calculateCommission(order.number, order.itemTotal, referrer.id);
  } catch {
    // Commission tracking must never break checkout
  }
}

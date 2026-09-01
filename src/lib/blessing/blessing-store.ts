/**
 * Free Blessing (接福) claim store.
 *
 * One free blessing talisman per account — the claim records which
 * fulfillment method the guest chose:
 *  - pickup: completely free, collected on-site with a pickup code
 *  - mail:   the talisman is free, the guest only pays shipping
 *    (a Spree cart is prepared with the $0 blessing item)
 *
 * Persists on globalThis — see AGENTS.md "In-Memory Store Persistence Rule".
 */

export type BlessingMethod = 'pickup' | 'mail';

export interface BlessingClaim {
  userId: string;
  method: BlessingMethod;
  /** On-site pickup code (pickup method only), shown at the temple entrance */
  pickupCode?: string;
  /** Guest cart token holding the $0 blessing line item (mail method only) */
  cartToken?: string;
  status: 'claimed' | 'fulfilled';
  createdAt: string;
}

const globalStore = globalThis as unknown as {
  __fubaoBlessingClaims?: Map<string, BlessingClaim>;
};
const claimStore: Map<string, BlessingClaim> =
  globalStore.__fubaoBlessingClaims ??
  (globalStore.__fubaoBlessingClaims = new Map());

function generatePickupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FB-BLESS-${code}`;
}

export function getBlessingClaim(userId: string): BlessingClaim | null {
  return claimStore.get(userId) ?? null;
}

export function recordBlessingClaim(
  userId: string,
  method: BlessingMethod,
  cartToken?: string
): BlessingClaim {
  const claim: BlessingClaim = {
    userId,
    method,
    ...(method === 'pickup' ? { pickupCode: generatePickupCode() } : {}),
    ...(method === 'mail' && cartToken ? { cartToken } : {}),
    status: 'claimed',
    createdAt: new Date().toISOString(),
  };
  claimStore.set(userId, claim);
  return claim;
}

/** Persist the prepared cart token on a mail claim (idempotent re-prepare). */
export function attachCartToken(userId: string, cartToken: string): void {
  const claim = claimStore.get(userId);
  if (claim && claim.method === 'mail') {
    claim.cartToken = cartToken;
  }
}

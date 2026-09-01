/**
 * Free Blessing (接福) claim store.
 *
 * One free blessing talisman per account — the claim records which
 * fulfillment method the guest chose:
 *  - pickup: completely free, collected on-site with a pickup code
 *  - mail:   the talisman is free, the guest only pays shipping
 *    (a Spree cart is prepared with the $0 blessing line item)
 *
 * Also owns the admin-managed activity config (window, quota, pickup
 * details) — see /admin/blessing.
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

export interface BlessingConfig {
  /** Master switch — pause the whole activity without touching the schedule */
  active: boolean;
  /** Activity opens at (ISO string, null = no start limit) */
  startAt: string | null;
  /** Activity closes at (ISO string, null = no end limit) */
  endAt: string | null;
  /** Total claims allowed across all accounts (0 = unlimited) */
  totalQuota: number;
  /** On-site collection address shown to guests */
  pickupAddress: string;
  /** On-site collection hours shown to guests */
  pickupHours: string;
  /** Optional admin note surfaced on the blessing page */
  note: string;
}

export type BlessingWindowStatus =
  | 'open'
  | 'inactive'
  | 'not_started'
  | 'ended'
  | 'full';

export interface BlessingAvailability {
  status: BlessingWindowStatus;
  /** Human-readable reason for closed states, empty when open */
  message: string;
  /** Convenience flag — true only when new claims are accepted */
  claimable: boolean;
  /** Current activity config (window dates for countdowns, pickup details…) */
  config: BlessingConfig;
  /** Claims consumed so far (for progress display) */
  claimedCount: number;
}

const DEFAULT_CONFIG: BlessingConfig = {
  active: true,
  startAt: null,
  endAt: null,
  totalQuota: 0,
  pickupAddress: 'Qingyun Temple, 88 Mountain Gate Road, Hong Kong',
  pickupHours: 'Daily 9:00 AM – 5:00 PM',
  note: '',
};

const globalStore = globalThis as unknown as {
  __fubaoBlessingClaims?: Map<string, BlessingClaim>;
  __fubaoBlessingConfig?: BlessingConfig;
};
const claimStore: Map<string, BlessingClaim> =
  globalStore.__fubaoBlessingClaims ??
  (globalStore.__fubaoBlessingClaims = new Map());
const config: BlessingConfig =
  globalStore.__fubaoBlessingConfig ??
  (globalStore.__fubaoBlessingConfig = { ...DEFAULT_CONFIG });

function generatePickupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FB-BLESS-${code}`;
}

/* ------------------------------- config ------------------------------- */

export function getBlessingConfig(): BlessingConfig {
  return { ...config };
}

export function updateBlessingConfig(
  patch: Partial<BlessingConfig>
): BlessingConfig {
  if (typeof patch.active === 'boolean') config.active = patch.active;
  if (patch.startAt !== undefined) config.startAt = patch.startAt || null;
  if (patch.endAt !== undefined) config.endAt = patch.endAt || null;
  if (patch.totalQuota !== undefined) {
    const quota = Number(patch.totalQuota);
    if (Number.isFinite(quota) && quota >= 0) config.totalQuota = quota;
  }
  if (patch.pickupAddress !== undefined) config.pickupAddress = patch.pickupAddress;
  if (patch.pickupHours !== undefined) config.pickupHours = patch.pickupHours;
  if (patch.note !== undefined) config.note = patch.note;
  return { ...config };
}

export function resetBlessingConfig(): BlessingConfig {
  Object.assign(config, DEFAULT_CONFIG);
  return { ...config };
}

/* ------------------------------ availability --------------------------- */

/** Current window/quota state — checked before any new claim is recorded. */
export function checkBlessingAvailability(): BlessingAvailability {
  const now = Date.now();
  const base = { config: { ...config }, claimedCount: claimStore.size };
  if (!config.active) {
    return { status: 'inactive', message: 'This blessing event is currently paused.', claimable: false, ...base };
  }
  if (config.startAt && now < Date.parse(config.startAt)) {
    return { status: 'not_started', message: 'This blessing event has not started yet.', claimable: false, ...base };
  }
  if (config.endAt && now > Date.parse(config.endAt)) {
    return { status: 'ended', message: 'This blessing event has ended.', claimable: false, ...base };
  }
  if (config.totalQuota > 0 && claimStore.size >= config.totalQuota) {
    return { status: 'full', message: 'This blessing event is fully claimed.', claimable: false, ...base };
  }
  return { status: 'open', message: '', claimable: true, ...base };
}

/* -------------------------------- claims ------------------------------- */

export function getBlessingClaim(userId: string): BlessingClaim | null {
  return claimStore.get(userId) ?? null;
}

export function countBlessingClaims(): number {
  return claimStore.size;
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

/** All claims, newest first — admin listing. */
export function listBlessingClaims(): BlessingClaim[] {
  return Array.from(claimStore.values()).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

/** Mark a claim fulfilled — pickup code redeemed on-site or mail order shipped. */
export function redeemBlessingClaim(userId: string): BlessingClaim | null {
  const claim = claimStore.get(userId);
  if (!claim) return null;
  claim.status = 'fulfilled';
  return { ...claim };
}

/** Delete a claim — frees the account to claim again. */
export function deleteBlessingClaim(userId: string): boolean {
  return claimStore.delete(userId);
}

import { reviews as seedReviews } from '@/lib/data/products';
import type { Review } from '@/lib/data/types';
import { listOrdersForUser } from '@/lib/spree-compat/order-store';

// Review store persisted on globalThis — module-scoped state is NOT shared
// across route modules in dev, so every store in this project lives on
// globalThis (see AGENTS.md "In-Memory Store Persistence Rule").
// Internal review record — extends the public Review shape with the author's
// user id (used for one-review-per-user dedup; never serialized to clients).
type StoredReview = Review & { authorId?: string };

const globalStore = globalThis as unknown as { __fubaoReviews?: StoredReview[] };

function getStore(): StoredReview[] {
  const store = (globalStore.__fubaoReviews ??= [...seedReviews]);
  return store;
}

export function getReviewsForProduct(productSlug: string): Review[] {
  return getStore().filter((r) => r.productSlug === productSlug);
}

export function addReview(input: {
  productSlug: string;
  author: string;
  userId: string;
  rating: number;
  content: string;
  verifiedPurchase: boolean;
}): Review {
  const store = getStore();
  const review: StoredReview = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    authorId: input.userId,
    productSlug: input.productSlug,
    author: input.author,
    rating: input.rating,
    content: input.content,
    date: new Date().toISOString().slice(0, 10),
    verifiedPurchase: input.verifiedPurchase,
  };
  store.unshift(review);
  return review;
}

// A user "verified purchased" a product when any of their completed orders
// contains a line item for that product slug.
export function hasUserReviewed(productSlug: string, userId: string): boolean {
  return getStore().some(
    (r) => r.productSlug === productSlug && r.authorId === userId,
  );
}

export function hasVerifiedPurchase(userId: string, productSlug: string): boolean {
  return listOrdersForUser(userId).some(
    (order) =>
      (order.completedAt !== null || order.state === 'complete') &&
      order.lineItems.some((item) => item.slug === productSlug),
  );
}

export function getReviewStats(productSlug: string): { average: number; count: number } {
  const list = getReviewsForProduct(productSlug);
  if (list.length === 0) return { average: 0, count: 0 };
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / list.length) * 10) / 10, count: list.length };
}

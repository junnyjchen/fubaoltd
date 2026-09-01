import {
  createNotification,
  getUserNotifications,
} from './notification-store';
import type { SpreeOrderState } from '@/lib/spree-compat/types';

/**
 * Best-effort "Order Confirmed" notification for logged-in buyers.
 * Deduplicates by order number so confirm→complete calling this twice
 * only ever notifies once. Guest carts (no userId) are skipped.
 */
export function notifyOrderCompleted(order: SpreeOrderState): void {
  if (!order.userId) return;
  try {
    const link = `/order/${order.number}`;
    const alreadyNotified = getUserNotifications(order.userId).some(
      (n) => n.link === link && n.title === 'Order Confirmed'
    );
    if (alreadyNotified) return;

    const items = order.lineItems
      .map((li) => li.name)
      .slice(0, 3)
      .join(', ');
    createNotification(
      order.userId,
      'order',
      'Order Confirmed',
      `Your order ${order.number} has been confirmed${items ? ` — ${items}` : ''}.`,
      link
    );
  } catch {
    // notification is a non-critical side effect — never fail the checkout
  }
}

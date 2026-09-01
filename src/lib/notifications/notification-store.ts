import type { Notification } from './types';

// Store persisted on globalThis so all route modules share one instance in dev.
// Seeds run only once per process.
const globalStore = globalThis as unknown as { __fubaoNotifications?: Map<string, Notification[]> };
const notifications: Map<string, Notification[]> = (globalStore.__fubaoNotifications ??= new Map());

// Seed demo notifications
const demoNotifications: Notification[] = [
  { id: 'n-001', userId: 'usr-demo-001', type: 'order', title: 'Order Confirmed', message: 'Your order FB-ORD-001 has been confirmed.', link: '/order/FB-ORD-001', read: false, createdAt: '2025-03-01T10:00:00Z' },
  { id: 'n-002', userId: 'usr-demo-001', type: 'promotion', title: 'Spring Sale!', message: 'Get 20% off with code VIP20. Valid for Gift Sets.', link: '/talisman?category=Gift+Sets', read: false, createdAt: '2025-03-05T14:00:00Z' },
  { id: 'n-003', userId: 'usr-demo-001', type: 'system', title: 'Welcome to FuBao!', message: 'Thank you for joining our community. Explore our hand-drawn talismans.', read: true, createdAt: '2025-01-01T00:00:00Z' },
];
if (!notifications.has('usr-demo-001')) {
  demoNotifications.forEach(n => {
    if (!notifications.has(n.userId)) notifications.set(n.userId, []);
    notifications.get(n.userId)!.push(n);
  });
}

export function getUserNotifications(userId: string, unreadOnly = false): Notification[] {
  const list = notifications.get(userId) || [];
  return unreadOnly ? list.filter(n => !n.read) : list;
}

export function getUnreadCount(userId: string): number {
  const list = notifications.get(userId) || [];
  return list.filter(n => !n.read).length;
}

export function markAsRead(notificationId: string, userId: string): boolean {
  const list = notifications.get(userId);
  if (!list) return false;
  const n = list.find(n => n.id === notificationId);
  if (n) { n.read = true; return true; }
  return false;
}

export function markAllAsRead(userId: string): void {
  const list = notifications.get(userId);
  if (list) list.forEach(n => { n.read = true; });
}

export function createNotification(userId: string, type: Notification['type'], title: string, message: string, link?: string): Notification {
  const notification: Notification = {
    id: `n-${Date.now()}`,
    userId,
    type,
    title,
    message,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (!notifications.has(userId)) notifications.set(userId, []);
  notifications.get(userId)!.push(notification);
  return notification;
}

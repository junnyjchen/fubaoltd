// Newsletter store — persisted on globalThis so the public subscribe route
// and the admin list route share one instance in dev (module-level state is
// NOT shared across route modules).
// Seeded once per process; runtime writes (subscribes) survive module
// re-instantiation.

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

const globalStore = globalThis as unknown as {
  __fubaoNewsletter?: Map<string, NewsletterSubscriber>;
};
const subscribers: Map<string, NewsletterSubscriber> = (globalStore.__fubaoNewsletter ??= new Map());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

function nextId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Subscribe an email. Returns null when the email already exists. */
export function subscribeNewsletter(email: string): NewsletterSubscriber | null {
  const key = email.trim().toLowerCase();
  if (subscribers.has(key)) return null;
  const sub: NewsletterSubscriber = {
    id: nextId(),
    email: key,
    createdAt: new Date().toISOString(),
  };
  subscribers.set(key, sub);
  return sub;
}

/** List subscribers newest-first (admin console). */
export function listSubscribers(): NewsletterSubscriber[] {
  return [...subscribers.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Remove a subscriber (admin console unsubscribe). */
export function removeSubscriber(id: string): boolean {
  for (const [key, sub] of subscribers) {
    if (sub.id === id) {
      subscribers.delete(key);
      return true;
    }
  }
  return false;
}

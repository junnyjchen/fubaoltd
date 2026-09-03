// Wish wall store — persisted on globalThis so the public route, the admin
// route and future consumers all share one instance in dev (module-level
// state is NOT shared across route modules).
// Seeded once per process; runtime writes (submissions, approvals, deletes)
// survive module re-instantiation.

export interface Wish {
  id: string;
  orderId?: string;
  userName: string;
  productName: string;
  content: string;
  mediaType: 'text' | 'image' | 'video';
  mediaUrl?: string;
  rating: number;
  createdAt: string;
  approved: boolean;
}

const globalStore = globalThis as unknown as { __fubaoWishes?: Map<string, Wish> };
const wishes: Map<string, Wish> = (globalStore.__fubaoWishes ??= new Map());

// Seed demo wishes (approved) — runs only when the store is empty.
if (wishes.size === 0) {
  const demoWishes: Wish[] = [
    {
      id: 'wish-001',
      orderId: 'FB-ORD-001',
      userName: 'Sarah M.',
      productName: 'Protection Talisman',
      content:
        "I've been carrying this talisman for three months now. While I don't believe in supernatural powers, it serves as a beautiful reminder of my trip to Hong Kong and the incredible craftsmanship of Taoist art. The cinnabar ink is still vibrant!",
      mediaType: 'text',
      rating: 5,
      createdAt: '2025-02-15T10:00:00Z',
      approved: true,
    },
    {
      id: 'wish-002',
      orderId: 'FB-ORD-002',
      userName: 'Michael L.',
      productName: 'Home Blessing Talisman',
      content:
        'Bought this as a housewarming gift for my parents. They loved the cultural significance and the beautiful presentation. The certificate of consecration added a nice touch of authenticity.',
      mediaType: 'text',
      rating: 5,
      createdAt: '2025-02-10T14:30:00Z',
      approved: true,
    },
    {
      id: 'wish-003',
      orderId: 'FB-ORD-003',
      userName: 'Emily C.',
      productName: 'Energy Blessing Box',
      content:
        'The gift set exceeded my expectations! The cultural handbook was incredibly informative, and the copper coin pendant is now my favorite accessory. Each piece tells a story of centuries-old traditions.',
      mediaType: 'text',
      rating: 4,
      createdAt: '2025-02-05T09:15:00Z',
      approved: true,
    },
    {
      id: 'wish-004',
      orderId: 'FB-ORD-004',
      userName: 'David W.',
      productName: 'Career Success Talisman',
      content:
        "I'm a collector of cultural artifacts, and this talisman is a masterpiece. The hand-drawn details are exquisite. Whether or not you believe in the spiritual aspects, it's undeniably a piece of living cultural heritage.",
      mediaType: 'text',
      rating: 5,
      createdAt: '2025-01-28T16:45:00Z',
      approved: true,
    },
    {
      id: 'wish-005',
      orderId: 'FB-ORD-005',
      userName: 'Jennifer K.',
      productName: 'Personalized Birth-Chart Talisman',
      content:
        'The personalized aspect made this extra special. Master Chen took the time to understand my birth chart and create something unique. It is now displayed prominently in my meditation space.',
      mediaType: 'text',
      rating: 5,
      createdAt: '2025-01-20T11:20:00Z',
      approved: true,
    },
  ];
  for (const w of demoWishes) wishes.set(w.id, w);
}

export function listAllWishes(): Wish[] {
  return [...wishes.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listApprovedWishes(): Wish[] {
  return listAllWishes().filter((w) => w.approved);
}

export function createWish(input: {
  orderId?: string;
  userName: string;
  productName: string;
  content: string;
  mediaType?: 'text' | 'image' | 'video';
  mediaUrl?: string;
  rating?: number;
}): Wish {
  const wish: Wish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    userName: input.userName,
    productName: input.productName,
    content: input.content,
    mediaType: input.mediaType ?? 'text',
    mediaUrl: input.mediaUrl,
    rating: Math.min(5, Math.max(1, input.rating ?? 5)),
    createdAt: new Date().toISOString(),
    approved: false, // requires admin approval before publishing
  };
  wishes.set(wish.id, wish);
  return wish;
}

export function setWishApproval(id: string, approved: boolean): Wish | null {
  const wish = wishes.get(id);
  if (!wish) return null;
  wish.approved = approved;
  return wish;
}

export function deleteWish(id: string): boolean {
  return wishes.delete(id);
}

export function getWishStats(): { total: number; approved: number; pending: number } {
  const all = listAllWishes();
  return {
    total: all.length,
    approved: all.filter((w) => w.approved).length,
    pending: all.filter((w) => !w.approved).length,
  };
}

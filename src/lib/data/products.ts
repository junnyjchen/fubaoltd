import type { Product, Review, VerificationRecord } from './types';

// Catalog persisted on globalThis so admin edits survive dev-mode module
// re-instantiations and are shared across every route module (same pattern
// as the other FuBao stores). Seeding runs only once per process.
const globalStore = globalThis as unknown as { __fubaoCatalog?: Product[] };
const seedProducts: Product[] = [
  {
    slug: 'protection-talisman',
    name: 'Protection Talisman',
    price: 29.9,
    category: 'Protection',
    tagline: 'Hand-drawn by a Taoist master for spiritual safeguarding',
    story: [
      'In Taoist tradition, the Protection Talisman (护身符) is one of the most revered spiritual artifacts. Drawn with cinnabar ink on consecrated paper, it carries centuries of ceremonial wisdom passed down through generations of Daoist masters.',
      'Each talisman is individually hand-drawn by Master Chen in his Hong Kong temple, following an ancient consecration ritual that invokes protective energies. The intricate symbols are not mere decoration — they encode a spiritual language that has been refined over a millennium.',
      'Whether you are embarking on a journey, starting a new chapter, or simply seeking a sense of spiritual security, this talisman serves as a tangible connection to the protective traditions of Taoism.',
    ],
    image_key: 'talisman-protection.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: '2025-01-15',
      ceremonyId: 'CER-2025-001',
    },
    rating: 4.8,
    reviewCount: 124,
  },
  {
    slug: 'home-blessing-talisman',
    name: 'Home Blessing Talisman',
    price: 49.9,
    category: 'Home Blessing',
    tagline: 'Invite harmony and positive energy into your living space',
    story: [
      'The Home Blessing Talisman (镇宅符) is a cornerstone of Taoist household tradition. Placed at the entrance or in the main living area, it is believed to create a protective boundary that encourages harmonious energy flow throughout the home.',
      'Master Chen prepares each Home Blessing Talisman using a special blend of cinnabar and gold-flecked ink, applying brushstrokes that follow the principles of Feng Shui directional energy. The ritual involves chanting specific sutras for household peace.',
      'This talisman makes a meaningful housewarming gift or a personal reminder that your home is a sanctuary of calm and positive intention.',
    ],
    image_key: 'talisman-home.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: '2025-02-08',
      ceremonyId: 'CER-2025-002',
    },
    rating: 4.9,
    reviewCount: 89,
  },
  {
    slug: 'career-success-talisman',
    name: 'Career Success Talisman',
    price: 39.9,
    category: 'Career',
    tagline: 'Channel focused energy toward professional growth',
    story: [
      'The Career Success Talisman (事业符) is crafted for those seeking clarity, determination, and forward momentum in their professional lives. In Taoist philosophy, career prosperity is linked to the flow of Qi through the "achievement" sector of one\'s spiritual map.',
      'This talisman features the sacred "Kai Wen" symbol — an ancient character representing the opening of wisdom and opportunity. Master Chen draws it with deliberate, confident strokes during the Hour of the Dragon (7-9 AM), considered the most auspicious time for ambition-related rituals.',
      'Place it in your workspace or carry it with you to important meetings as a personal anchor for focus and confidence.',
    ],
    image_key: 'talisman-career.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: '2025-03-01',
      ceremonyId: 'CER-2025-003',
    },
    rating: 4.7,
    reviewCount: 67,
  },
  {
    slug: 'personalized-birth-chart-talisman',
    name: 'Personalized Birth-Chart Talisman',
    price: 59.9,
    category: 'Protection',
    tagline: 'A bespoke talisman aligned with your unique birth energy',
    story: [
      'The Personalized Birth-Chart Talisman (生辰八字定制符) is the most intimate offering in our collection. Based on your birth year, season, and personal focus, Master Chen creates a one-of-a-kind talisman that resonates with your individual spiritual blueprint.',
      'Using the ancient system of Ba Zi (Four Pillars of Destiny), Master Chen analyzes the elemental balance of your birth chart and selects specific symbols, directions, and ink compositions that complement your unique energy signature.',
      'Each personalized talisman comes with a handwritten note from Master Chen explaining the specific elements chosen for you, creating a deeply personal connection to this ancient tradition.',
    ],
    image_key: 'talisman-personalized.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: 'Made to order',
      ceremonyId: 'CER-CUSTOM',
    },
    rating: 4.9,
    reviewCount: 45,
    isPersonalized: true,
  },
  {
    slug: 'energy-blessing-box',
    name: 'Energy Blessing Box',
    price: 89.9,
    category: 'Gift Sets',
    tagline: 'A curated collection of three talismans with cultural accessories',
    story: [
      'The Energy Blessing Box is our most comprehensive offering — a thoughtfully curated set that brings together three essential talismans (Protection, Home Blessing, and Career) along with a cultural handbook and a traditional copper coin pendant.',
      'Each item in the box has been consecrated through the full seven-step ritual process, from auspicious date selection to the final sealing ceremony. The accompanying handbook provides rich cultural context for each piece, making this set ideal for both newcomers and seasoned collectors.',
      'Beautifully packaged in a handmade wooden box with a magnetic closure, the Energy Blessing Box is the perfect gift for someone who appreciates Eastern culture, or a comprehensive starting point for your own spiritual collection.',
    ],
    image_key: 'talisman-giftbox.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: '2025-03-15',
      ceremonyId: 'CER-2025-005',
    },
    rating: 5.0,
    reviewCount: 38,
  },
  {
    slug: 'free-blessing-talisman',
    name: 'Free Blessing Talisman',
    price: 0,
    category: 'Protection',
    tagline: 'A consecrated cultural keepsake, offered freely to our community',
    story: [
      'The Blessing Talisman (接福符) is our gift to the community — a hand-drawn keepsake prepared by Master Chen following the same seven-step consecration process as our full collection.',
      'Each piece is drawn on yellow rice paper with cinnabar ink and sealed at Qingyun Temple. We offer one per guest so that as many people as possible can carry a piece of this living tradition.',
      'Choose free on-site pickup at our Hong Kong temple, or have it mailed anywhere in the world — you only cover the shipping.',
    ],
    image_key: 'talisman-blessing.jpg',
    ritual_info: {
      master: 'Master Chen Zhiwei',
      location: 'Qingyun Temple, Hong Kong',
      date: '2025-04-01',
      ceremonyId: 'CER-2025-006',
    },
    rating: 5.0,
    reviewCount: 0,
    isFreeGift: true,
  },
];

export const products: Product[] = (globalStore.__fubaoCatalog ??= seedProducts);

/**
 * Admin catalog mutation: update editable fields (price / stock / tagline /
 * listing visibility). Mutates the shared globalThis-backed array in place so
 * every consumer (listings, Spree serializers, cart pricing in order-store)
 * sees the change immediately.
 */
export function updateProductAdmin(
  slug: string,
  updates: Partial<
    Pick<Product, 'price' | 'stock' | 'tagline' | 'isActive' | 'image_key'>
  >
): Product | null {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  if (updates.price !== undefined) {
    if (updates.price < 0) return null;
    product.price = Math.round(updates.price * 100) / 100;
  }
  if (updates.stock !== undefined) {
    if (updates.stock < 0 || !Number.isInteger(updates.stock)) return null;
    product.stock = updates.stock;
  }
  if (updates.tagline !== undefined) product.tagline = updates.tagline;
  if (updates.isActive !== undefined) product.isActive = updates.isActive;
  if (updates.image_key !== undefined) {
    const key = String(updates.image_key).trim();
    if (key && !isUploadedPhotoKey(key) && key !== `talisman-${slug}.jpg`) {
      // Only uploaded keys (products/…) or the default seed pattern are valid
      return null;
    }
    product.image_key = key || `talisman-${slug}.jpg`;
  }
  return product;
}

/** Uploaded photos always come from the admin upload flow with this prefix. */
export function isUploadedPhotoKey(key: string): boolean {
  return key.startsWith('products/');
}

/**
 * Admin catalog creation. Story / ritual info / image get sensible defaults
 * (the talisman SVG renderer falls back to the protection variant for any
 * unknown image key), so admins only need to supply the essentials.
 */
export function createProductAdmin(input: {
  slug: string;
  name: string;
  price: number;
  category: Product['category'];
  tagline: string;
  story?: string[];
  imageKey?: string;
}): Product | null {
  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  if (slug.length < 3 || slug.length > 60) return null;
  if (!input.name.trim()) return null;
  if (!Number.isFinite(input.price) || input.price < 0) return null;
  if (products.some((p) => p.slug === slug)) return null;

  const product: Product = {
    slug,
    name: input.name.trim(),
    price: Math.round(input.price * 100) / 100,
    category: input.category,
    tagline: input.tagline.trim(),
    story:
      input.story && input.story.length > 0
        ? input.story
        : [`${input.name.trim()} — a hand-drawn cultural keepsake from the FuBao collection. Each piece follows traditional Taoist consecration practices and ships with its verification card.`],
    image_key: input.imageKey && isUploadedPhotoKey(input.imageKey.trim())
      ? input.imageKey.trim()
      : `talisman-${slug}.jpg`,
    ritual_info: {
      master: 'FuBao Atelier',
      location: 'Hong Kong',
      date: new Date().toISOString().slice(0, 10),
      ceremonyId: `CER-${new Date().getFullYear()}-${String(products.length + 1).padStart(3, '0')}`,
    },
    rating: 5,
    reviewCount: 0,
    stock: 0,
  };
  products.push(product);
  return product;
}

/**
 * Admin catalog removal — hard delete. Refused while any order still
 * references the slug (orders keep their line items forever), and refused
 * for the free-blessing gift which the /blessing flow depends on.
 */
export function deleteProductAdmin(slug: string): boolean {
  if (slug === 'free-blessing-talisman') return false;
  const index = products.findIndex((p) => p.slug === slug);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export const reviews: Review[] = [
  {
    id: 'r1',
    productSlug: 'protection-talisman',
    author: 'Sarah M.',
    rating: 5,
    content:
      'I purchased this for my son who was traveling abroad. The craftsmanship is beautiful, and the cultural story that came with it made it even more special. It feels like carrying a piece of ancient wisdom.',
    date: '2025-04-12',
  },
  {
    id: 'r2',
    productSlug: 'protection-talisman',
    author: 'James L.',
    rating: 5,
    content:
      'The attention to detail is remarkable. You can tell this is hand-drawn with care and intention. The cinnabar ink has a beautiful, rich color.',
    date: '2025-04-08',
  },
  {
    id: 'r3',
    productSlug: 'home-blessing-talisman',
    author: 'Emily R.',
    rating: 5,
    content:
      'We placed it in our new home and it feels like the energy of the space shifted. Beautifully crafted and the packaging was exquisite.',
    date: '2025-04-10',
  },
  {
    id: 'r4',
    productSlug: 'home-blessing-talisman',
    author: 'David K.',
    rating: 4,
    content:
      'A thoughtful gift for friends who just moved. The certificate of consecration added a nice touch of authenticity.',
    date: '2025-03-28',
  },
  {
    id: 'r5',
    productSlug: 'career-success-talisman',
    author: 'Michael T.',
    rating: 5,
    content:
      'I keep it in my wallet and it serves as a daily reminder to stay focused. Since getting it, I feel more grounded in my career decisions.',
    date: '2025-04-05',
  },
  {
    id: 'r6',
    productSlug: 'energy-blessing-box',
    author: 'Lisa W.',
    rating: 5,
    content:
      'This was a gift for my mother and she was moved to tears. The presentation, the cultural depth, the quality — everything exceeded expectations.',
    date: '2025-04-15',
  },
  {
    id: 'r7',
    productSlug: 'personalized-birth-chart-talisman',
    author: 'Anna C.',
    rating: 5,
    content:
      'The personalized note from Master Chen was incredibly thoughtful. He incorporated elements that resonated deeply with my life path. A truly unique artifact.',
    date: '2025-04-01',
  },
];

export const verificationRecords: VerificationRecord[] = [
  {
    code: 'FB-2026-000001',
    productName: 'Protection Talisman',
    master: 'Master Chen Zhiwei',
    consecrationDate: 'January 15, 2025',
    location: 'Qingyun Temple, Hong Kong',
    sealingNumber: 'SEAL-PRO-001',
    valid: true,
  },
  {
    code: 'FB-2026-000002',
    productName: 'Home Blessing Talisman',
    master: 'Master Chen Zhiwei',
    consecrationDate: 'February 8, 2025',
    location: 'Qingyun Temple, Hong Kong',
    sealingNumber: 'SEAL-HB-002',
    valid: true,
  },
  {
    code: 'FB-2026-000003',
    productName: 'Career Success Talisman',
    master: 'Master Chen Zhiwei',
    consecrationDate: 'March 1, 2025',
    location: 'Qingyun Temple, Hong Kong',
    sealingNumber: 'SEAL-CS-003',
    valid: true,
  },
  {
    code: 'FB-2026-100001',
    productName: 'Energy Blessing Box',
    master: 'Master Chen Zhiwei',
    consecrationDate: 'March 15, 2025',
    location: 'Qingyun Temple, Hong Kong',
    sealingNumber: 'SEAL-EB-005',
    valid: true,
  },
];

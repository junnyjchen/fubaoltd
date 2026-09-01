import { products, reviews, verificationRecords } from "@/lib/data/products";
import type {
  Product,
  Review,
  VerificationRecord,
  QuizInput,
  QuizResult,
  Order,
  OrderItem,
  ShippingAddress,
  FiveElement,
} from "@/lib/data/types";

// ============ Articles ============

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "news" | "encyclopedia" | "tutorial" | "culture";
  tags: string[];
  author: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock articles for server-side rendering
const mockArticles: Article[] = [
  {
    id: "art-001",
    slug: "history-of-taoist-talismans",
    title: "The Ancient History of Taoist Talismans",
    excerpt: "Explore the 2000-year tradition of Taoist talisman creation and its significance in Chinese spiritual culture.",
    content: "# The Ancient History of Taoist Talismans\n\nTaoist talismans, known as \"Fu\" (符) in Chinese, represent one of the most fascinating aspects of Eastern spiritual tradition.",
    category: "encyclopedia",
    tags: ["history", "talisman", "culture"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "art-002",
    slug: "five-elements-guide",
    title: "Understanding the Five Elements (Wu Xing)",
    excerpt: "A comprehensive guide to Metal, Wood, Water, Fire, and Earth—the fundamental forces in Taoist philosophy.",
    content: "# Understanding the Five Elements (Wu Xing)\n\nThe Five Elements theory is a fundamental concept in Taoist philosophy.",
    category: "encyclopedia",
    tags: ["five elements", "wu xing", "philosophy"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "art-003",
    slug: "consecration-ritual-explained",
    title: "The Consecration Ritual: A Step-by-Step Guide",
    excerpt: "Learn about the sacred seven-step process that transforms a hand-drawn talisman into a blessed cultural artifact.",
    content: "# The Consecration Ritual\n\nEvery FuBao talisman undergoes a traditional seven-step consecration ritual.",
    category: "tutorial",
    tags: ["ritual", "consecration", "process"],
    author: "Master Chen",
    published: true,
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-02-01T09:00:00Z",
  },
  {
    id: "art-004",
    slug: "new-spring-collection-2025",
    title: "Spring 2025 Collection: Renewal and Growth",
    excerpt: "Introducing our new Wood element talismans, designed for the season of renewal and fresh beginnings.",
    content: "# Spring 2025 Collection\n\nAs spring approaches, we're excited to introduce our seasonal collection.",
    category: "news",
    tags: ["spring", "collection", "wood element"],
    author: "FuBao Team",
    published: true,
    createdAt: "2025-02-10T11:00:00Z",
    updatedAt: "2025-02-10T11:00:00Z",
  },
];

export async function getArticles(category?: string): Promise<Article[]> {
  let filtered = mockArticles.filter((a) => a.published);
  if (category) {
    filtered = filtered.filter((a) => a.category === category);
  }
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return mockArticles.find((a) => a.slug === slug && a.published) || null;
}

// ============ Wishes ============

interface Wish {
  id: string;
  userName: string;
  productName: string;
  content: string;
  rating: number;
  createdAt: string;
}

const mockWishes: Wish[] = [
  {
    id: "wish-001",
    userName: "Sarah M.",
    productName: "Protection Talisman",
    content: "I've been carrying this talisman for three months now. While I don't believe in supernatural powers, it serves as a beautiful reminder of my trip to Hong Kong and the incredible craftsmanship of Taoist art.",
    rating: 5,
    createdAt: "2025-02-15T10:00:00Z",
  },
  {
    id: "wish-002",
    userName: "Michael L.",
    productName: "Home Blessing Talisman",
    content: "Bought this as a housewarming gift for my parents. They loved the cultural significance and the beautiful presentation.",
    rating: 5,
    createdAt: "2025-02-10T14:30:00Z",
  },
  {
    id: "wish-003",
    userName: "Emily C.",
    productName: "Energy Blessing Box",
    content: "The gift set exceeded my expectations! The cultural handbook was incredibly informative, and the copper coin pendant is now my favorite accessory.",
    rating: 4,
    createdAt: "2025-02-05T09:15:00Z",
  },
];

export async function getWishes(): Promise<Wish[]> {
  return mockWishes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ============ Products ============

// ============ Products (Spree Commerce v2 contract layer) ============

import { spreeProductToListProduct, spreeProductToDetail } from "@/lib/spree/adapter";
import { listSpreeProducts, getSpreeProductBySlug } from "@/lib/spree/queries";

export async function getProducts(category?: string): Promise<Product[]> {
  const spreeProducts = await listSpreeProducts(category);
  return spreeProducts.map(spreeProductToListProduct);
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const all = await getProducts();
  return all.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const spreeProduct = await getSpreeProductBySlug(slug);
  return spreeProduct ? spreeProductToDetail(spreeProduct) : null;
}

export async function getProductReviews(slug: string): Promise<Review[]> {
  return reviews.filter((r) => r.productSlug === slug);
}

// ============ Artisans (Spree vendors) ============

import { merchants } from "@/lib/merchant/merchant-store";
import { vendorIdForProduct } from "@/lib/spree-compat/serializers";
import type { Artisan } from "@/lib/data/types";

export async function getArtisans(): Promise<Artisan[]> {
  const approved = merchants.filter((m) => m.status === "approved");

  return approved.map((m) => {
    const productSlugs = products
      .filter((p) => vendorIdForProduct(p) === m.id)
      .map((p) => p.slug);

    return {
      id: m.id,
      slug: m.shopSlug,
      name: m.shopName,
      description: m.description,
      city: m.city ?? "",
      country: m.country,
      specialties: m.specialties,
      certification: m.certification,
      rating: m.rating,
      productCount: productSlugs.length,
      productSlugs,
    };
  });
}

export async function getArtisanForProduct(slug: string): Promise<Artisan | null> {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  const vendorId = vendorIdForProduct(product);
  const merchant = merchants.find(
    (m) => m.id === vendorId && m.status === "approved"
  );
  if (!merchant) return null;

  const productSlugs = products
    .filter((p) => vendorIdForProduct(p) === merchant.id)
    .map((p) => p.slug);

  return {
    id: merchant.id,
    slug: merchant.shopSlug,
    name: merchant.shopName,
    description: merchant.description,
    city: merchant.city ?? "",
    country: merchant.country,
    specialties: merchant.specialties,
    certification: merchant.certification,
    rating: merchant.rating,
    productCount: productSlugs.length,
    productSlugs,
  };
}

// ============ Verification ============

export async function verifyCode(
  code: string
): Promise<VerificationRecord | null> {
  return verificationRecords.find((r) => r.code === code) || null;
}

// ============ Five Elements Quiz ============

export async function getQuizResult(input: QuizInput): Promise<QuizResult> {
  // Deterministic scoring based on inputs
  const scores: Record<FiveElement, number> = {
    Metal: 0,
    Wood: 0,
    Water: 0,
    Fire: 0,
    Earth: 0,
  };

  // Birth year last digit mapping
  const yearMap: Record<number, FiveElement[]> = {
    0: ["Metal", "Water"],
    1: ["Water", "Metal"],
    2: ["Water", "Wood"],
    3: ["Wood", "Water"],
    4: ["Wood", "Fire"],
    5: ["Fire", "Wood"],
    6: ["Fire", "Earth"],
    7: ["Earth", "Fire"],
    8: ["Earth", "Metal"],
    9: ["Metal", "Earth"],
  };

  const yearScores = yearMap[input.birthYear % 10] || ["Earth", "Metal"];
  scores[yearScores[0]] += 3;
  scores[yearScores[1]] += 1;

  // Season mapping
  const seasonMap: Record<string, FiveElement[]> = {
    spring: ["Wood", "Fire"],
    summer: ["Fire", "Earth"],
    autumn: ["Metal", "Water"],
    winter: ["Water", "Wood"],
  };

  const seasonScores = seasonMap[input.birthSeason] || ["Earth", "Metal"];
  scores[seasonScores[0]] += 3;
  scores[seasonScores[1]] += 1;

  // Gender modifier
  if (input.gender === "male") {
    scores.Metal += 1;
    scores.Wood += 1;
  } else {
    scores.Water += 1;
    scores.Earth += 1;
  }

  // Focus area
  const focusMap: Record<string, FiveElement> = {
    career: "Metal",
    family: "Earth",
    health: "Wood",
    relationships: "Fire",
  };

  scores[focusMap[input.focus] || "Earth"] += 2;

  // Determine dominant element
  const dominant = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] ||
    "Earth") as FiveElement;

  // Element descriptions
  const descriptions: Record<FiveElement, string> = {
    Metal: "You embody clarity, precision, and inner strength. Like a refined blade, your mind cuts through confusion with decisive wisdom.",
    Wood: "You embody growth, compassion, and vision. Like a mighty tree, you reach toward the sky while staying grounded.",
    Water: "You embody adaptability, depth, and intuition. Like flowing water, you navigate obstacles with grace and find your way.",
    Fire: "You embody passion, transformation, and joy. Like a bright flame, you illuminate the darkness and warm those around you.",
    Earth: "You embody stability, nourishment, and trust. Like the solid ground, you provide a foundation for others.",
  };

  // Strengths per element
  const strengthsMap: Record<FiveElement, string[]> = {
    Metal: ["Decisive thinking", "Inner resilience", "Clear boundaries"],
    Wood: ["Creative growth", "Compassionate heart", "Visionary planning"],
    Water: ["Emotional depth", "Adaptive wisdom", "Intuitive insight"],
    Fire: ["Inspiring presence", "Transformative energy", "Joyful expression"],
    Earth: ["Grounded stability", "Nurturing care", "Trustworthy nature"],
  };

  // Recommended products based on element (slugs must exist in the catalog)
  const recommendationMap: Record<FiveElement, string> = {
    Metal: "protection-talisman",
    Wood: "energy-blessing-box",
    Water: "career-success-talisman",
    Fire: "home-blessing-talisman",
    Earth: "personalized-birth-chart-talisman",
  };

  const recommendedSlug = recommendationMap[dominant] || "protection-talisman";

  return {
    element: dominant,
    elementDescription: descriptions[dominant],
    strengths: strengthsMap[dominant],
    recommendations: [
      `Consider the ${dominant} element talisman for balance`,
      "Meditate on your dominant element each morning",
      "Surround yourself with colors associated with your element",
    ],
    recommendedProducts: [recommendedSlug],
  };
}

// ============ Orders ============

const orders: Order[] = [];

export async function submitOrder(input: {
  items: OrderItem[];
  shippingInfo: Omit<ShippingAddress, "phone">;
  email: string;
}): Promise<Order> {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 ? 0 : 12.99;

  const order: Order = {
    id: `FB-ORD-${Date.now().toString(36).toUpperCase()}`,
    items: input.items,
    shipping: {
      ...input.shippingInfo,
      phone: "",
    },
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: shippingCost,
    total: Math.round((subtotal + shippingCost) * 100) / 100,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  return orders.find((o) => o.id === id) || null;
}

/**
 * Read an order back through the Spree compatibility layer by order number
 * (e.g. "R983752676"). Returns a normalized shape for the order
 * confirmation page: line items with slugs, totals, addresses.
 */
export async function getOrderDetailForOrderNumber(
  number: string
): Promise<{
  number: string;
  email: string;
  state: string;
  paymentState: string;
  shipmentState: string;
  itemTotal: number;
  shipTotal: number;
  promoTotal: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  completedAt: string | null;
  shipAddress: {
    firstname: string;
    lastname: string;
    address1: string;
    city: string;
    zipcode: string;
    countryIso: string;
    phone: string;
  } | null;
  lineItems: {
    id: string;
    name: string;
    slug: string;
    quantity: number;
    price: number;
    options?: { personalization?: string } | null;
  }[];
} | null> {
  const { getOrderByNumber } = await import("@/lib/spree-compat/order-store");
  const order = getOrderByNumber(number);
  if (!order) return null;
  return {
    number: order.number,
    email: order.email,
    state: order.state,
    paymentState: order.paymentStatus,
    shipmentState: order.shipmentStatus,
    itemTotal: order.itemTotal,
    shipTotal: order.shipTotal,
    promoTotal: order.promoTotal,
    total: order.itemTotal + order.shipTotal - order.promoTotal,
    couponCode: order.couponCode ?? null,
    createdAt: order.createdAt,
    completedAt: order.completedAt ?? null,
    shipAddress: order.shipAddress
      ? {
          firstname: order.shipAddress.firstname,
          lastname: order.shipAddress.lastname,
          address1: order.shipAddress.address1,
          city: order.shipAddress.city,
          zipcode: order.shipAddress.zipcode,
          countryIso: order.shipAddress.country_iso,
          phone: order.shipAddress.phone,
        }
      : null,
    lineItems: order.lineItems.map((li) => ({
      id: li.id,
      name: li.name,
      slug: li.slug,
      quantity: li.quantity,
      price: li.price,
      options: li.options ?? null,
    })),
  };
}

// ============ Image URLs ============

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

/**
 * Get the signed URL for a product image from object storage.
 * Falls back to placeholder if storage is not configured.
 */
export async function getProductImageUrl(imageKey: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/images/${encodeURIComponent(imageKey)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch {
    // Fall through to placeholder
  }
  
  // Return placeholder SVG data URL
  return "/placeholder.svg";
}

/**
 * Get signed URLs for multiple product images.
 */
export async function getProductImageUrls(keys: string[]): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  
  await Promise.all(
    keys.map(async (key) => {
      urls[key] = await getProductImageUrl(key);
    })
  );
  
  return urls;
}

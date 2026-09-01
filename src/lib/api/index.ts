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

// ============ Products ============

export async function getProducts(category?: string): Promise<Product[]> {
  if (category) {
    return products.filter((p) => p.category === category);
  }
  return products;
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  return products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) || null;
}

export async function getProductReviews(slug: string): Promise<Review[]> {
  return reviews.filter((r) => r.productSlug === slug);
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

  // Recommended products based on element
  const recommendationMap: Record<FiveElement, string> = {
    Metal: "protection-talisman",
    Wood: "health-talisman",
    Water: "career-talisman",
    Fire: "home-blessing-talisman",
    Earth: "birth-chart-talisman",
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

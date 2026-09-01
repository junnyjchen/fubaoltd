import type {
  Product,
  ProductCategory,
  VerificationRecord,
  QuizAnswers,
  QuizResult,
  FiveElement,
  Order,
  ShippingAddress,
} from '@/lib/data/types';
import {
  products,
  verificationRecords,
} from '@/lib/data/products';

// ─── Product API ───

export async function getProducts(
  category?: ProductCategory
): Promise<Product[]> {
  if (category) {
    return products.filter((p) => p.category === category);
  }
  return products;
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.slice(0, 3);
}

export async function getProductsBySlugs(
  slugs: string[]
): Promise<Product[]> {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);
}

// ─── Verification API ───

export async function verifyCode(
  code: string
): Promise<VerificationRecord | null> {
  const record = verificationRecords.find((r) => r.code === code);
  return record ?? null;
}

// ─── Five Elements Quiz API ───

export async function getQuizResult(
  answers: QuizAnswers
): Promise<QuizResult> {
  const element = calculateElement(answers);
  return buildQuizResult(element, answers.focus);
}

function calculateElement(answers: QuizAnswers): FiveElement {
  const { birthYear, birthSeason } = answers;

  const yearMap: Record<number, FiveElement> = {
    0: 'Metal',
    1: 'Metal',
    2: 'Water',
    3: 'Water',
    4: 'Wood',
    5: 'Wood',
    6: 'Fire',
    7: 'Fire',
    8: 'Earth',
    9: 'Earth',
  };

  const lastDigit = birthYear % 10;
  const baseElement = yearMap[lastDigit] ?? 'Earth';

  const seasonShift: Record<string, number> = {
    spring: 1,
    summer: 2,
    autumn: 3,
    winter: 4,
  };

  const elements: FiveElement[] = [
    'Metal',
    'Wood',
    'Water',
    'Fire',
    'Earth',
  ];
  const baseIndex = elements.indexOf(baseElement);
  const shift = seasonShift[birthSeason] ?? 0;
  const finalIndex = (baseIndex + shift) % 5;

  return elements[finalIndex];
}

function buildQuizResult(
  element: FiveElement,
  focus: string
): QuizResult {
  const elementData: Record<
    FiveElement,
    {
      description: string;
      strengths: string[];
      recommendations: string[];
      products: string[];
    }
  > = {
    Metal: {
      description:
        'Your energy resonates with Metal — precision, clarity, and unwavering determination. Like a finely forged blade, you cut through ambiguity with decisive action. Metal energy governs structure, discipline, and the courage to let go of what no longer serves you.',
      strengths: [
        'Sharp analytical mind and clear judgment',
        'Natural discipline and organizational ability',
        'Strong sense of justice and integrity',
        'Resilience under pressure',
      ],
      recommendations: [
        'Cultivate flexibility — not everything needs to be perfect',
        'Practice breathing exercises to soften rigid energy',
        'Surround yourself with water elements to balance Metal',
      ],
      products: [
        'protection-talisman',
        'career-success-talisman',
      ],
    },
    Wood: {
      description:
        'Your energy flows with Wood — growth, compassion, and creative vision. Like a mighty tree reaching toward the sky, you are driven by constant expansion and the desire to nurture life around you. Wood energy governs imagination, planning, and benevolent leadership.',
      strengths: [
        'Natural creativity and innovative thinking',
        'Compassionate leadership and mentoring ability',
        'Adaptability and resilience in changing conditions',
        'Strong moral compass and idealism',
      ],
      recommendations: [
        'Ground your expansive energy with regular time in nature',
        'Avoid over-committing — Wood energy can lead to burnout',
        'Balance growth with periods of rest and reflection',
      ],
      products: [
        'career-success-talisman',
        'home-blessing-talisman',
      ],
    },
    Water: {
      description:
        'Your energy moves with Water — wisdom, fluidity, and deep intuition. Like a river that finds its way around any obstacle, you navigate life with grace and perceptiveness. Water energy governs reflection, communication, and the ability to adapt to any situation.',
      strengths: [
        'Deep emotional intelligence and empathy',
        'Excellent communication and negotiation skills',
        'Intuitive decision-making and inner knowing',
        'Ability to remain calm in turbulent situations',
      ],
      recommendations: [
        'Build structure to channel your flowing energy effectively',
        'Practice grounding exercises to avoid feeling unmoored',
        'Set clear boundaries — your empathy can be depleted easily',
      ],
      products: [
        'protection-talisman',
        'personalized-birth-chart-talisman',
      ],
    },
    Fire: {
      description:
        'Your energy blazes with Fire — passion, charisma, and transformative power. Like a flame that illuminates the darkness, you bring warmth, inspiration, and dynamic energy to everything you touch. Fire energy governs joy, connection, and the courage to be seen.',
      strengths: [
        'Magnetic personality and natural charisma',
        'Passionate drive and infectious enthusiasm',
        'Ability to inspire and motivate others',
        'Quick thinking and spontaneous creativity',
      ],
      recommendations: [
        'Practice patience — not everything needs to happen immediately',
        'Channel intensity into focused projects rather than scattering energy',
        'Balance Fire with Water activities like meditation or swimming',
      ],
      products: [
        'career-success-talisman',
        'energy-blessing-box',
      ],
    },
    Earth: {
      description:
        'Your energy is grounded in Earth — stability, nourishment, and centered harmony. Like the solid ground beneath our feet, you provide a foundation of reliability and warmth for those around you. Earth energy governs trust, nurturing, and the balance between all elements.',
      strengths: [
        'Exceptional reliability and dependability',
        'Natural nurturing ability and emotional stability',
        'Strong practical judgment and common sense',
        'Ability to mediate conflicts and create harmony',
      ],
      recommendations: [
        'Avoid taking on others\' burdens at the expense of your own well-being',
        'Introduce variety and spontaneity to prevent stagnation',
        'Practice saying no — your generosity needs healthy limits',
      ],
      products: [
        'home-blessing-talisman',
        'energy-blessing-box',
      ],
    },
  };

  const data = elementData[element];
  const focusProducts = getFocusProducts(focus);
  const allRecommended = Array.from(
    new Set([...data.products, ...focusProducts])
  ).slice(0, 3);

  return {
    element,
    elementDescription: data.description,
    strengths: data.strengths,
    recommendations: data.recommendations,
    recommendedProducts: allRecommended,
  };
}

function getFocusProducts(focus: string): string[] {
  switch (focus) {
    case 'career':
      return ['career-success-talisman'];
    case 'family':
      return ['home-blessing-talisman'];
    case 'health':
      return ['protection-talisman'];
    case 'relationships':
      return ['energy-blessing-box'];
    default:
      return ['protection-talisman'];
  }
}

// ─── Order API ───

export async function submitOrder(
  items: Array<{ slug: string; name: string; price: number; quantity: number }>,
  shipping: ShippingAddress
): Promise<Order> {
  const orderId = `FB-${Date.now().toString(36).toUpperCase()}`;
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order: Order = {
    id: orderId,
    items,
    shipping,
    total: Math.round(total * 100) / 100,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  return order;
}

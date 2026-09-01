// ─── Product Types ───

export type ProductCategory =
  | 'Protection'
  | 'Home Blessing'
  | 'Career'
  | 'Gift Sets';

export interface RitualInfo {
  master: string;
  location: string;
  date: string;
  ceremonyId: string;
}

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  tagline: string;
  story: string[];
  image_key: string;
  ritual_info: RitualInfo;
  rating: number;
  reviewCount: number;
  isPersonalized?: boolean;
}

// ─── Cart Types ───

export interface CartItem {
  slug: string;
  quantity: number;
  /** Legacy localStorage cart personalization note */
  personalizedInfo?: string;
  /** Spree server cart snapshot (populated by useCart) */
  name?: string;
  price?: number;
  imageKey?: string | null;
  personalization?: string;
}

export interface CartState {
  items: CartItem[];
}

// ─── Order Types ───

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageKey?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped';
  createdAt: string;
}

// ─── Quiz Types (aliases) ───

export type QuizInput = QuizAnswers;

// ─── Verification Types ───

export interface VerificationRecord {
  code: string;
  productName: string;
  master: string;
  consecrationDate: string;
  location: string;
  sealingNumber: string;
  valid: boolean;
}

// ─── Five Elements Quiz Types ───

export type FiveElement = 'Metal' | 'Wood' | 'Water' | 'Fire' | 'Earth';

export type LifeFocus = 'career' | 'family' | 'health' | 'relationships';

export interface QuizAnswers {
  birthYear: number;
  birthSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  gender: 'male' | 'female' | 'other';
  focus: LifeFocus;
}

export interface QuizResult {
  element: FiveElement;
  elementDescription: string;
  strengths: string[];
  recommendations: string[];
  recommendedProducts: string[];
}

// ─── Review Types ───

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

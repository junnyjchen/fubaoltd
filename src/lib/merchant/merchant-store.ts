// In-memory merchant store with seed data.
// Swap for real DB later.

import type {
  Merchant,
  MerchantApplication,
  MerchantOrder,
  MerchantProduct,
  MerchantWithdrawal,
} from './types';

// Merchant linked user accounts (email -> password) for demo login.
// These are demo-only accounts registered in user-store on demand.
export const DEMO_MERCHANT_ACCOUNTS = [
  {
    email: 'merchant@fubao.com',
    password: 'merchant123',
    name: 'Qingyun Temple Crafts',
    role: 'merchant' as const,
  },
  {
    email: 'craftsman@fubao.com',
    password: 'craft123',
    name: 'Li Family Talisman Workshop',
    role: 'merchant' as const,
  },
];

export const merchants: Merchant[] = [
  {
    id: 'mch-001',
    userId: 'usr-merchant-001',
    shopName: 'Qingyun Temple Crafts',
    shopSlug: 'qingyun-crafts',
    contactEmail: 'merchant@fubao.com',
    contactPhone: '+852 3000 1111',
    description:
      'Official craft shop of Qingyun Temple, Hong Kong. Hand-drawn talismans by resident Taoist masters, following traditions passed down for over 80 years.',
    logoKey: 'merchant-qingyun-logo',
    country: 'Hong Kong SAR',
    city: 'Hong Kong',
    address: '12 Temple Path, Wong Tai Sin',
    specialties: ['Protection', 'Home Blessing'],
    website: 'https://qingyuncrafts.example.com',
    certification: 'gold',
    certifiedAt: '2024-06-15',
    certificateNumber: 'FB-MCH-GOLD-001',
    commissionRate: 0.1,
    settlementCurrency: 'USDT',
    balance: 2450.75,
    totalSales: 42350.2,
    totalOrders: 312,
    rating: 4.9,
    status: 'approved',
    createdAt: '2024-05-01',
    updatedAt: '2025-06-10',
  },
  {
    id: 'mch-002',
    userId: 'usr-merchant-002',
    shopName: 'Li Family Talisman Workshop',
    shopSlug: 'li-family-workshop',
    contactEmail: 'craftsman@fubao.com',
    contactPhone: '+852 3000 2222',
    description:
      'A third-generation family workshop specializing in personalized birth-chart talismans. Every piece is drawn by Master Li Wei according to the customer birth chart.',
    country: 'Hong Kong SAR',
    city: 'Kowloon',
    specialties: ['Career', 'Gift Sets'],
    certification: 'certified',
    certifiedAt: '2024-09-20',
    certificateNumber: 'FB-MCH-CERT-002',
    commissionRate: 0.12,
    settlementCurrency: 'USD',
    balance: 1180.4,
    totalSales: 18220.0,
    totalOrders: 145,
    rating: 4.7,
    status: 'approved',
    createdAt: '2024-08-15',
    updatedAt: '2025-06-01',
  },
];

export const merchantApplications: MerchantApplication[] = [
  {
    id: 'app-001',
    shopName: 'Wudang Mountain Studio',
    contactName: 'Zhang Wei',
    contactEmail: 'zhang@wudang.example.com',
    contactPhone: '+86 755 1234 5678',
    country: 'China',
    city: 'Wudangshan',
    specialties: ['Protection', 'Career'],
    businessDescription:
      'Studio at the foot of Wudang Mountain producing meditation accessories and calligraphy talismans.',
    status: 'pending',
    createdAt: '2025-05-20',
  },
];

export const merchantProducts: MerchantProduct[] = [
  {
    id: 'mp-001',
    merchantId: 'mch-001',
    slug: 'temple-protection-charm',
    name: 'Temple Protection Charm',
    price: 24.9,
    category: 'Protection',
    tagline: 'Blessed at Qingyun Temple main hall',
    imageKey: 'merchant-qingyun-protection',
    stock: 45,
    soldCount: 128,
    status: 'active',
    createdAt: '2024-06-01',
  },
  {
    id: 'mp-002',
    merchantId: 'mch-001',
    slug: 'dragon-gate-fortune-scroll',
    name: 'Dragon Gate Fortune Scroll',
    price: 38.0,
    category: 'Career',
    tagline: 'For career breakthroughs and promotions',
    imageKey: 'merchant-qingyun-career',
    stock: 20,
    soldCount: 87,
    status: 'active',
    createdAt: '2024-07-10',
  },
  {
    id: 'mp-003',
    merchantId: 'mch-002',
    slug: 'birth-chart-custom-talisman',
    name: 'Birth-Chart Custom Talisman',
    price: 55.0,
    category: 'Protection',
    tagline: 'Personalized to your birth chart',
    imageKey: 'merchant-li-birthchart',
    stock: 12,
    soldCount: 64,
    status: 'active',
    createdAt: '2024-09-01',
  },
  {
    id: 'mp-004',
    merchantId: 'mch-002',
    slug: 'five-elements-gift-set',
    name: 'Five Elements Gift Set',
    price: 75.0,
    category: 'Gift Sets',
    tagline: 'Complete five-element balance set',
    imageKey: 'merchant-li-five-elements',
    stock: 8,
    soldCount: 31,
    status: 'active',
    createdAt: '2024-10-05',
  },
];

export const merchantOrders: MerchantOrder[] = [
  {
    id: 'MO-2025-0045',
    merchantId: 'mch-001',
    customerName: 'Sarah Miller',
    customerEmail: 'sarah@example.com',
    items: [{ name: 'Temple Protection Charm', price: 24.9, quantity: 2 }],
    subtotal: 49.8,
    commission: 4.98,
    netAmount: 44.82,
    status: 'completed',
    shippingAddress: '221B Baker Street, London, UK',
    createdAt: '2025-06-08',
  },
  {
    id: 'MO-2025-0046',
    merchantId: 'mch-001',
    customerName: 'James Chen',
    customerEmail: 'james@example.com',
    items: [
      { name: 'Dragon Gate Fortune Scroll', price: 38.0, quantity: 1 },
      { name: 'Temple Protection Charm', price: 24.9, quantity: 1 },
    ],
    subtotal: 62.9,
    commission: 6.29,
    netAmount: 56.61,
    status: 'processing',
    shippingAddress: '456 Market St, San Francisco, US',
    createdAt: '2025-06-12',
  },
  {
    id: 'MO-2025-0031',
    merchantId: 'mch-002',
    customerName: 'Emma Wilson',
    customerEmail: 'emma@example.com',
    items: [{ name: 'Birth-Chart Custom Talisman', price: 55.0, quantity: 1 }],
    subtotal: 55.0,
    commission: 6.6,
    netAmount: 48.4,
    status: 'shipped',
    shippingAddress: '789 Queen St, Toronto, Canada',
    createdAt: '2025-06-10',
  },
];

export const merchantWithdrawals: MerchantWithdrawal[] = [
  {
    id: 'wd-001',
    merchantId: 'mch-001',
    amount: 500,
    currency: 'USDT',
    payoutMethod: 'crypto',
    cryptoAddress: 'TXk8fYnJt3vBvKWq9bN2mQpLdR7sEw4aZc',
    cryptoNetwork: 'TRC20',
    status: 'completed',
    txHash: '0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    reviewedAt: '2025-05-28',
    createdAt: '2025-05-27',
  },
  {
    id: 'wd-002',
    merchantId: 'mch-001',
    amount: 800,
    currency: 'USDT',
    payoutMethod: 'crypto',
    cryptoAddress: 'TXk8fYnJt3vBvKWq9bN2mQpLdR7sEw4aZc',
    cryptoNetwork: 'TRC20',
    status: 'pending',
    createdAt: '2025-06-11',
  },
];

// ---------- Accessors ----------

export function getMerchantByUserId(userId: string): Merchant | undefined {
  return merchants.find((m) => m.userId === userId);
}

export function getMerchantByEmail(email: string): Merchant | undefined {
  return merchants.find(
    (m) => m.contactEmail.toLowerCase() === email.toLowerCase()
  );
}

export function getMerchantProducts(merchantId: string): MerchantProduct[] {
  return merchantProducts.filter((p) => p.merchantId === merchantId);
}

export function getMerchantOrders(merchantId: string): MerchantOrder[] {
  return merchantOrders
    .filter((o) => o.merchantId === merchantId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getMerchantWithdrawals(
  merchantId: string
): MerchantWithdrawal[] {
  return merchantWithdrawals
    .filter((w) => w.merchantId === merchantId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createMerchantApplication(input: {
  shopName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  country: string;
  city?: string;
  specialties: string[];
  businessDescription: string;
  website?: string;
  userId?: string;
}): MerchantApplication {
  const application: MerchantApplication = {
    id: `app-${Date.now()}`,
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  merchantApplications.push(application);
  return application;
}

export function createMerchantProduct(input: {
  merchantId: string;
  name: string;
  price: number;
  category: string;
  tagline: string;
  imageKey?: string;
  stock?: number;
}): MerchantProduct | { error: string } {
  const merchant = merchants.find((m) => m.id === input.merchantId);
  if (!merchant) return { error: 'Merchant not found' };
  if (merchant.status !== 'approved') {
    return { error: 'Merchant is not active' };
  }
  if (!input.name || input.price <= 0) {
    return { error: 'Valid name and price are required' };
  }

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const product: MerchantProduct = {
    id: `mp-${Date.now()}`,
    merchantId: input.merchantId,
    slug: `${merchant.shopSlug}-${slug}`,
    name: input.name,
    price: input.price,
    category: input.category,
    tagline: input.tagline,
    imageKey: input.imageKey ?? '',
    stock: input.stock ?? 0,
    soldCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  merchantProducts.push(product);
  return product;
}

export function updateMerchantProduct(
  productId: string,
  merchantId: string,
  updates: Partial<Pick<MerchantProduct, 'name' | 'price' | 'tagline' | 'stock' | 'status' | 'imageKey' | 'category'>>
): MerchantProduct | { error: string } {
  const product = merchantProducts.find(
    (p) => p.id === productId && p.merchantId === merchantId
  );
  if (!product) return { error: 'Product not found' };
  if (updates.price !== undefined && updates.price <= 0) {
    return { error: 'Price must be positive' };
  }

  Object.assign(product, updates);
  return product;
}

export function requestWithdrawal(input: {
  merchantId: string;
  amount: number;
  currency: 'USD' | 'USDT';
  payoutMethod: 'crypto' | 'bank';
  cryptoAddress?: string;
  cryptoNetwork?: string;
}): MerchantWithdrawal | { error: string } {
  const merchant = merchants.find((m) => m.id === input.merchantId);
  if (!merchant) return { error: 'Merchant not found' };
  if (input.amount <= 0) return { error: 'Amount must be positive' };
  if (input.amount > merchant.balance)
    return { error: 'Insufficient balance' };
  if (input.payoutMethod === 'crypto' && !input.cryptoAddress)
    return { error: 'Crypto address is required for crypto payouts' };

  const withdrawal: MerchantWithdrawal = {
    id: `wd-${Date.now()}`,
    merchantId: input.merchantId,
    amount: input.amount,
    currency: input.currency,
    payoutMethod: input.payoutMethod,
    cryptoAddress: input.cryptoAddress,
    cryptoNetwork: input.cryptoNetwork,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  merchantWithdrawals.push(withdrawal);
  merchant.balance -= input.amount; // Hold funds while pending
  return withdrawal;
}

export interface DashboardStats {
  totalRevenue: number; // Net of commission
  pendingSettlement: number; // Balance
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  totalProducts: number;
  lowStockProducts: number;
  completedWithdrawals: number;
  pendingWithdrawals: number;
}

export function getDashboardStats(merchantId: string): DashboardStats {
  const merchant = merchants.find((m) => m.id === merchantId);
  if (!merchant) {
    return {
      totalRevenue: 0,
      pendingSettlement: 0,
      totalOrders: 0,
      pendingOrders: 0,
      activeProducts: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      completedWithdrawals: 0,
      pendingWithdrawals: 0,
    };
  }

  const products = merchantProducts.filter((p) => p.merchantId === merchantId);
  const orders = merchantOrders.filter((o) => o.merchantId === merchantId);
  const withdrawals = merchantWithdrawals.filter(
    (w) => w.merchantId === merchantId
  );

  return {
    totalRevenue: orders
      .filter((o) => o.status !== 'refunded')
      .reduce((sum, o) => sum + o.netAmount, 0),
    pendingSettlement: merchant.balance,
    totalOrders: orders.length,
    pendingOrders: orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing'
    ).length,
    activeProducts: products.filter((p) => p.status === 'active').length,
    totalProducts: products.length,
    lowStockProducts: products.filter((p) => p.stock <= 10).length,
    completedWithdrawals: withdrawals.filter((w) => w.status === 'completed')
      .length,
    pendingWithdrawals: withdrawals.filter((w) => w.status === 'pending')
      .length,
  };
}

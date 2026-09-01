// Merchant ecosystem types

export type MerchantStatus =
  | 'pending' // Application submitted, awaiting review
  | 'approved' // Approved, operational
  | 'suspended' // Temporarily suspended
  | 'rejected'; // Application rejected

export type CertificationLevel = 'none' | 'verified' | 'certified' | 'gold';

export interface Merchant {
  id: string;
  userId: string; // Linked user account
  shopName: string;
  shopSlug: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  logoKey?: string;
  // Location
  country: string;
  city?: string;
  address?: string;
  // Business info
  specialties: string[]; // e.g. ['Protection', 'Career']
  website?: string;
  socialLinks?: Record<string, string>;
  // Certification
  certification: CertificationLevel;
  certifiedAt?: string;
  certificateNumber?: string;
  // Settlement
  commissionRate: number; // Platform cut, e.g. 0.1 = 10%
  settlementCurrency: 'USD' | 'USDT';
  balance: number; // Pending settlement amount
  totalSales: number;
  totalOrders: number;
  rating: number;
  // Status
  status: MerchantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantApplication {
  id: string;
  userId?: string;
  shopName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  country: string;
  city?: string;
  specialties: string[];
  businessDescription: string;
  website?: string;
  // Review
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface MerchantProduct {
  id: string;
  merchantId: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  tagline: string;
  imageKey: string;
  stock: number;
  soldCount: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface MerchantOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface MerchantOrder {
  id: string;
  merchantId: string;
  customerName: string;
  customerEmail: string;
  items: MerchantOrderItem[];
  subtotal: number;
  commission: number; // Platform commission
  netAmount: number; // What merchant receives
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'refunded';
  shippingAddress: string;
  createdAt: string;
}

export interface MerchantWithdrawal {
  id: string;
  merchantId: string;
  amount: number;
  currency: 'USD' | 'USDT';
  // Crypto payout details
  payoutMethod: 'crypto' | 'bank';
  cryptoAddress?: string;
  cryptoNetwork?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  txHash?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MerchantDashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  productCount: number;
  activeProducts: number;
  balance: number;
  rating: number;
  commissionRate: number;
  certification: CertificationLevel;
  recentOrders: MerchantOrder[];
  topProducts: Array<{ name: string; soldCount: number; revenue: number }>;
}

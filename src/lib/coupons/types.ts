// Coupon types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percentage (10 = 10%) or fixed amount in USD
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  couponId: string;
  userId: string;
  claimedAt: string;
  usedAt?: string;
  orderId?: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  error?: string;
}

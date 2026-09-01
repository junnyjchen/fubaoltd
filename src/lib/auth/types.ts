// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'merchant' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended profile
  phone?: string;
  country?: string;
  // Points & loyalty
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  // Referral
  referralCode: string;
  referredBy?: string;
  // Wallet
  walletBalance: number;
  walletCurrency: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

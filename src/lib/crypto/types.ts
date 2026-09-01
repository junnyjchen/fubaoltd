// Crypto payment types

export type CryptoNetwork = 'TRC20' | 'ERC20' | 'BEP20' | 'SOL' | 'POLYGON';
export type CryptoToken = 'USDT' | 'USDC';

export interface CryptoAddress {
  network: CryptoNetwork;
  address: string;
  label?: string;
  isDefault: boolean;
}

export interface CryptoPayment {
  id: string;
  orderId: string;
  userId: string;
  token: CryptoToken;
  network: CryptoNetwork;
  amount: number; // in token units (e.g., 29.9 USDT)
  exchangeRate: number; // USD to token rate (usually 1:1 for stablecoins)
  recipientAddress: string;
  status: 'pending' | 'awaiting_payment' | 'confirming' | 'completed' | 'expired' | 'failed';
  txHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

export interface DepositRequest {
  token: CryptoToken;
  network: CryptoNetwork;
  amount: number;
  txHash: string;
}

export interface WithdrawRequest {
  token: CryptoToken;
  network: CryptoNetwork;
  amount: number;
  toAddress: string;
}

export interface WalletBalance {
  USD: number;
  USDT: number;
  USDC: number;
}

// Supported networks and their confirmation requirements
export const NETWORK_CONFIG: Record<CryptoNetwork, { name: string; confirmations: number; explorerUrl: string; fee: number }> = {
  TRC20: { name: 'Tron (TRC-20)', confirmations: 19, explorerUrl: 'https://tronscan.org/#/transaction/', fee: 1 },
  ERC20: { name: 'Ethereum (ERC-20)', confirmations: 12, explorerUrl: 'https://etherscan.io/tx/', fee: 5 },
  BEP20: { name: 'BNB Chain (BEP-20)', confirmations: 15, explorerUrl: 'https://bscscan.com/tx/', fee: 0.5 },
  SOL: { name: 'Solana', confirmations: 32, explorerUrl: 'https://solscan.io/tx/', fee: 0.01 },
  POLYGON: { name: 'Polygon', confirmations: 128, explorerUrl: 'https://polygonscan.com/tx/', fee: 0.1 },
};

// Merchant receiving addresses (configurable via env)
export const MERCHANT_ADDRESSES: Record<CryptoNetwork, string> = {
  TRC20: process.env.CRYPTO_TRC20_ADDRESS || 'TMerchantAddressPlaceholder',
  ERC20: process.env.CRYPTO_ERC20_ADDRESS || '0xMerchantAddressPlaceholder',
  BEP20: process.env.CRYPTO_BEP20_ADDRESS || '0xMerchantBEP20Placeholder',
  SOL: process.env.CRYPTO_SOL_ADDRESS || 'SolMerchantAddressPlaceholder',
  POLYGON: process.env.CRYPTO_POLYGON_ADDRESS || '0xMerchantPolygonPlaceholder',
};

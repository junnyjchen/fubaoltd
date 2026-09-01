import type { CryptoPayment, CryptoNetwork, CryptoToken, WalletBalance } from './types';
import { generatePaymentId } from './validation';
import { NETWORK_CONFIG, MERCHANT_ADDRESSES } from './types';

// In-memory stores (replace with database in production)
const payments: Map<string, CryptoPayment> = new Map();
const walletBalances: Map<string, WalletBalance> = new Map();

// Initialize demo wallet
walletBalances.set('usr-demo-001', { USD: 0, USDT: 50, USDC: 25 });

export function getWalletBalance(userId: string): WalletBalance {
  return walletBalances.get(userId) || { USD: 0, USDT: 0, USDC: 0 };
}

export function updateWalletBalance(userId: string, token: keyof WalletBalance, amount: number): WalletBalance {
  const balance = getWalletBalance(userId);
  balance[token] = (balance[token] || 0) + amount;
  walletBalances.set(userId, balance);
  return balance;
}

export function createCryptoPayment(
  orderId: string,
  userId: string,
  amount: number,
  token: CryptoToken = 'USDT',
  network: CryptoNetwork = 'TRC20'
): CryptoPayment {
  const config = NETWORK_CONFIG[network];
  const payment: CryptoPayment = {
    id: generatePaymentId(),
    orderId,
    userId,
    token,
    network,
    amount,
    exchangeRate: 1, // Stablecoins are 1:1 with USD
    recipientAddress: MERCHANT_ADDRESSES[network],
    status: 'awaiting_payment',
    confirmations: 0,
    requiredConfirmations: config.confirmations,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    createdAt: new Date().toISOString(),
  };

  payments.set(payment.id, payment);
  return payment;
}

export function getPayment(paymentId: string): CryptoPayment | null {
  return payments.get(paymentId) || null;
}

export function getPaymentByOrder(orderId: string): CryptoPayment | null {
  for (const payment of payments.values()) {
    if (payment.orderId === orderId) return payment;
  }
  return null;
}

export function confirmPayment(paymentId: string, txHash: string): CryptoPayment | null {
  const payment = payments.get(paymentId);
  if (!payment) return null;

  payment.txHash = txHash;
  payment.status = 'confirming';
  payment.confirmations = 1;
  return payment;
}

export function completePayment(paymentId: string): CryptoPayment | null {
  const payment = payments.get(paymentId);
  if (!payment) return null;

  payment.status = 'completed';
  payment.completedAt = new Date().toISOString();
  payment.confirmations = payment.requiredConfirmations;

  // Credit wallet if applicable
  return payment;
}

export function expirePayment(paymentId: string): CryptoPayment | null {
  const payment = payments.get(paymentId);
  if (!payment) return null;
  payment.status = 'expired';
  return payment;
}

export function getUserPayments(userId: string): CryptoPayment[] {
  return Array.from(payments.values()).filter(p => p.userId === userId);
}

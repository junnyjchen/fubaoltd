import type { CryptoNetwork } from './types';

// Address validation patterns for different networks
const ADDRESS_PATTERNS: Record<CryptoNetwork, RegExp> = {
  TRC20: /^T[A-Za-z0-9]{33}$/,
  ERC20: /^0x[a-fA-F0-9]{40}$/,
  BEP20: /^0x[a-fA-F0-9]{40}$/,
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  POLYGON: /^0x[a-fA-F0-9]{40}$/,
};

export function validateAddress(address: string, network: CryptoNetwork): { valid: boolean; error?: string } {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }

  const pattern = ADDRESS_PATTERNS[network];
  if (!pattern.test(address.trim())) {
    return { valid: false, error: `Invalid ${network} address format` };
  }

  return { valid: true };
}

export function validateTxHash(txHash: string, network: CryptoNetwork): { valid: boolean; error?: string } {
  if (!txHash || txHash.trim().length === 0) {
    return { valid: false, error: 'Transaction hash is required' };
  }

  // Most networks use hex hashes (0x prefix for EVM)
  if (network === 'SOL') {
    // Solana uses base58 encoded hashes
    if (!/^[1-9A-HJ-NP-Za-km-z]{40,100}$/.test(txHash.trim())) {
      return { valid: false, error: 'Invalid Solana transaction hash' };
    }
  } else if (network === 'TRC20') {
    // Tron uses hex without 0x prefix
    if (!/^[a-fA-F0-9]{64}$/.test(txHash.trim())) {
      return { valid: false, error: 'Invalid Tron transaction hash' };
    }
  } else {
    // EVM chains (ERC20, BEP20, Polygon)
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())) {
      return { valid: false, error: `Invalid ${network} transaction hash` };
    }
  }

  return { valid: true };
}

export function getExplorerUrl(txHash: string, network: CryptoNetwork): string {
  const explorers: Record<CryptoNetwork, string> = {
    TRC20: 'https://tronscan.org/#/transaction/',
    ERC20: 'https://etherscan.io/tx/',
    BEP20: 'https://bscscan.com/tx/',
    SOL: 'https://solscan.io/tx/',
    POLYGON: 'https://polygonscan.com/tx/',
  };
  return `${explorers[network]}${txHash}`;
}

export function generatePaymentId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

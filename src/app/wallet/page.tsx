import type { Metadata } from 'next';
import WalletClient from './client';

export const metadata: Metadata = {
  title: 'Crypto Wallet — FuBao',
  description:
    'Manage your USDT and USDC balance — top up, deposit on-chain, and withdraw.',
};

export default function WalletPage() {
  return <WalletClient />;
}

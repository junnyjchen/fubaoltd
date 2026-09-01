import type { Metadata } from 'next';
import MerchantApplyClient from './client';

export const metadata: Metadata = {
  title: 'Merchant Application | FuBao',
  description: 'Apply to sell hand-crafted Taoist cultural artifacts on the FuBao marketplace.',
};

export default function MerchantApplyPage() {
  return <MerchantApplyClient />;
}

import type { Metadata } from 'next';
import ReferralClient from './client';

export const metadata: Metadata = {
  title: 'Referral Hub | FuBao',
  description:
    'Share FuBao with friends and earn commission on every referred order.',
};

export default function ReferralPage() {
  return <ReferralClient />;
}

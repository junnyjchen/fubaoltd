// Giveaway types
export interface Giveaway {
  id: string;
  title: string;
  description: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  totalPrizes: number;
  claimedCount: number;
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  requirements: {
    minAccountAge?: number; // days
    mustBeVerified?: boolean;
    mustFollow?: boolean;
    mustShare?: boolean;
  };
  winners: GiveawayWinner[];
  createdAt: string;
}

export interface GiveawayWinner {
  id: string;
  userId: string;
  userName: string;
  claimedAt: string;
  prizeFulfilled: boolean;
}

// ── Loyalty API Types ─────────────────────────────────────
// TypeScript interfaces for Loyalty API responses.
// Used by: loyaltyService, useUserLoyalty hook, LoyaltyCard component.

/**
 * A single loyalty transaction record from the API.
 */
export interface ApiLoyaltyTransaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "referral" | "expired" | string;
  points: number;
  description: string;
  date: string;
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Loyalty balance & tier info from the API.
 */
export interface ApiLoyaltyBalance {
  points: number;
  tier: string;
  lifetimePoints?: number;
  cashbackBalance?: number;
  nextTier?: string | null;
  pointsToNextTier?: number;
  progressToNextTier?: number;
  tierBenefits?: string[];
}

/**
 * Response shape for GET /api/v1/loyalty/transactions
 */
export interface LoyaltyTransactionsResponse {
  success: boolean;
  message?: string;
  transactions?: ApiLoyaltyTransaction[];
  data?: {
    transactions?: ApiLoyaltyTransaction[];
    [key: string]: unknown;
  };
}

/**
 * Response shape for GET /api/v1/loyalty/balance
 */
export interface LoyaltyBalanceResponse {
  success: boolean;
  message?: string;
  balance?: ApiLoyaltyBalance;
  data?: {
    balance?: ApiLoyaltyBalance;
    points?: number;
    tier?: string;
    [key: string]: unknown;
  };
}

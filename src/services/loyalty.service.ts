// ── Loyalty Service ───────────────────────────────────────
// Reusable service class for all Loyalty API endpoints.
// Architecture: Component → Hook → Service → apiClient → API Gateway
// Pattern matches: cart.service.ts, orders.service.ts

import { apiClient } from "@/lib/api-client";
import type {
  LoyaltyTransactionsResponse,
  LoyaltyBalanceResponse,
  ApiLoyaltyTransaction,
  ApiLoyaltyBalance,
} from "@/types/api-loyalty";

class LoyaltyService {
  // ── Base path ──
  private readonly basePath = "/api/v1/loyalty";

  /**
   * GET /api/v1/loyalty/transactions
   * Fetches the authenticated user's loyalty transaction history.
   */
  async getTransactionHistory(): Promise<LoyaltyTransactionsResponse> {
    try {
      const response = await apiClient.get<any>(`${this.basePath}/transactions`);

      // Normalize: API may return transactions at root or nested under `data`
      const transactions: ApiLoyaltyTransaction[] =
        response.transactions ||
        response.data?.transactions ||
        (Array.isArray(response.data) ? response.data : []);

      return {
        success: true,
        transactions,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("[LoyaltyService] Failed to fetch transaction history:", error);
      throw error;
    }
  }

  /**
   * GET /api/v1/loyalty/balance
   * Fetches the authenticated user's loyalty points and tier.
   */
  async getBalanceAndTier(): Promise<LoyaltyBalanceResponse> {
    try {
      const response = await apiClient.get<any>(`${this.basePath}/balance`);

      // Normalize: API may return balance at root or nested under `data`
      const balance: ApiLoyaltyBalance = response.balance ||
        response.data?.balance ||
        response.data || {
          points: response.points ?? 0,
          tier: response.tier ?? "Silver",
          lifetimePoints: response.lifetimePoints,
          cashbackBalance: response.cashbackBalance,
          nextTier: response.nextTier,
          pointsToNextTier: response.pointsToNextTier,
          progressToNextTier: response.progressToNextTier,
          tierBenefits: response.tierBenefits,
        };

      return {
        success: true,
        balance,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("[LoyaltyService] Failed to fetch balance and tier:", error);
      throw error;
    }
  }
}

// Singleton export
export const loyaltyService = new LoyaltyService();

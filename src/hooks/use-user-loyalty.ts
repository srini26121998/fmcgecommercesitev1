"use client";

// ── useUserLoyalty Hook ──────────────────────────────────
// Fetches loyalty data from API when logged in, falls back
// to the local Zustand loyalty-store when offline / unauthenticated.
// Pattern matches: use-user-cart.ts, use-user-orders.ts

import { useState, useEffect, useCallback } from "react";
import { loyaltyService } from "@/services/loyalty.service";
import { useAuthStore } from "@/store/auth-store";
import { useLoyaltyStore, TIER_THRESHOLDS, type LoyaltyTier, type LoyaltyTransaction } from "@/store/loyalty-store";
import type { ApiLoyaltyTransaction, ApiLoyaltyBalance } from "@/types/api-loyalty";

// ── Helpers: map API data → local store shape ────────────

function mapApiTransaction(apiTxn: ApiLoyaltyTransaction): LoyaltyTransaction {
  return {
    id: apiTxn.id,
    type: (["earned", "redeemed", "bonus", "referral"].includes(apiTxn.type)
      ? apiTxn.type
      : "earned") as LoyaltyTransaction["type"],
    points: apiTxn.points,
    description: apiTxn.description,
    date: apiTxn.date || apiTxn.createdAt || new Date().toLocaleDateString("en-IN"),
  };
}

function resolveNextTier(currentTier: string): LoyaltyTier | null {
  const tiers: LoyaltyTier[] = ["Silver", "Gold", "Platinum", "SuperSaver"];
  const idx = tiers.indexOf(currentTier as LoyaltyTier);
  return idx >= 0 && idx < tiers.length - 1 ? tiers[idx + 1] : null;
}

function resolveProgress(lifetimePoints: number, currentTier: LoyaltyTier): number {
  const nextTier = resolveNextTier(currentTier);
  if (!nextTier) return 100;
  const currentThreshold = TIER_THRESHOLDS[currentTier] ?? 0;
  const nextThreshold = TIER_THRESHOLDS[nextTier] ?? 1;
  return Math.min(100, ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

// ── Hook ─────────────────────────────────────────────────

export function useUserLoyalty() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Local Zustand store (fallback)
  const localPoints = useLoyaltyStore((s) => s.points);
  const localTier = useLoyaltyStore((s) => s.tier);
  const localLifetimePoints = useLoyaltyStore((s) => s.lifetimePoints);
  const localCashbackBalance = useLoyaltyStore((s) => s.cashbackBalance);
  const localTransactions = useLoyaltyStore((s) => s.transactions);
  const localGetNextTier = useLoyaltyStore((s) => s.getNextTier);
  const localGetProgress = useLoyaltyStore((s) => s.getProgressToNextTier);
  const localGetBenefits = useLoyaltyStore((s) => s.getBenefits);

  // API state
  const [apiBalance, setApiBalance] = useState<ApiLoyaltyBalance | null>(null);
  const [apiTransactions, setApiTransactions] = useState<ApiLoyaltyTransaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  // ── Fetch balance & tier ──
  const fetchBalance = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await loyaltyService.getBalanceAndTier();
      if (res.balance) {
        setApiBalance(res.balance);
        setIsApiAvailable(true);
      }
    } catch (err: any) {
      console.warn("[useUserLoyalty] Balance API unavailable, using local store:", err?.message);
      setIsApiAvailable(false);
    }
  }, [isLoggedIn]);

  // ── Fetch transaction history ──
  const fetchTransactions = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await loyaltyService.getTransactionHistory();
      if (res.transactions) {
        setApiTransactions(res.transactions);
        setIsApiAvailable(true);
      }
    } catch (err: any) {
      console.warn("[useUserLoyalty] Transactions API unavailable, using local store:", err?.message);
    }
  }, [isLoggedIn]);

  // ── Combined fetch ──
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchBalance(), fetchTransactions()]);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch loyalty data");
    } finally {
      setLoading(false);
    }
  }, [fetchBalance, fetchTransactions]);

  // Auto-fetch on login
  useEffect(() => {
    if (isLoggedIn) {
      refresh();
    } else {
      setIsApiAvailable(false);
      setApiBalance(null);
      setApiTransactions(null);
    }
  }, [isLoggedIn, refresh]);

  // ── Unified data (API-first, local fallback) ──

  const tier = (isApiAvailable && apiBalance?.tier
    ? apiBalance.tier
    : localTier) as LoyaltyTier;

  const points = isApiAvailable && apiBalance
    ? apiBalance.points
    : localPoints;

  const lifetimePoints = isApiAvailable && apiBalance?.lifetimePoints != null
    ? apiBalance.lifetimePoints
    : localLifetimePoints;

  const cashbackBalance = isApiAvailable && apiBalance?.cashbackBalance != null
    ? apiBalance.cashbackBalance
    : localCashbackBalance;

  const nextTier = isApiAvailable && apiBalance?.nextTier !== undefined
    ? apiBalance.nextTier as LoyaltyTier | null
    : (isApiAvailable ? resolveNextTier(tier) : localGetNextTier());

  const progressToNextTier = isApiAvailable && apiBalance?.progressToNextTier != null
    ? apiBalance.progressToNextTier
    : (isApiAvailable ? resolveProgress(lifetimePoints, tier) : localGetProgress());

  const pointsToNextTier = isApiAvailable && apiBalance?.pointsToNextTier != null
    ? apiBalance.pointsToNextTier
    : (nextTier ? Math.max(0, TIER_THRESHOLDS[nextTier] - points) : 0);

  const tierBenefits = isApiAvailable && apiBalance?.tierBenefits
    ? apiBalance.tierBenefits
    : localGetBenefits();

  const transactions: LoyaltyTransaction[] = isApiAvailable && apiTransactions
    ? apiTransactions.map(mapApiTransaction)
    : localTransactions;

  return {
    // Core data
    points,
    tier,
    lifetimePoints,
    cashbackBalance,
    nextTier,
    progressToNextTier,
    pointsToNextTier,
    tierBenefits,
    transactions,

    // State
    loading,
    error,
    isApiAvailable,

    // Actions
    refresh,
  };
}

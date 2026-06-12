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

// ── Helpers ────────────
// (Removed API helpers to enforce strictly local dynamic state)

// ── Hook ─────────────────────────────────────────────────

export function useUserLoyalty() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Local Zustand store
  const points = useLoyaltyStore((s) => s.points);
  const tier = useLoyaltyStore((s) => s.tier);
  const lifetimePoints = useLoyaltyStore((s) => s.lifetimePoints);
  const cashbackBalance = useLoyaltyStore((s) => s.cashbackBalance);
  const transactions = useLoyaltyStore((s) => s.transactions);
  const getNextTier = useLoyaltyStore((s) => s.getNextTier);
  const getProgressToNextTier = useLoyaltyStore((s) => s.getProgressToNextTier);
  const getBenefits = useLoyaltyStore((s) => s.getBenefits);

  const nextTier = getNextTier();
  const progressToNextTier = getProgressToNextTier();
  const pointsToNextTier = nextTier ? Math.max(0, TIER_THRESHOLDS[nextTier] - points) : 0;
  const tierBenefits = getBenefits();

  // If user is not logged in, return empty/default state
  if (!isLoggedIn) {
    return {
      points: 0,
      tier: "Silver" as LoyaltyTier,
      lifetimePoints: 0,
      cashbackBalance: 0,
      nextTier: "Gold" as LoyaltyTier,
      progressToNextTier: 0,
      pointsToNextTier: TIER_THRESHOLDS["Gold"],
      tierBenefits: [],
      transactions: [],
      loading: false,
      error: null,
      isApiAvailable: false,
      refresh: async () => {},
    };
  }

  // Deduplicate transactions to handle legacy localStorage duplicate IDs
  const uniqueTransactions = Array.from(
    new Map(transactions.map((txn) => [`${txn.id}-${txn.description}`, txn])).values()
  );

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
    transactions: uniqueTransactions,

    // State
    loading: false,
    error: null,
    isApiAvailable: false,

    // Actions
    refresh: async () => {}, // No-op since we use dynamic local state
  };
}

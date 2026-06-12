"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoyaltyTier = "Silver" | "Gold" | "Platinum" | "SuperSaver";

export interface LoyaltyTransaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "referral";
  points: number;
  description: string;
  date: string;
}

export interface ReferralInfo {
  code: string;
  totalReferrals: number;
  totalEarned: number;
}

export const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  Silver: 0,
  Gold: 500,
  Platinum: 1500,
  SuperSaver: 3000,
};

const TIER_BENEFITS: Record<LoyaltyTier, string[]> = {
  Silver: ["Free delivery above ₹99", "Birthday bonus 50 points"],
  Gold: ["Free delivery on all orders", "5% cashback on every order", "Priority support"],
  Platinum: ["Free delivery on all orders", "10% cashback on every order", "Priority support", "Exclusive early access to deals", "Dedicated delivery slot"],
  SuperSaver: ["Free delivery on all orders", "15% cashback on every order", "VIP support", "Exclusive early access to deals", "Dedicated delivery slot", "Free gifts on every 10th order", "Personal shopping assistant"],
};

interface LoyaltyStore {
  points: number;
  tier: LoyaltyTier;
  lifetimePoints: number;
  cashbackBalance: number;
  transactions: LoyaltyTransaction[];
  referral: ReferralInfo;
  addPoints: (points: number, description: string, type?: LoyaltyTransaction["type"]) => void;
  redeemPoints: (points: number, description: string) => boolean;
  addReferralBonus: () => void;
  getTier: () => LoyaltyTier;
  getNextTier: () => LoyaltyTier | null;
  getProgressToNextTier: () => number;
  getBenefits: () => string[];
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      points: 200,
      tier: "Silver",
      lifetimePoints: 200,
      cashbackBalance: 0,
      transactions: [
        {
          id: "txn_1",
          type: "earned",
          points: 50,
          description: "Welcome bonus",
          date: new Date(Date.now() - 86400000 * 7).toLocaleDateString("en-IN"),
        },
        {
          id: "txn_2",
          type: "earned",
          points: 150,
          description: "Order #12340",
          date: new Date(Date.now() - 86400000 * 3).toLocaleDateString("en-IN"),
        },
      ],
      referral: {
        code: "USER2024",
        totalReferrals: 3,
        totalEarned: 150,
      },

      addPoints: (points, description, type = "earned") =>
        set((state) => {
          const newLifetime = state.lifetimePoints + points;
          let newTier: LoyaltyTier = "Silver";
          const entries = Object.entries(TIER_THRESHOLDS) as [LoyaltyTier, number][];
          for (const [tier, threshold] of entries) {
            if (newLifetime >= threshold) newTier = tier;
          }

          return {
            points: state.points + points,
            lifetimePoints: newLifetime,
            tier: newTier,
            cashbackBalance:
              type === "earned"
                ? state.cashbackBalance + Math.round(points * 0.1)
                : state.cashbackBalance,
            transactions: [
              {
                id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                type,
                points,
                description,
                date: new Date().toLocaleDateString("en-IN"),
              },
              ...state.transactions,
            ],
          };
        }),

      redeemPoints: (points, description) => {
        const state = get();
        if (state.points < points) return false;
        set({
          points: state.points - points,
          transactions: [
            {
              id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              type: "redeemed",
              points: -points,
              description,
              date: new Date().toLocaleDateString("en-IN"),
            },
            ...state.transactions,
          ],
        });
        return true;
      },

      addReferralBonus: () =>
        set((state) => ({
          referral: {
            ...state.referral,
            totalReferrals: state.referral.totalReferrals + 1,
            totalEarned: state.referral.totalEarned + 50,
          },
        })),

      getTier: () => get().tier,

      getNextTier: () => {
        const tiers: LoyaltyTier[] = ["Silver", "Gold", "Platinum", "SuperSaver"];
        const currentIndex = tiers.indexOf(get().tier);
        return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
      },

      getProgressToNextTier: () => {
        const { lifetimePoints } = get();
        const nextTier = get().getNextTier();
        if (!nextTier) return 100;
        const currentThreshold = TIER_THRESHOLDS[get().tier];
        const nextThreshold = TIER_THRESHOLDS[nextTier];
        return Math.min(
          100,
          ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        );
      },

      getBenefits: () => TIER_BENEFITS[get().tier],
    }),
    { name: "loyalty-storage" }
  )
);

if (typeof window !== "undefined") {
  (window as any).useLoyaltyStore = useLoyaltyStore;
}

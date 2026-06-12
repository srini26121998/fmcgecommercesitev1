"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MembershipPlan = "free" | "silver" | "gold" | "prime";

export interface MembershipBenefit {
  icon: string;
  title: string;
  description: string;
}

export const MEMBERSHIP_PLANS: Record<
  MembershipPlan,
  {
    name: string;
    price: number;
    billingCycle: "monthly" | "annual" | "free";
    color: string;
    badge: string;
    benefits: MembershipBenefit[];
  }
> = {
  free: {
    name: "Basic",
    price: 0,
    billingCycle: "free",
    color: "#999",
    badge: "FREE",
    benefits: [
      { icon: "🚚", title: "Free delivery above ₹499", description: "Standard 2-hour delivery" },
      { icon: "🏷️", title: "Occasional offers", description: "Access to weekend deals" },
    ],
  },
  silver: {
    name: "Silver",
    price: 99,
    billingCycle: "monthly",
    color: "#9ca3af",
    badge: "SILVER",
    benefits: [
      { icon: "🚚", title: "Free delivery above ₹199", description: "2-hour delivery" },
      { icon: "💰", title: "2% cashback on every order", description: "Credited to wallet" },
      { icon: "🎁", title: "Birthday month bonus", description: "100 bonus loyalty points" },
      { icon: "🏷️", title: "Member-only deals", description: "5% extra off on 200+ brands" },
    ],
  },
  gold: {
    name: "Gold",
    price: 199,
    billingCycle: "monthly",
    color: "#f59e0b",
    badge: "GOLD",
    benefits: [
      { icon: "🚚", title: "Always free delivery", description: "All orders, no minimum" },
      { icon: "💰", title: "5% cashback on every order", description: "Credited to wallet" },
      { icon: "⚡", title: "Priority 30-min delivery", description: "Jump the delivery queue" },
      { icon: "🎁", title: "Monthly surprise box", description: "Free FMCG sample kit" },
      { icon: "🏷️", title: "Early access to sales", description: "48 hrs before public" },
      { icon: "📞", title: "Priority support", description: "Dedicated helpline" },
    ],
  },
  prime: {
    name: "FMCG Prime",
    price: 999,
    billingCycle: "annual",
    color: "#ff4f8b",
    badge: "PRIME ✦",
    benefits: [
      { icon: "🚚", title: "Unlimited free express delivery", description: "10-min delivery included" },
      { icon: "💰", title: "10% cashback on every order", description: "Credited instantly to wallet" },
      { icon: "🎁", title: "Quarterly gift hampers", description: "Curated premium FMCG bundles" },
      { icon: "🏷️", title: "Exclusive Prime pricing", description: "Up to 30% off vs. non-members" },
      { icon: "⚡", title: "First access to new launches", description: "Trial new products free" },
      { icon: "📞", title: "24/7 VIP concierge", description: "Dedicated personal shopper" },
      { icon: "🔄", title: "Free returns, always", description: "No questions asked" },
      { icon: "👨‍👩‍👧", title: "Family sharing (up to 4)", description: "Share benefits with family" },
    ],
  },
};

interface MembershipStore {
  plan: MembershipPlan;
  expiryDate: string | null;
  autoRenew: boolean;
  enrolledAt: string | null;
  subscribe: (plan: MembershipPlan) => void;
  cancel: () => void;
  toggleAutoRenew: () => void;
  isActive: () => boolean;
  getDaysRemaining: () => number;
}

export const useMembershipStore = create<MembershipStore>()(
  persist(
    (set, get) => ({
      plan: "free",
      expiryDate: null,
      autoRenew: true,
      enrolledAt: null,

      subscribe: (plan) => {
        const now = new Date();
        const billingCycle = MEMBERSHIP_PLANS[plan].billingCycle;
        const expiry = new Date(now);
        if (billingCycle === "monthly") expiry.setMonth(expiry.getMonth() + 1);
        else if (billingCycle === "annual") expiry.setFullYear(expiry.getFullYear() + 1);

        set({
          plan,
          expiryDate: billingCycle !== "free" ? expiry.toISOString() : null,
          enrolledAt: now.toISOString(),
          autoRenew: true,
        });
      },

      cancel: () =>
        set((state) => ({ ...state, autoRenew: false })),

      toggleAutoRenew: () =>
        set((state) => ({ autoRenew: !state.autoRenew })),

      isActive: () => {
        const { plan, expiryDate } = get();
        if (plan === "free") return true;
        if (!expiryDate) return false;
        return new Date(expiryDate) > new Date();
      },

      getDaysRemaining: () => {
        const { expiryDate } = get();
        if (!expiryDate) return 0;
        const diff = new Date(expiryDate).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / 86400000));
      },
    }),
    { name: "fmcg-membership-store" }
  )
);

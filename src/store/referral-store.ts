"use client";

import { create } from "zustand";
import { referralsService } from "@/services/referrals.service";

export interface ReferralEntry {
  id: string;
  referredEmail: string;
  status: "invited" | "joined" | "purchased" | string;
  reward: number;
  date: string;
}

interface ReferralStore {
  referralCode: string;
  referrals: ReferralEntry[];
  totalEarned: number;
  isLoading: boolean;
  error: string | null;

  fetchReferrals: () => Promise<void>;
  claimReward: () => Promise<void>;
  
  // Deprecated mocks
  initCode: (userName: string) => void;
  addReferral: (email: string) => void;
}

export const useReferralStore = create<ReferralStore>((set, get) => ({
  referralCode: "",
  referrals: [],
  totalEarned: 0,
  isLoading: false,
  error: null,

  fetchReferrals: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await referralsService.getReferrals();
      
      const mappedFriends: ReferralEntry[] = data.friends.map((f, i) => ({
        id: `FRD-${i}`,
        referredEmail: f.name, // BE returns name or email
        status: f.status.toLowerCase(),
        reward: f.rewardClaimed ? 500 : (f.status === "COMPLETED" ? 500 : 0),
        date: new Date().toISOString()
      }));

      set({ 
        referralCode: data.myReferralCode, 
        totalEarned: data.totalLoyaltyPointsEarned,
        referrals: mappedFriends,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch referrals", isLoading: false });
    }
  },

  claimReward: async () => {
    set({ isLoading: true, error: null });
    try {
      await referralsService.claimReward();
      await get().fetchReferrals();
    } catch (error: any) {
      set({ error: error.message || "Failed to claim reward", isLoading: false });
    }
  },

  // Keep for UI backwards compatibility if needed, but they don't do real DB logic
  initCode: (userName) => {},
  addReferral: (email) => {}
}));

export function selectTotalEarned(referrals: ReferralEntry[]): number {
  return useReferralStore.getState().totalEarned;
}

export function selectPendingEarned(referrals: ReferralEntry[]): number {
  return 0; // Simplified for new backend logic
}

if (typeof window !== "undefined") {
  (window as any).useReferralStore = useReferralStore;
}

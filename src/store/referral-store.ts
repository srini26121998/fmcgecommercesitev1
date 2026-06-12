"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ReferralEntry {
  id: string;
  referredEmail: string;
  status: "invited" | "joined" | "purchased";
  reward: number;
  date: string;
}

interface ReferralStore {
  /** Personalised code — generated from user's name on first login */
  referralCode: string;
  referrals: ReferralEntry[];

  /** Initialise/refresh the referral code from the authenticated user's name */
  initCode: (userName: string) => void;

  /** Add a new invited referral entry */
  addReferral: (email: string) => void;

  /**
   * Progress a referral to joined/purchased.
   * Reward amounts: joined = ₹50, purchased = ₹200.
   * Callers (e.g. checkout flow) should also credit wallet + loyalty on "purchased".
   */
  updateReferralStatus: (id: string, status: ReferralEntry["status"]) => void;

  /**
   * Called by checkout after an order is placed.
   * Finds the referral for referredEmail and marks it as "purchased".
   * Returns true if a referral was found and updated.
   */
  markReferralPurchased: (referredEmail: string) => boolean;
}

function generateCode(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  const year = new Date().getFullYear().toString().slice(-2);
  return `FMCG-${slug}-${year}`;
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      referralCode: "FMCG-USER-25",
      referrals: [
        { id: "REF-001", referredEmail: "priya@example.com", status: "purchased", reward: 200, date: "2026-05-10" },
        { id: "REF-002", referredEmail: "amit@example.com", status: "joined", reward: 50, date: "2026-05-12" },
        { id: "REF-003", referredEmail: "neha@example.com", status: "invited", reward: 0, date: "2026-05-15" },
      ],

      initCode: (userName) => {
        const current = get().referralCode;
        // Only regenerate if still using the default stub code
        if (current === "FMCG-USER-25" || !current) {
          set({ referralCode: generateCode(userName) });
        }
      },

      addReferral: (email) =>
        set((state) => ({
          referrals: [
            {
              id: `REF-${String(state.referrals.length + 1).padStart(3, "0")}`,
              referredEmail: email,
              status: "invited",
              reward: 0,
              date: new Date().toISOString().split("T")[0],
            },
            ...state.referrals,
          ],
        })),

      updateReferralStatus: (id, status) =>
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  reward: status === "purchased" ? 200 : status === "joined" ? 50 : 0,
                }
              : r
          ),
        })),

      markReferralPurchased: (referredEmail) => {
        const state = get();
        const ref = state.referrals.find(
          (r) => r.referredEmail === referredEmail && r.status !== "purchased"
        );
        if (!ref) return false;
        get().updateReferralStatus(ref.id, "purchased");
        return true;
      },
    }),
    { name: "fmcg-referral-store" }
  )
);

// ── Selector helpers (call inside components) ───────────────
/** Computed: sum of rewards for joined + purchased referrals */
export function selectTotalEarned(referrals: ReferralEntry[]): number {
  return referrals
    .filter((r) => r.status === "purchased" || r.status === "joined")
    .reduce((sum, r) => sum + r.reward, 0);
}

/** Computed: sum of rewards for joined-only referrals (not yet purchased) */
export function selectPendingEarned(referrals: ReferralEntry[]): number {
  return referrals
    .filter((r) => r.status === "joined")
    .reduce((sum, r) => sum + r.reward, 0);
}

if (typeof window !== "undefined") {
  (window as any).useReferralStore = useReferralStore;
}

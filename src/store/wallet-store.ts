"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletTxnType = "topup" | "spend" | "refund" | "gift_card" | "cashback";

export type WalletTxnStatus = "pending" | "credited" | "expired";

export interface WalletTransaction {
  id: string;
  type: WalletTxnType;
  amount: number;
  description: string;
  date: string;
  /** positive = credit, negative = debit */
  delta: number;
  balanceAfter: number;
  status: WalletTxnStatus;
}

interface WalletStore {
  balance: number;
  transactions: WalletTransaction[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  /** Credit the wallet (top-up, refund, cashback) */
  credit: (amount: number, description: string, type?: WalletTxnType) => void;
  /** Add a pending transaction */
  addPendingTransaction: (amount: number, description: string, type: WalletTxnType) => void;
  /** Debit the wallet. Returns false if insufficient balance. */
  debit: (amount: number, description: string) => boolean;
  /** Redeem a gift card — adds balance */
  redeemGiftCard: (code: string, amount: number) => boolean;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 250,
      _hasHydrated: false,
      transactions: [
        {
          id: "wtxn_1",
          type: "topup",
          amount: 500,
          description: "Wallet top-up via UPI",
          date: new Date(Date.now() - 86400000 * 10).toLocaleDateString("en-IN"),
          delta: 500,
          balanceAfter: 500,
          status: "credited",
        },
        {
          id: "wtxn_2",
          type: "spend",
          amount: 299,
          description: "Order #ORD-20240112",
          date: new Date(Date.now() - 86400000 * 5).toLocaleDateString("en-IN"),
          delta: -299,
          balanceAfter: 201,
          status: "credited",
        },
        {
          id: "wtxn_3",
          type: "cashback",
          amount: 49,
          description: "5% cashback on Order #ORD-20240112",
          date: new Date(Date.now() - 86400000 * 4).toLocaleDateString("en-IN"),
          delta: 49,
          balanceAfter: 250,
          status: "credited",
        },
      ],

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      credit: (amount, description, type = "topup") =>
        set((state) => {
          const newBalance = state.balance + amount;
          return {
            balance: newBalance,
            transactions: [
              {
                id: `wtxn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                type,
                amount,
                description,
                date: new Date().toLocaleDateString("en-IN"),
                delta: amount,
                balanceAfter: newBalance,
                status: "credited",
              },
              ...state.transactions,
            ],
          };
        }),

      addPendingTransaction: (amount, description, type) =>
        set((state) => {
          return {
            transactions: [
              {
                id: `wtxn_pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                type,
                amount,
                description,
                date: new Date().toLocaleDateString("en-IN"),
                delta: amount,
                balanceAfter: state.balance, // Balance doesn't update for pending
                status: "pending",
              },
              ...state.transactions,
            ],
          };
        }),

      debit: (amount, description) => {
        const { balance } = get();
        if (balance < amount) return false;
        set((state) => {
          const newBalance = state.balance - amount;
          return {
            balance: newBalance,
            transactions: [
              {
                id: `wtxn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                type: "spend",
                amount,
                description,
                date: new Date().toLocaleDateString("en-IN"),
                delta: -amount,
                balanceAfter: newBalance,
                status: "credited",
              },
              ...state.transactions,
            ],
          };
        });
        return true;
      },

      redeemGiftCard: (code, amount) => {
        // In production this would validate via API.
        if (!code.trim() || amount <= 0) return false;
        get().credit(amount, `Gift card redeemed: ${code}`, "gift_card");
        return true;
      },
    }),
    {
      name: "fmcg-wallet-store",
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) state.setHasHydrated(true);
      },
    }
  )
);

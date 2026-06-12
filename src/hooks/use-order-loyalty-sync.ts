"use client";

/**
 * useOrderLoyaltySync
 * ─────────────────────────────────────────────────────────────
 * Industry-standard loyalty event bridge.
 *
 * When to award points (FMCG industry norm):
 *   • Order Placed    → 1 point per ₹10 spent  (basket reward)
 *   • Order Delivered → 1 point per ₹10 spent  (confirmation reward)
 *   • Referral join   → 50 pts bonus
 *   • Referral purchase → 100 pts bonus + ₹200 wallet credit
 *
 * This hook observes the order store and reacts to new delivered/placed
 * orders that haven't been credited yet (tracked via a local set).
 */

import { useEffect, useRef } from "react";
import { useOrderStore } from "@/store/order-store";
import { useLoyaltyStore } from "@/store/loyalty-store";
import { useWalletStore } from "@/store/wallet-store";
import { useAuthStore } from "@/store/auth-store";
import { useMembershipStore } from "@/store/membership-store";

/** Cashback % by membership plan */
const CASHBACK_RATES: Record<string, number> = {
  free: 0,
  silver: 0.02,
  gold: 0.05,
  prime: 0.10,
};

/** Points earned per ₹10 spent */
const POINTS_PER_10_RS = 1;

export function useOrderLoyaltySync() {
  const orders = useOrderStore((s) => s.orders);
  const addPoints = useLoyaltyStore((s) => s.addPoints);
  const transactions = useLoyaltyStore((s) => s.transactions);
  const credit = useWalletStore((s) => s.credit);
  const walletTransactions = useWalletStore((s) => s.transactions);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const plan = useMembershipStore((s) => s.plan);

  // Track which order IDs have already been credited to avoid double-counting
  const creditedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) return;

    orders.forEach((order) => {
      const isDelivered = order.status === "Delivered";
      const isPlaced =
        order.status === "Processing" || order.status === "Out for Delivery";

      if (!isDelivered && !isPlaced) return;

      const expectedDesc = isDelivered ? `Order ${order.id} delivered` : `Order ${order.id} placed`;

      if (creditedRef.current.has(expectedDesc)) return;

      // Ensure we don't process if already exists in store
      const alreadyCredited = transactions.some((txn) => txn.description === expectedDesc);
      if (alreadyCredited) {
        creditedRef.current.add(expectedDesc);
        return;
      }

      // Mark as credited immediately to avoid double processing
      creditedRef.current.add(expectedDesc);

      const orderTotal = order.total || 0;
      const pointsEarned = Math.floor((orderTotal / 10) * POINTS_PER_10_RS);

      if (isDelivered) {
        // Award loyalty points on delivery
        if (pointsEarned > 0) {
          addPoints(
            pointsEarned,
            `Order ${order.id} delivered`,
            "earned"
          );
        }

        // Award cashback to wallet based on membership tier
        const cashbackRate = CASHBACK_RATES[plan] ?? 0;
        if (cashbackRate > 0 && orderTotal > 0) {
          const cashback = Math.round(orderTotal * cashbackRate);
          if (cashback > 0) {
            credit(
              cashback,
              `${Math.round(cashbackRate * 100)}% cashback – Order ${order.id}`,
              "cashback"
            );
          }
        }
      } else if (isPlaced) {
        // Smaller "order placed" bonus (common in Swiggy/Zepto loyalty)
        const placedBonus = Math.floor(pointsEarned / 2);
        if (placedBonus > 0) {
          addPoints(
            placedBonus,
            `Order ${order.id} placed`,
            "earned"
          );
        }
      }
    });
  }, [orders, isLoggedIn, addPoints, credit, plan, transactions, walletTransactions]);
}

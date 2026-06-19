"use client";

import { create } from "zustand";
import { returnsService, ReturnResponse } from "@/services/returns.service";

export type ReturnReason =
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "size_issue"
  | "damaged"
  | "expired"
  | "other"
  | string;

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  reason: ReturnReason;
  details: string;
  status: "pending" | "approved" | "rejected" | "picked_up" | "refunded" | string;
  createdAt: string;
  updatedAt: string;
  refundAmount: number;
  tracking?: string;
}

interface ReturnsStore {
  returns: ReturnRequest[];
  isLoading: boolean;
  error: string | null;

  fetchReturns: () => Promise<void>;
  createReturn: (orderId: number, reason: string, items: { orderItemId: number, qty: number }[]) => Promise<void>;
  getReturnsByOrder: (orderId: string) => ReturnRequest[];
}

export const useReturnsStore = create<ReturnsStore>((set, get) => ({
  returns: [],
  isLoading: false,
  error: null,

  fetchReturns: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await returnsService.getReturnsHistory();
      
      // Map API array to UI state array
      const mappedReturns: ReturnRequest[] = data.flatMap((apiReturn: ReturnResponse) => 
        apiReturn.items.map((item) => ({
          id: `RET-${apiReturn.id}-${item.id}`,
          orderId: apiReturn.orderNumber,
          productId: String(item.productTitle),
          productName: item.productTitle,
          productImage: "/placeholder.svg?text=Item", // fallback
          quantity: item.qty,
          reason: apiReturn.reason,
          details: "",
          status: apiReturn.status.toLowerCase(),
          createdAt: apiReturn.createdAt,
          updatedAt: apiReturn.createdAt,
          refundAmount: apiReturn.refundAmount
        }))
      );

      set({ returns: mappedReturns, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch returns", isLoading: false });
    }
  },

  createReturn: async (orderId, reason, items) => {
    set({ isLoading: true, error: null });
    try {
      await returnsService.submitReturn(orderId, reason, items);
      await get().fetchReturns();
    } catch (error: any) {
      set({ error: error.message || "Failed to submit return", isLoading: false });
    }
  },

  getReturnsByOrder: (orderId) => get().returns.filter((r) => r.orderId === orderId),
}));

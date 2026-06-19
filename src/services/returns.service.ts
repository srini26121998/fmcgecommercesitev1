import { apiClient } from "@/lib/api-client";

export interface ReturnItemRequest {
  orderItemId: number;
  qty: number;
}

export interface ReturnItemResponse {
  id: number;
  orderItemId: number;
  productTitle: string;
  qty: number;
}

export interface ReturnResponse {
  id: number;
  orderNumber: string;
  reason: string;
  status: string; // PENDING, APPROVED, REFUNDED, REJECTED
  refundAmount: number;
  createdAt: string;
  items: ReturnItemResponse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const returnsService = {
  getReturnsHistory: async (): Promise<ReturnResponse[]> => {
    const res = await apiClient.get<ApiResponse<ReturnResponse[]>>("/api/v1/orders/returns");
    return res.data;
  },
  
  submitReturn: async (orderId: number, reason: string, items: ReturnItemRequest[]): Promise<ReturnResponse> => {
    const res = await apiClient.post<ApiResponse<ReturnResponse>>("/api/v1/orders/returns", { orderId, reason, items });
    return res.data;
  }
};

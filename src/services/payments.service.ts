import { apiClient } from "@/lib/api-client";

export interface SavedPaymentResponse {
  id: number;
  provider: string; // VISA, MASTERCARD, UPI, etc.
  type: string; // CARD, UPI
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const paymentsService = {
  getPayments: async (): Promise<SavedPaymentResponse[]> => {
    const res = await apiClient.get<ApiResponse<SavedPaymentResponse[]>>("/api/v1/user/payments");
    return res.data;
  },
  
  savePayment: async (payload: { token: string, provider: string, type: string, last4: string, expiryMonth?: number, expiryYear?: number, isDefault?: boolean }): Promise<SavedPaymentResponse> => {
    const res = await apiClient.post<ApiResponse<SavedPaymentResponse>>("/api/v1/user/payments", payload);
    return res.data;
  },
  
  deletePayment: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/user/payments/${id}`);
  }
};

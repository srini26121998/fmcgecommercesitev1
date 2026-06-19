import { apiClient } from "@/lib/api-client";

export interface WishlistResponse {
  id: number;
  productId: number;
  productTitle: string;
  productSku: string;
  imageUrl: string;
  price: number;
  effectivePrice: number;
  stockStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const wishlistService = {
  getWishlist: async (): Promise<WishlistResponse[]> => {
    const res = await apiClient.get<ApiResponse<WishlistResponse[]>>("/api/v1/wishlist");
    return res.data;
  },
  
  addToWishlist: async (productId: number): Promise<WishlistResponse> => {
    const res = await apiClient.post<ApiResponse<WishlistResponse>>("/api/v1/wishlist", { productId });
    return res.data;
  },
  
  removeFromWishlist: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/wishlist/${id}`);
  }
};

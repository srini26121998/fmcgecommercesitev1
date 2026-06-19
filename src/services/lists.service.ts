import { apiClient } from "@/lib/api-client";

export interface ShoppingListItem {
  id: number;
  productId: number;
  productTitle: string;
  qty: number;
  price: number;
}

export interface ShoppingListResponse {
  id: number;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const listsService = {
  getLists: async (): Promise<ShoppingListResponse[]> => {
    const res = await apiClient.get<ApiResponse<ShoppingListResponse[]>>("/api/v1/lists");
    return res.data;
  },
  
  createList: async (name: string): Promise<ShoppingListResponse> => {
    const res = await apiClient.post<ApiResponse<ShoppingListResponse>>("/api/v1/lists", { name });
    return res.data;
  },
  
  deleteList: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/lists/${id}`);
  },

  addItemToList: async (listId: number, productId: number, qty: number): Promise<ShoppingListItem> => {
    const res = await apiClient.post<ApiResponse<ShoppingListItem>>(`/api/v1/lists/${listId}/items`, { productId, qty });
    return res.data;
  },

  removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/lists/${listId}/items/${itemId}`);
  }
};

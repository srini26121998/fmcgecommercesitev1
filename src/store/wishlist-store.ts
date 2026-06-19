import { create } from "zustand";
import { wishlistService, WishlistResponse } from "@/services/wishlist.service";

export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
}

interface WishlistStore {
  wishlist: WishlistResponse[];
  isLoading: boolean;
  error: string | null;

  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlist: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await wishlistService.getWishlist();
      set({ wishlist: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch wishlist", isLoading: false });
    }
  },

  addToWishlist: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await wishlistService.addToWishlist(productId);
      set((state) => ({
        wishlist: [...state.wishlist, newItem],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to add to wishlist", isLoading: false });
    }
  },

  removeFromWishlist: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistService.removeFromWishlist(id);
      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to remove from wishlist", isLoading: false });
    }
  }
}));
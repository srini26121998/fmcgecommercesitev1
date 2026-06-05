import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: number;
  name: string;
  image: string;
  price: number;
}

interface WishlistStore {
  wishlist: WishlistItem[];
  _hasHydrated: boolean;

  addToWishlist: (
    item: WishlistItem
  ) => void;

  removeFromWishlist: (
    id: number
  ) => void;

  moveToCart: (id: number) => WishlistItem | undefined;

  setHasHydrated: (value: boolean) => void;
}

export const useWishlistStore =
  create<WishlistStore>()(
    persist(
      (set, get) => ({
        wishlist: [],
        _hasHydrated: false,

        addToWishlist: (item) =>
          set((state) => ({
            wishlist: [...state.wishlist, item],
          })),

        removeFromWishlist: (id) =>
          set((state) => ({
            wishlist: state.wishlist.filter(
              (item) => item.id !== id
            ),
          })),

        moveToCart: (id) => {
          const item = get().wishlist.find((i) => i.id === id);
          if (item) {
            set((state) => ({
              wishlist: state.wishlist.filter((i) => i.id !== id),
            }));
            return item;
          }
          return undefined;
        },

        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      {
        name: "wishlist-storage",
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.warn("wishlist rehydration error", error);
            } else if (state) {
              state.setHasHydrated(true);
            }
          };
        },
      }
    )
  );
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight?: string;
}

interface CartStore {
  cart: CartItem[];

  addToCart: (product: CartItem) => void;

  removeFromCart: (id: number | string) => void;

  increaseQuantity: (id: number | string) => void;

  decreaseQuantity: (id: number | string) => void;

  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        // Stock validation should be handled by the UI or API before calling this

        set((state) => {
          const existing = state.cart.find(
            (item) => item.id === product.id
          );

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                    }
                  : item
              ),
            };
          }

          return {
            cart: [...state.cart, product],
          };
        });
      },

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.id !== id
          ),
        })),

      increaseQuantity: (id) => {
        const MAX_QUANTITY = 20;
        // Stock validation should be handled by the UI or API before calling this

        set((state) => {
          const item = state.cart.find((i) => i.id === id);
          if (!item || item.quantity >= MAX_QUANTITY) return state;
          return {
            cart: state.cart.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i
            ),
          };
        });
      },

      decreaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "fmcg-cart-storage",
    }
  )
);
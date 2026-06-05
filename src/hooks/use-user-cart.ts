"use client";

import { useState, useEffect, useCallback } from "react";
import { cartService } from "@/services/cart.service";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import type { ApiCart } from "@/types/api-cart";
import { productService } from "@/services/products.service";

import { create } from "zustand";

interface ApiCartStore {
  apiCart: ApiCart | null;
  setApiCart: (cart: ApiCart | null) => void;
  isApiAvailable: boolean;
  setIsApiAvailable: (val: boolean) => void;
}
export const useApiCartStore = create<ApiCartStore>((set) => ({
  apiCart: null,
  setApiCart: (cart) => set({ apiCart: cart }),
  isApiAvailable: false,
  setIsApiAvailable: (val) => set({ isApiAvailable: val }),
}));

let cartFetchPromise: Promise<any> | null = null;
let lastCartFetchTime = 0;

// Maps API Cart items to match local CartStore items if needed, or we just expose the unified state.
export function useUserCart() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  // Local cart state
  const localCart = useCartStore((s) => s.cart);
  const localAddToCart = useCartStore((s) => s.addToCart);
  const localRemoveFromCart = useCartStore((s) => s.removeFromCart);
  const localIncreaseQuantity = useCartStore((s) => s.increaseQuantity);
  const localDecreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const localClearCart = useCartStore((s) => s.clearCart);

  // API cart state
  const apiCart = useApiCartStore((state) => state.apiCart);
  const setApiCart = useApiCartStore((state) => state.setApiCart);
  const isApiAvailable = useApiCartStore((state) => state.isApiAvailable);
  const setIsApiAvailable = useApiCartStore((state) => state.setIsApiAvailable);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart from backend
  const fetchApiCart = useCallback(async () => {
    if (!isLoggedIn) return;

    if (cartFetchPromise) {
      try {
        await cartFetchPromise;
      } catch (e) {
        // ignore
      }
      return;
    }

    if (Date.now() - lastCartFetchTime < 2000 && isApiAvailable) {
      return;
    }

    setLoading(true);
    setError(null);
    
    cartFetchPromise = cartService.getCart()
      .then((res) => {
        if (res.cart) {
          setApiCart(res.cart);
          setIsApiAvailable(true);
          lastCartFetchTime = Date.now();
        }
        return res;
      })
      .catch((err) => {
        setIsApiAvailable(false);
        console.warn("[useUserCart] API unavailable, falling back to local store:", err);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        cartFetchPromise = null;
      });

    try {
      await cartFetchPromise;
    } catch (err) {
      // already handled
    }
  }, [isLoggedIn, isApiAvailable, setApiCart, setIsApiAvailable]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchApiCart();
    } else {
      setIsApiAvailable(false);
      setApiCart(null);
    }
  }, [isLoggedIn, fetchApiCart]);

  // Actions
  const addToCart = async (productId: number | string, quantity: number = 1) => {
    if (isLoggedIn && isApiAvailable) {
      try {
        setLoading(true);
        const res = await cartService.addItemToCart({ productId: productId.toString(), quantity });
        if (res.cart) setApiCart(res.cart);
      } catch (err) {
        console.warn("Failed to add to API cart", err);
        // Fallback to local
        await handleLocalAddToCart(productId);
      } finally {
        setLoading(false);
      }
    } else {
      await handleLocalAddToCart(productId);
    }
  };

  const handleLocalAddToCart = async (productId: number | string) => {
    try {
      const productInfo = await productService.getProductById(productId.toString());
      if (productInfo) {
        localAddToCart({
          id: Number(productInfo.id),
          name: productInfo.name,
          price: productInfo.price,
          image: productInfo.media?.[0]?.url || "",
          quantity: 1,
          weight: productInfo.weight
        });
      }
    } catch (err) {
      console.warn("Failed to fetch product for local cart fallback", err);
    }
  };

  const removeFromCart = async (productId: number | string) => {
    if (isLoggedIn && isApiAvailable) {
      try {
        setLoading(true);
        // Find the actual item in the API cart to get its ID, or fallback to productId
        const item = apiCart?.items.find(i => String(i.productId) === String(productId) || String(i.id) === String(productId));
        const itemIdToRemove = item?.id || productId;
        const res = await cartService.removeItemFromCart(String(itemIdToRemove));
        if (res.cart) setApiCart(res.cart);
      } catch (err) {
        console.warn("Failed to remove from API cart", err);
      } finally {
        setLoading(false);
      }
    } else {
      localRemoveFromCart(Number(productId));
    }
  };

  const increaseQuantity = async (productId: number | string) => {
    if (isLoggedIn && isApiAvailable) {
      try {
        setLoading(true);
        const item = apiCart?.items.find(i => String(i.productId) === String(productId) || String(i.id) === String(productId));
        if (item) {
          const currentQty = item.qty ?? item.quantity ?? 1;
          const res = await cartService.updateItemQuantity(String(item.id || item.productId), currentQty + 1);
          if (res.cart) setApiCart(res.cart);
        }
      } catch (err) {
        console.warn("Failed to update API cart quantity", err);
      } finally {
        setLoading(false);
      }
    } else {
      localIncreaseQuantity(Number(productId));
    }
  };

  const decreaseQuantity = async (productId: number | string) => {
    if (isLoggedIn && isApiAvailable) {
      try {
        setLoading(true);
        const item = apiCart?.items.find(i => String(i.productId) === String(productId) || String(i.id) === String(productId));
        if (item) {
          const currentQty = item.qty ?? item.quantity ?? 1;
          if (currentQty > 1) {
            const res = await cartService.updateItemQuantity(String(item.id || item.productId), currentQty - 1);
            if (res.cart) setApiCart(res.cart);
          } else {
            await removeFromCart(productId);
          }
        }
      } catch (err) {
        console.warn("Failed to update API cart quantity", err);
      } finally {
        setLoading(false);
      }
    } else {
      localDecreaseQuantity(Number(productId));
    }
  };

  const applyCoupon = async (code: string) => {
    if (!isLoggedIn || !isApiAvailable) return { success: false, message: "Please login to apply coupons" };
    try {
      setLoading(true);
      const res = await cartService.applyCoupon({ couponCode: code, code });
      if (res.cart) setApiCart(res.cart);
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to apply coupon" };
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    if (!isLoggedIn || !isApiAvailable) return;
    try {
      setLoading(true);
      const res = await cartService.removeCoupon();
      if (res.cart) setApiCart(res.cart);
    } catch (err) {
      console.warn("Failed to remove coupon", err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (isLoggedIn && isApiAvailable) {
       // Backend logic to clear cart might be needed
    }
    localClearCart();
    setApiCart(null);
  };

  // Merge items logically for UI
  const unifiedItems = isApiAvailable && apiCart 
    ? apiCart.items.map(item => ({
        id: Number(item.productId),
        name: item.title || item.product?.name || `Product ${item.productId}`,
        price: item.unitPrice ?? item.product?.price ?? 0,
        image: item.imageUrl || item.product?.image || "/placeholder.jpg",
        quantity: item.qty ?? item.quantity ?? 1,
        weight: item.unit || item.product?.weight
      }))
    : localCart;

  const unifiedTotal = isApiAvailable && apiCart 
    ? apiCart.total 
    : localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cartItems: unifiedItems,
    cartDetails: apiCart, // Will contain couponCode, discountAmount, subTotal if API is used
    total: unifiedTotal,
    loading,
    error,
    isApiAvailable,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    refresh: fetchApiCart
  };
}

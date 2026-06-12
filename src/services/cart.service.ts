import { apiClient } from "@/lib/api-client";
import type { 
  CartResponse, 
  AddItemToCartPayload, 
  ApplyCouponPayload 
} from "@/types/api-cart";

class CartService {
  /**
   * Get the current user's cart
   */
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.get<any>("/api/v1/cart");
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to get cart:", error);
      throw error;
    }
  }

  /**
   * Add an item to the cart
   */
  async addItemToCart(payload: AddItemToCartPayload): Promise<CartResponse> {
    try {
      const apiPayload = {
        productId: Number(payload.productId),
        sku: payload.sku || String(payload.productId),
        qty: payload.qty ?? payload.quantity
      };
      const response = await apiClient.post<any>("/api/v1/cart/items", apiPayload);
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to add item to cart:", error);
      throw error;
    }
  }

  /**
   * Update the quantity of an item in the cart
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
    try {
      // Typically PATCH or PUT for updating quantity
      const response = await apiClient.patch<any>(`/api/v1/cart/items/${itemId}`, { qty: quantity });
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to update item quantity:", error);
      throw error;
    }
  }

  /**
   * Remove an item from the cart
   */
  async removeItemFromCart(itemId: string): Promise<CartResponse> {
    try {
      const response = await apiClient.delete<any>(`/api/v1/cart/items/${itemId}`);
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to remove item from cart:", error);
      throw error;
    }
  }

  /**
   * Apply a coupon code to the cart
   */
  async applyCoupon(payload: ApplyCouponPayload): Promise<CartResponse> {
    try {
      const apiPayload = {
        code: payload.code || payload.couponCode
      };
      const response = await apiClient.post<any>("/api/v1/cart/apply-coupon", apiPayload);
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to apply coupon:", error);
      throw error;
    }
  }

  /**
   * Remove an applied coupon from the cart
   */
  async removeCoupon(): Promise<CartResponse> {
    try {
      const response = await apiClient.delete<any>("/api/v1/cart/remove-coupon");
      return {
        success: true,
        cart: response.cart || response.data?.cart || response.data,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to remove coupon:", error);
      throw error;
    }
  }

  /**
   * Get all available coupons
   */
  async getCoupons(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>("/api/v1/cart/coupons");
      return Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.warn("Failed to fetch coupons:", error);
      return [];
    }
  }
}

export const cartService = new CartService();

// ── User Orders Hook ──────────────────────────────────────
// Fetches and manages orders for the currently logged-in user.
// Architecture: UI → Component → Hook → Service → API Gateway → Backend
//
// This hook is used on the customer-facing /account/orders page
// and wraps orderService.getMyOrders() with loading/error state.
// ─────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import { orderService } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import { useOrderStore } from "@/store/order-store";
import type { GetOrdersParams } from "@/types/api-orders";

// ── Types ─────────────────────────────────────────────────

export interface UserOrderItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  productId?: string;
  weight?: string;
}

export interface UserOrder {
  id: string;
  date: string;
  items: UserOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  deliveryFee?: number;
  total: number;
  status: "Delivered" | "Processing" | "Out for Delivery" | "Cancelled" | "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "returned";
  paymentMethod: string;
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  deliverySlot?: string;
  deliveryDate?: string;
  estimatedTime?: string;
  deliveryPartner?: string;
  trackingSteps?: Array<{
    id: string;
    label: string;
    time: string;
    icon: string;
    completed: boolean;
    status?: string;
  }>;
  /** Source: 'api' | 'local' */
  source?: "api" | "local";
}

// ── API Status → Display Status mapping ──────────────────

export function mapApiStatusToDisplayStatus(status: string): UserOrder["status"] {
  switch (status) {
    case "pending":          return "Processing";
    case "confirmed":        return "Processing";
    case "preparing":        return "Processing";
    case "out_for_delivery": return "Out for Delivery";
    case "delivered":        return "Delivered";
    case "cancelled":        return "Cancelled";
    case "returned":         return "Cancelled";
    // Already a display status
    case "Processing":        return "Processing";
    case "Out for Delivery":  return "Out for Delivery";
    case "Delivered":         return "Delivered";
    case "Cancelled":         return "Cancelled";
    default:                  return "Processing";
  }
}

// ── Hook ──────────────────────────────────────────────────

export function useUserOrders(params?: GetOrdersParams) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const localOrders = useOrderStore((s) => s.orders);

  const [apiOrders, setApiOrders]   = useState<UserOrder[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  const fetchApiOrders = useCallback(async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const res = await orderService.getMyOrders(params);
      const orders = (res.orders || res.data?.orders || []) as any[];

      const mapped: UserOrder[] = orders.map((o: any) => {
        const id = o.orderNumber || o.orderId || o.id || o._id || `API-${Date.now()}`;
        const addr = o.deliveryAddress || {};

        return {
          id: String(id),
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }),
          items: (o.items || []).map((item: any) => ({
            id: item.productId || item.id || item._id || 0,
            name: item.productTitle || item.name || item.product || "Product",
            price: item.unitPrice || item.price || 0,
            image: item.imageUrl || item.image || "/placeholder.jpg",
            quantity: item.qty || item.quantity || 1,
            productId: item.productId ? String(item.productId) : undefined,
            weight: item.weight,
          })),
          subtotal: o.subtotal || 0,
          taxAmount: o.taxAmount || 0,
          deliveryFee: o.deliveryFee || 0,
          discountAmount: o.discountAmount || 0,
          total: o.total || 0,
          status: mapApiStatusToDisplayStatus(o.status ? o.status.toLowerCase() : "pending"),
          paymentMethod: o.paymentMethod || "N/A",
          deliveryAddress: {
            name: o.customerName || addr.name || o.customer || "Customer",
            phone: addr.phone || o.phone || "",
            address: addr.line1 ? `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}` : (addr.address || ""),
            city: addr.city || "",
            pincode: addr.pincode || "",
          },
          deliverySlot: o.deliverySlot || "Standard Delivery",
          deliveryDate: o.deliveryDate
            ? new Date(o.deliveryDate).toLocaleDateString("en-IN", {
                month: "short", day: "numeric", year: "numeric",
              })
            : o.updatedAt
            ? new Date(o.updatedAt).toLocaleDateString("en-IN", {
                month: "short", day: "numeric", year: "numeric",
              })
            : undefined,
          estimatedTime: o.estimatedTime || "TBD",
          deliveryPartner: o.deliveryPartnerName || o.deliveryPartner || "Not Assigned",
          trackingSteps: (o.timeline || []).map((t: any, idx: number) => ({
            id: t.id ? String(t.id) : `step-${idx}-${t.status || 'update'}`,
            label: t.notes || t.note || t.status || "Update",
            status: t.status,
            time: t.changedAt || t.timestamp
              ? new Date(t.changedAt || t.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })
              : "",
            icon: "CheckCircle",
            completed: true,
          })),
          source: "api" as const,
        };
      });

      setApiOrders(mapped);
      setIsApiAvailable(true);
    } catch (err) {
      // Silently fall back to local orders — no error shown to user
      setIsApiAvailable(false);
      console.warn("[useUserOrders] API unavailable, using local store:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, params]);

  useEffect(() => {
    fetchApiOrders();
  }, [fetchApiOrders]);

  /**
   * Merged orders: API orders take precedence.
   * If API not available, use local Zustand store orders.
   */
  const mergedOrders: UserOrder[] = isApiAvailable
    ? apiOrders
    : (localOrders as any[]).map((o: any) => ({
        ...o,
        source: "local" as const,
      }));

  return {
    orders: mergedOrders,
    loading,
    error,
    isApiAvailable,
    refresh: fetchApiOrders,
  };
}

// ── Hook for Single Order ──────────────────────────────────

export function useUserOrderDetails(orderId: string) {
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const localOrders = useOrderStore((s) => s.orders);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById_API(orderId);
      const o: any = res.order || res.data;
      if (o) {
        const id = o.orderNumber || o.orderId || o.id || o._id || orderId;
        const addr: any = o.deliveryAddress || {};
        
        const mapped: UserOrder = {
          id: String(id),
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }),
          items: (o.items || []).map((item: any) => ({
            id: item.productId || item.id || item._id || 0,
            name: item.productTitle || item.name || item.product || "Product",
            price: item.unitPrice || item.price || 0,
            image: item.imageUrl || item.image || "/placeholder.jpg",
            quantity: item.qty || item.quantity || 1,
            productId: item.productId ? String(item.productId) : undefined,
            weight: item.weight,
          })),
          subtotal: o.subtotal || 0,
          taxAmount: o.taxAmount || 0,
          deliveryFee: o.deliveryFee || 0,
          discountAmount: o.discountAmount || 0,
          total: o.total || 0,
          status: mapApiStatusToDisplayStatus(o.status ? o.status.toLowerCase() : "pending"),
          paymentMethod: o.paymentMethod || "N/A",
          deliveryAddress: {
            name: o.customerName || addr.name || o.customer || "Customer",
            phone: addr.phone || o.phone || "",
            address: addr.line1 ? `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}` : (addr.address || ""),
            city: addr.city || "",
            pincode: addr.pincode || "",
          },
          deliverySlot: o.deliverySlot,
          deliveryDate: o.deliveryDate
            ? new Date(o.deliveryDate).toLocaleDateString("en-IN", {
                month: "short", day: "numeric", year: "numeric",
              })
            : undefined,
          estimatedTime: o.estimatedTime,
          deliveryPartner: o.deliveryPartnerName || o.deliveryPartner,
          trackingSteps: (o.timeline || []).map((t: any, idx: number) => ({
            id: t.id ? String(t.id) : `step-${idx}-${t.status || 'update'}`,
            label: t.notes || t.note || t.status || "Update",
            status: t.status,
            time: t.changedAt || t.timestamp
              ? new Date(t.changedAt || t.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })
              : "",
            icon: "CheckCircle",
            completed: true,
          })),
          source: "api" as const,
        };
        setOrder(mapped);
      } else {
        throw new Error("Order not found from API");
      }
    } catch (err) {
      console.warn("[useUserOrderDetails] API failed, falling back to local:", err);
      // Fallback to local
      const local = (localOrders as any[]).find(
        (lo) => String(lo.id) === orderId || String(lo.orderNumber) === orderId
      );
      if (local) {
        setOrder({ ...local, source: "local" });
      } else {
        setError("Order not found");
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, localOrders]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refresh: fetchOrder };
}


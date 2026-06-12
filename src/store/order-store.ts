"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface TrackingStep {
  id: string;
  label: string;
  time: string;
  icon: string; // icon name reference
  completed: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Delivered" | "Processing" | "Cancelled" | "Out for Delivery";
  paymentMethod: string;
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  deliverySlot: string;
  deliveryDate: string;
  estimatedTime: string;
  deliveryPartner: string;
  trackingSteps: TrackingStep[];
  cashback?: number;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  getOrderById: (id: string) => Order | undefined;
}

function generateOrderId(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `#${num}`;
}

function buildTrackingSteps(status: Order["status"], estimatedTime: string): TrackingStep[] {
  const now = new Date();
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const placedTime = formatTime(now);
  const confirmedTime = formatTime(new Date(now.getTime() + 1 * 60000));
  const pickedTime = formatTime(new Date(now.getTime() + 3 * 60000));
  const packedTime = formatTime(new Date(now.getTime() + 5 * 60000));
  const dispatchedTime = formatTime(new Date(now.getTime() + 7 * 60000));

  const isDelivered = status === "Delivered";
  const isOutForDelivery = status === "Out for Delivery" || status === "Processing";

  return [
    { id: "placed", label: "Order Placed", time: placedTime, icon: "ShoppingBag", completed: true },
    { id: "confirmed", label: "Order Confirmed", time: confirmedTime, icon: "CheckCircle", completed: true },
    { id: "picked", label: "Item Picked", time: pickedTime, icon: "Package", completed: true },
    { id: "packed", label: "Item Packed", time: packedTime, icon: "Package", completed: true },
    { id: "dispatched", label: "Out for Delivery", time: dispatchedTime, icon: "Truck", completed: isDelivered || isOutForDelivery },
    { id: "delivered", label: "Delivered", time: isDelivered ? dispatchedTime : `Expected ${estimatedTime}`, icon: "Home", completed: isDelivered },
  ];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, status, trackingSteps: buildTrackingSteps(status, o.estimatedTime) }
              : o
          ),
        })),

      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: "order-storage",
    }
  )
);

export { generateOrderId, buildTrackingSteps };

if (typeof window !== "undefined") {
  (window as any).useOrderStore = useOrderStore;
}

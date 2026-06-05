// ── Orders API Types ─────────────────────────────────────
// These types represent the backend API request/response shapes
// for all Order-related endpoints.
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

// ── Enums ────────────────────────────────────────────────

export type ApiOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type ApiPaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type ApiPaymentMethod = "upi" | "card" | "net_banking" | "cod" | "wallet";

// ── Order Item (API shape) ────────────────────────────────

export interface ApiOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  weight?: string;
  total?: number;
}

// ── Delivery Address (API shape) ──────────────────────────

export interface ApiDeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state?: string;
  country?: string;
  type?: "Home" | "Work" | "Other";
}

// ── Timeline Event (API shape) ────────────────────────────

export interface ApiTimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
  performedBy?: string;
}

// ── Order (API response shape) ────────────────────────────

export interface ApiOrder {
  _id: string;
  orderId?: string;  // Some backends use a separate orderId field
  id?: string;       // Fallback
  userId?: string;
  customerId?: string;
  customer?: string;
  email?: string;
  phone?: string;
  items: ApiOrderItem[];
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  handlingFee?: number;
  discount?: number;
  couponCode?: string;
  status: ApiOrderStatus;
  paymentMethod?: string;
  paymentStatus?: ApiPaymentStatus;
  deliveryAddress?: ApiDeliveryAddress;
  deliverySlot?: string;
  deliveryDate?: string;
  estimatedTime?: string;
  deliveryPartner?: string | null;
  zone?: string;
  notes?: string;
  timeline?: ApiTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

// ── Place Order Request ───────────────────────────────────

export interface PlaceOrderRequest {
  addressId: number;
  paymentMethod: string;
  couponCode?: string;
  loyaltyPointsBurn?: number;
  notes?: string;
  // Keep the old fields optional for local fallback if needed
  items?: ApiOrderItem[];
  total?: number;
  subtotal?: number;
  deliveryFee?: number;
  handlingFee?: number;
  discount?: number;
  deliveryAddress?: ApiDeliveryAddress;
  deliverySlot?: string;
  deliveryMode?: "express" | "scheduled" | "pickup" | "subscription";
  scheduledDate?: string;
  scheduledTime?: string;
  pickupStore?: string;
  subscriptionFrequency?: string;
}

// ── Place Order Response ──────────────────────────────────

export interface PlaceOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    order?: ApiOrder;
    orderId?: string;
    _id?: string;
  };
  order?: ApiOrder;
  orderId?: string;
  _id?: string;
}

// ── Get Orders Query Params ───────────────────────────────

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  paymentStatus?: string;
  zone?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Get Orders Response ───────────────────────────────────

export interface GetOrdersResponse {
  success: boolean;
  message?: string;
  data?: {
    orders?: ApiOrder[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  orders?: ApiOrder[];
  total?: number;
  page?: number;
  limit?: number;
}

// ── Get Single Order Response ─────────────────────────────

export interface GetOrderByIdResponse {
  success: boolean;
  message?: string;
  data?: ApiOrder;
  order?: ApiOrder;
}

// ── Update Order Status Request ───────────────────────────

export interface UpdateOrderStatusRequest {
  status: ApiOrderStatus;
  note?: string;
  performedBy?: string;
}

// ── Update Order Status Response ──────────────────────────

export interface UpdateOrderStatusResponse {
  success: boolean;
  message?: string;
  data?: ApiOrder;
  order?: ApiOrder;
}

// ── Cancel Order Request ──────────────────────────────────

export interface CancelOrderRequest {
  reason?: string;
  note?: string;
}

// ── Cancel Order Response ─────────────────────────────────

export interface CancelOrderResponse {
  success: boolean;
  message?: string;
  data?: ApiOrder;
  order?: ApiOrder;
}

// ── Return Order Request ──────────────────────────────────

export interface ReturnOrderRequest {
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    reason: string;
    image?: string;
  }>;
  reason: string;
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    accountHolderName?: string;
  };
}

// ── Return Order Response ─────────────────────────────────

export interface ReturnOrderResponse {
  success: boolean;
  message?: string;
  returnId?: string;
  data?: {
    returnId?: string;
    status?: string;
  };
}

// ── Track Order Response ──────────────────────────────────

export interface TrackOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId?: string;
    status?: ApiOrderStatus;
    timeline?: ApiTimelineEvent[];
    estimatedDelivery?: string;
    deliveryPartner?: string;
    currentLocation?: string;
  };
}

// ── Reorder Request ───────────────────────────────────────

export interface ReorderRequest {
  orderId: string;
  items?: ApiOrderItem[];
}

// ── Reorder Response ──────────────────────────────────────

export interface ReorderResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId?: string;
    order?: ApiOrder;
  };
}

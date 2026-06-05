// ── Orders API Service ────────────────────────────────────
// Full API integration for all order-related operations.
// Architecture: UI → Component → Hook → Service → API Gateway → Backend
//
// Backend Base URL: Configured via NEXT_PUBLIC_API_BASE_URL in env.ts
// All endpoints follow: /api/v1/orders/*
// ─────────────────────────────────────────────────────────

import { apiClient } from "@/lib/api-client";
import type {
  ApiOrder,
  ApiOrderStatus,
  GetOrdersParams,
  GetOrdersResponse,
  GetOrderByIdResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  ReturnOrderRequest,
  ReturnOrderResponse,
  TrackOrderResponse,
  ReorderRequest,
  ReorderResponse,
} from "@/types/api-orders";

// Admin-panel order types (kept for admin dashboard compatibility)
import type {
  Order,
  DeliveryPartner,
  Substitution,
  BulkJob,
  OrderFilters,
  AssignPartnerFormData,
  OrdersListResponse,
  PartnersListResponse,
  SubstitutionDecisionData,
} from "@/types/orders";
import type { PaginationState } from "@/types/products";

// ── Constants ─────────────────────────────────────────────

const ORDERS_PREFIX = "/api/v1/orders";
const ADMIN_ORDERS_PREFIX = "/api/v1/admin/orders";

// ── Normalizers ───────────────────────────────────────────
// Transform backend API responses to a consistent internal shape.

/**
 * Extract the actual order object from any backend response shape.
 * Backends vary: some wrap in `data`, some send top-level, some use `order`.
 */
function extractOrder(raw: any): ApiOrder | null {
  if (!raw) return null;
  // Shape 1: { data: { order: {...} } }
  if (raw.data?.order) return raw.data.order;
  // Shape 2: { data: {...} }  (data IS the order object)
  if (raw.data?._id || raw.data?.id) return raw.data;
  // Shape 3: { order: {...} }
  if (raw.order) return raw.order;
  // Shape 4: raw IS the order (direct object)
  if (raw._id || raw.id) return raw;
  return null;
}

/**
 * Extract the orders array from any backend response shape.
 */
function extractOrders(raw: any): ApiOrder[] {
  if (!raw) return [];
  if (Array.isArray(raw.data?.orders)) return raw.data.orders;
  if (Array.isArray(raw.orders)) return raw.orders;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw)) return raw;
  return [];
}

/**
 * Extract orders from the admin paginated response.
 */
function extractAdminOrdersPage(raw: any): {
  orders: any[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
} {
  // Shape 1: { data: { content: [...] } }  — Spring Boot Page inside data
  const nestedContent = raw?.data?.content;
  if (Array.isArray(nestedContent)) {
    return {
      orders: nestedContent,
      totalElements: raw.data.totalElements ?? nestedContent.length,
      page: raw.data.page ?? 0,
      size: raw.data.size ?? nestedContent.length,
      totalPages: raw.data.totalPages ?? 1,
    };
  }

  // Shape 2: { content: [...] }  — Spring Boot Page at top level
  const topContent = raw?.content;
  if (Array.isArray(topContent)) {
    return {
      orders: topContent,
      totalElements: raw.totalElements ?? topContent.length,
      page: raw.page ?? 0,
      size: raw.size ?? topContent.length,
      totalPages: raw.totalPages ?? 1,
    };
  }

  // Shape 3–6: generic shapes (data array, flat array, etc.)
  const genericOrders = extractOrders(raw);
  if (genericOrders.length > 0) {
    return { orders: genericOrders, totalElements: genericOrders.length, page: 0, size: genericOrders.length, totalPages: 1 };
  }

  // Shape 7: raw is a single order object — wrap it
  if (raw && typeof raw === "object" && !Array.isArray(raw) && (raw.id || raw.orderNumber)) {
    return { orders: [raw], totalElements: 1, page: 0, size: 1, totalPages: 1 };
  }

  return { orders: [], totalElements: 0, page: 0, size: 20, totalPages: 1 };
}

/**
 * Normalise any order raw data (from either user-facing or admin endpoints) to the internal Order type.
 */
function normalizeAnyOrder(o: any): Order {
  if (!o) return {} as Order;

  const id = o.orderNumber || o.orderId || String(o.id || o._id || "") || `ORD-${Date.now()}`;
  const backendId = o.id || o._id;

  const addrObj = o.deliveryAddress;
  let customerNameFromAddr = "";
  let addressLineStr = "";

  if (addrObj) {
    if (typeof addrObj === "string") {
      addressLineStr = addrObj;
      if (addressLineStr.includes("::")) {
        const parts = addressLineStr.split("::");
        customerNameFromAddr = parts[0];
        addressLineStr = parts.slice(1).join("::");
      }
    } else {
      let line1Cleaned = addrObj.line1 || addrObj.address || "";
      if (line1Cleaned.includes("::")) {
        const parts = line1Cleaned.split("::");
        customerNameFromAddr = parts[0];
        line1Cleaned = parts.slice(1).join("::");
      }

      const parts = [
        addrObj.label || addrObj.type,
        line1Cleaned,
        addrObj.line2,
        addrObj.city,
        addrObj.state,
        addrObj.pincode,
      ].filter(Boolean);

      addressLineStr = parts.join(", ");
    }
  }

  const isPlaceholder = (val: any) =>
    !val || typeof val !== "string" || val.trim().toLowerCase() === "string";

  const customerVal = !isPlaceholder(o.customerName)
    ? o.customerName
    : !isPlaceholder(o.customer)
      ? o.customer
      : addrObj && typeof addrObj === "object" && !isPlaceholder(addrObj.name)
        ? addrObj.name
        : customerNameFromAddr || "Customer";

  const emailVal = !isPlaceholder(o.customerEmail)
    ? o.customerEmail
    : !isPlaceholder(o.email)
      ? o.email
      : "";

  const phoneVal = !isPlaceholder(o.phone)
    ? o.phone
    : addrObj && typeof addrObj === "object" && !isPlaceholder(addrObj.line2)
      ? addrObj.line2
      : addrObj && typeof addrObj === "object" && !isPlaceholder(addrObj.phone)
        ? addrObj.phone
        : "";

  let zoneVal = o.zone;
  if (isPlaceholder(zoneVal) && addrObj && typeof addrObj === "object" && addrObj.city && !isPlaceholder(addrObj.city)) {
    zoneVal = addrObj.city.charAt(0).toUpperCase() + addrObj.city.slice(1);
  } else if (isPlaceholder(zoneVal)) {
    zoneVal = "";
  }

  const rawStatus = (o.status || "pending").toLowerCase() as Order["status"];
  const rawPaymentStatus = (
    (o.paymentStatus || "pending").toLowerCase()
  ) as Order["paymentStatus"];

  const items: Order["items"] = (o.items || []).map((item: any) => ({
    product: item.productTitle || item.name || "Product",
    productId: String(item.productId ?? ""),
    quantity: item.qty ?? item.quantity ?? 1,
    price: item.unitPrice ?? item.price ?? 0,
    weight: item.weight,
  }));

  const timeline: Order["timeline"] = (o.timeline || []).map((t: any) => ({
    status: (t.status || "").toLowerCase(),
    timestamp: t.changedAt || t.timestamp || new Date().toISOString(),
    note: t.notes || t.note,
    performedBy: t.changedBy || t.performedBy,
  }));

  let partnerVal = o.deliveryPartnerName || o.deliveryPartner || null;
  if (!partnerVal && typeof window !== "undefined") {
    const storedPartnerId = localStorage.getItem(`assigned_partner_${id}`) ||
      (backendId ? localStorage.getItem(`assigned_partner_${backendId}`) : null);
    if (storedPartnerId) {
      const partner = MOCK_DELIVERY_PARTNERS.find((p) => p.id === storedPartnerId);
      partnerVal = partner ? partner.name : storedPartnerId;
    }
  }

  return {
    id,
    backendId,
    customer: customerVal,
    customerId: o.customerId || o.userId ? String(o.customerId || o.userId) : undefined,
    email: emailVal,
    phone: phoneVal,
    items,
    subtotal: o.subtotal ?? undefined,
    discountAmount: o.discountAmount ?? o.discount ?? undefined,
    taxAmount: o.taxAmount ?? undefined,
    deliveryFee: o.deliveryFee ?? undefined,
    total: o.total ?? 0,
    status: rawStatus,
    paymentMethod: o.paymentMethod,
    paymentStatus: rawPaymentStatus,
    deliveryPartner: partnerVal,
    deliveryAddress: addressLineStr || "N/A",
    cancellationReason: o.cancellationReason ?? null,
    zone: zoneVal || undefined,
    notes: o.notes,
    timeline,
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || new Date().toISOString(),
  };
}

/**
 * Normalise an admin API order (from /api/v1/admin/orders) to the UI Order type.
 */
function normalizeAdminApiOrder(o: any): Order {
  return normalizeAnyOrder(o);
}

/**
 * Normalise an API order to the admin `Order` type used by the UI.
 */
function normalizeApiOrderToAdminOrder(o: ApiOrder): Order {
  return normalizeAnyOrder(o);
}

function computeOrdersSummary(orders: Order[]) {
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    outForDelivery: orders.filter((o) => o.status === "out_for_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    returned: orders.filter((o) => o.status === "returned").length,
    revenue: orders.reduce((s, o) => s + (o.total ?? 0), 0),
  };
}

// ── Orders Service ────────────────────────────────────────

const MOCK_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: "DP-001",
    name: "Rahul Sharma",
    phone: "+91 98765 43201",
    vehicleType: "bike",
    status: "online",
    currentOrders: 2,
    totalDeliveries: 3420,
    rating: 4.9,
    earnings: 182000,
    zone: "Mumbai Metro",
    joinedAt: "2024-01-10",
  },
  {
    id: "DP-002",
    name: "Suresh Reddy",
    phone: "+91 98765 43202",
    vehicleType: "scooter",
    status: "busy",
    currentOrders: 1,
    totalDeliveries: 2150,
    rating: 4.7,
    earnings: 120000,
    zone: "Mumbai Metro",
    joinedAt: "2024-03-15",
  },
  {
    id: "DP-003",
    name: "Amit Kumar",
    phone: "+91 98765 43203",
    vehicleType: "bike",
    status: "online",
    currentOrders: 0,
    totalDeliveries: 1890,
    rating: 4.8,
    earnings: 98000,
    zone: "Delhi NCR",
    joinedAt: "2024-04-01",
  },
  {
    id: "DP-004",
    name: "Vijay Singh",
    phone: "+91 98765 43204",
    vehicleType: "cycle",
    status: "offline",
    currentOrders: 0,
    totalDeliveries: 890,
    rating: 4.5,
    earnings: 45000,
    zone: "Delhi NCR",
    joinedAt: "2024-06-01",
  },
  {
    id: "DP-005",
    name: "Manoj Patil",
    phone: "+91 98765 43205",
    vehicleType: "bike",
    status: "online",
    currentOrders: 3,
    totalDeliveries: 1560,
    rating: 4.6,
    earnings: 78000,
    zone: "Pune City",
    joinedAt: "2024-05-15",
  },
  {
    id: "DP-006",
    name: "Sneha Kulkarni",
    phone: "+91 98765 43206",
    vehicleType: "scooter",
    status: "online",
    currentOrders: 1,
    totalDeliveries: 980,
    rating: 4.9,
    earnings: 52000,
    zone: "Pune City",
    joinedAt: "2024-08-01",
  },
  {
    id: "DP-007",
    name: "Rajesh Gupta",
    phone: "+91 98765 43207",
    vehicleType: "bike",
    status: "offline",
    currentOrders: 0,
    totalDeliveries: 2340,
    rating: 4.7,
    earnings: 115000,
    zone: "Bangalore Central",
    joinedAt: "2024-02-01",
  },
  {
    id: "DP-008",
    name: "Kiran Patel",
    phone: "+91 98765 43208",
    vehicleType: "scooter",
    status: "busy",
    currentOrders: 2,
    totalDeliveries: 450,
    rating: 4.4,
    earnings: 28000,
    zone: "Bangalore Central",
    joinedAt: "2026-01-10",
  },
];

export const orderService = {

  // ──────────────────────────────────────────────────────
  // ── USER-FACING ORDER APIS ──────────────────────────
  // ──────────────────────────────────────────────────────

  /**
   * Place a new order.
   * POST /api/v1/orders
   */
  async placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    try {
      const raw = await apiClient.post<any>(ORDERS_PREFIX, payload);
      return {
        success: true,
        message: raw.message || raw.data?.message || "Order placed successfully",
        data: raw.data || raw,
        order: extractOrder(raw) ?? undefined,
        orderId:
          raw.data?.orderId ||
          raw.orderId ||
          raw.data?.order?._id ||
          raw.data?._id ||
          raw._id,
      };
    } catch (err) {
      console.error("[OrderService] placeOrder failed:", err);
      throw err;
    }
  },

  /**
   * Get all orders for the currently authenticated user.
   * GET /api/v1/orders/my-orders
   */
  async getMyOrders(params?: GetOrdersParams): Promise<GetOrdersResponse> {
    try {
      const queryParams = new URLSearchParams();
      const page = params?.page ? Math.max(0, params.page - 1) : 0;
      queryParams.set("page", String(page));
      queryParams.set("size", String(params?.limit || 10));

      if (params?.status && params.status !== "all") queryParams.set("status", params.status);
      if (params?.search) queryParams.set("search", params.search);

      const qs = queryParams.toString();
      const url = `${ORDERS_PREFIX}?${qs}`;

      const raw = await apiClient.get<any>(url);
      const { orders: rawOrders, totalElements } = extractAdminOrdersPage(raw);

      return {
        success: true,
        message: raw.message || "Success",
        data: { orders: rawOrders, total: totalElements, page: page + 1, limit: params?.limit ?? 10 },
        orders: rawOrders,
        total: totalElements,
      };
    } catch (err) {
      console.error("[OrderService] getMyOrders failed:", err);
      throw err;
    }
  },

  /**
   * Get a single order by its ID.
   * GET /api/v1/orders/:id
   */
  async getOrderById_API(orderId: string): Promise<GetOrderByIdResponse> {
    try {
      const isOrderNumber = orderId.startsWith("ORD-") || isNaN(Number(orderId));
      const endpoint = isOrderNumber ? `${ORDERS_PREFIX}/number/${orderId}` : `${ORDERS_PREFIX}/${orderId}`;
      const raw = await apiClient.get<any>(endpoint);
      const order = extractOrder(raw) ?? undefined;
      return { success: true, message: raw.message, data: order, order };
    } catch (err) {
      console.error(`[OrderService] getOrderById_API failed for ${orderId}:`, err);
      throw err;
    }
  },

  /**
   * Track an order's real-time status.
   * GET /api/v1/orders/:id/track
   */
  async trackOrder(orderId: string): Promise<TrackOrderResponse> {
    try {
      const isOrderNumber = orderId.startsWith("ORD-") || isNaN(Number(orderId));
      const endpoint = isOrderNumber ? `${ORDERS_PREFIX}/number/${orderId}/track` : `${ORDERS_PREFIX}/${orderId}/track`;
      const raw = await apiClient.get<any>(endpoint);
      return {
        success: true,
        message: raw.message,
        data: raw.data || raw,
      };
    } catch (err) {
      console.error(`[OrderService] trackOrder failed for ${orderId}:`, err);
      throw err;
    }
  },

  /**
   * Cancel an order (user-initiated).
   * POST /api/v1/orders/:id/cancel
   */
  async cancelOrder(
    orderId: string,
    payload?: CancelOrderRequest
  ): Promise<CancelOrderResponse> {
    try {
      const raw = await apiClient.post<any>(
        `${ORDERS_PREFIX}/${orderId}/cancel`,
        payload ?? {}
      );
      return {
        success: true,
        message: raw.message || raw.data?.message || "Order cancelled",
        data: extractOrder(raw) ?? undefined,
        order: extractOrder(raw) ?? undefined,
      };
    } catch (err) {
      console.error(`[OrderService] cancelOrder failed for ${orderId}:`, err);
      throw err;
    }
  },

  /**
   * Submit a return request for a delivered order.
   * POST /api/v1/orders/:id/return
   */
  async returnOrder(
    orderId: string,
    payload: ReturnOrderRequest
  ): Promise<ReturnOrderResponse> {
    try {
      const raw = await apiClient.post<any>(
        `${ORDERS_PREFIX}/${orderId}/return`,
        payload
      );
      return {
        success: true,
        message: raw.message || raw.data?.message || "Return request submitted",
        returnId: raw.data?.returnId || raw.returnId,
        data: raw.data,
      };
    } catch (err) {
      console.error(`[OrderService] returnOrder failed for ${orderId}:`, err);
      throw err;
    }
  },

  /**
   * Reorder from a previous order.
   * POST /api/v1/orders/:id/reorder
   */
  async reorder(
    orderId: string,
    payload?: Partial<ReorderRequest>
  ): Promise<ReorderResponse> {
    try {
      const raw = await apiClient.post<any>(
        `${ORDERS_PREFIX}/${orderId}/reorder`,
        payload ?? {}
      );
      return {
        success: true,
        message: raw.message || raw.data?.message || "Items added to cart",
        data: raw.data || raw,
      };
    } catch (err) {
      console.error(`[OrderService] reorder failed for ${orderId}:`, err);
      throw err;
    }
  },

  // ──────────────────────────────────────────────────────
  // ── ADMIN ORDER APIS ──────────────────────────────────
  // ──────────────────────────────────────────────────────

  /**
   * Admin: Get all orders (with filters/pagination).
   * GET /api/v1/admin/orders?page=0&size=20&status=PENDING&search=...
   */
  async getOrders(
    filters?: Partial<OrderFilters>,
    pagination?: Partial<PaginationState>
  ): Promise<OrdersListResponse> {
    try {
      const page1 = pagination?.page ?? 1;
      const pageSize = pagination?.pageSize ?? 20;
      const page0 = Math.max(0, page1 - 1); // convert to 0-based

      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page0));
      queryParams.set("size", String(pageSize));

      if (filters?.status && filters.status !== "all") {
        queryParams.set("status", filters.status.toUpperCase());
      }
      if (filters?.search) queryParams.set("search", filters.search);
      if (filters?.paymentStatus) queryParams.set("paymentStatus", filters.paymentStatus.toUpperCase());

      const url = `${ADMIN_ORDERS_PREFIX}?${queryParams.toString()}`;
      const raw = await apiClient.get<any>(url);

      const { orders: rawOrders, totalElements } = extractAdminOrdersPage(raw);
      const adminOrders = rawOrders.map(normalizeAdminApiOrder);

      return {
        orders: adminOrders,
        pagination: { page: page1, pageSize, total: totalElements || adminOrders.length },
        summary: computeOrdersSummary(adminOrders),
      };
    } catch (err) {
      console.error("[OrderService] getOrders admin API failed:", err);
      throw err;
    }
  },

  /**
   * Admin: Get a single order by ID.
   * Tries GET /api/v1/admin/orders/:id first, then falls back to /api/v1/orders/:id.
   */
  async getOrderById(id: string): Promise<Order | undefined> {
    const isOrderNumber = id.startsWith("ORD-") || isNaN(Number(id));
    if (isOrderNumber) {
      // Look up user-facing endpoint directly since admin endpoint for order number does not exist
      try {
        const raw = await apiClient.get<any>(`${ORDERS_PREFIX}/number/${id}`);
        const apiOrder = extractOrder(raw);
        if (apiOrder) {
          return normalizeApiOrderToAdminOrder(apiOrder);
        }
      } catch (err) {
        console.error(`[OrderService] getOrderById failed for order number ${id}:`, err);
      }
    } else {
      // Numeric ID, try admin endpoint first
      try {
        const raw = await apiClient.get<any>(`${ADMIN_ORDERS_PREFIX}/${id}`);
        const orderRaw = raw?.data || raw;
        if (orderRaw && (orderRaw.id || orderRaw.orderNumber)) {
          return normalizeAdminApiOrder(orderRaw);
        }
      } catch (err) {
        console.warn(`[OrderService] getOrderById admin numeric lookup failed for ${id}, trying fallback:`, err);
      }

      // Fallback to user endpoint for numeric ID
      try {
        const raw2 = await apiClient.get<any>(`${ORDERS_PREFIX}/${id}`);
        const apiOrder = extractOrder(raw2);
        if (apiOrder) {
          return normalizeApiOrderToAdminOrder(apiOrder);
        }
      } catch (err) {
        console.error(`[OrderService] getOrderById user numeric lookup failed for ${id}:`, err);
      }
    }
    return undefined;
  },

  /**
   * Admin: Update order status.
   * PATCH /api/v1/admin/orders/:backendId/status
   */
  async updateOrderStatus(
    id: string,
    newStatus: string,
    notes?: string,
    backendId?: string | number
  ): Promise<Order | undefined> {
    try {
      let apiId = backendId ?? id;
      const isOrderNumber = String(apiId).startsWith("ORD-") || isNaN(Number(apiId));
      if (isOrderNumber) {
        try {
          const detail = await apiClient.get<any>(`${ORDERS_PREFIX}/number/${apiId}`);
          const apiOrder = extractOrder(detail);
          if (apiOrder?.id) {
            apiId = apiOrder.id;
          }
        } catch (resolveErr) {
          console.warn("[OrderService] Failed to resolve order number to numeric ID in updateOrderStatus:", resolveErr);
        }
      }

      const payload = {
        status: newStatus,
        notes: notes || undefined,
      };
      const raw = await apiClient.patch<any>(
        `${ADMIN_ORDERS_PREFIX}/${apiId}/status`,
        payload
      );
      const updated = raw?.data || (raw as any).order || raw;
      if (updated && (updated.id || updated.orderNumber)) {
        return normalizeAdminApiOrder(updated);
      }
    } catch (err) {
      console.error("[OrderService] updateOrderStatus API failed:", err);
      throw err;
    }
  },

  /**
   * Admin: Assign a delivery partner to an order.
   * POST /api/v1/admin/orders/{id}/assign-partner?partnerId={partnerId}
   */
  async assignPartner(data: AssignPartnerFormData, backendId?: string | number): Promise<Order | undefined> {
    try {
      let apiId = backendId ?? data.orderId;
      const isOrderNumber = String(apiId).startsWith("ORD-") || isNaN(Number(apiId));
      if (isOrderNumber) {
        try {
          const detail = await apiClient.get<any>(`${ORDERS_PREFIX}/number/${apiId}`);
          const apiOrder = extractOrder(detail);
          if (apiOrder?.id) {
            apiId = apiOrder.id;
          }
        } catch (resolveErr) {
          console.warn("[OrderService] Failed to resolve order number to numeric ID in assignPartner:", resolveErr);
        }
      }

      const raw = await apiClient.post<any>(
        `${ADMIN_ORDERS_PREFIX}/${apiId}/assign-partner?partnerId=${encodeURIComponent(data.partnerId)}`,
        {}
      );

      // Save assignment to local storage
      if (typeof window !== "undefined") {
        localStorage.setItem(`assigned_partner_${data.orderId}`, data.partnerId);
        if (apiId) {
          localStorage.setItem(`assigned_partner_${apiId}`, data.partnerId);
        }
      }

      const updated = raw?.data || (raw as any).order || raw;
      if (updated && (updated.id || updated.orderNumber)) {
        return normalizeAdminApiOrder(updated);
      }
      const extract = extractOrder(raw);
      if (extract) return normalizeApiOrderToAdminOrder(extract);

      if (raw && (raw.success === true || raw.success === "true" || raw.message === "Success")) {
        try {
          const freshOrder = await orderService.getOrderById(String(apiId));
          if (freshOrder) return freshOrder;
        } catch (fetchErr) {
          console.warn("[OrderService] Failed to fetch updated order after assigning partner:", fetchErr);
        }
        return {
          id: String(data.orderId),
          backendId: apiId,
          status: "preparing",
          deliveryPartner: data.partnerId,
        } as any;
      }
    } catch (err) {
      console.error("[OrderService] assignPartner API failed:", err);
      throw err;
    }
  },

  /**
   * Admin: Replace out-of-stock items in an order.
   * POST /api/v1/admin/orders/{id}/substitute?oldProductId={oldProductId}&newProductId={newProductId}
   */
  async substituteOrderItem(
    orderId: string | number,
    oldProductId: string | number,
    newProductId: string | number
  ): Promise<Order | undefined> {
    try {
      let apiId = orderId;
      const isOrderNumber = String(apiId).startsWith("ORD-") || isNaN(Number(apiId));
      if (isOrderNumber) {
        try {
          const detail = await apiClient.get<any>(`${ORDERS_PREFIX}/number/${apiId}`);
          const apiOrder = extractOrder(detail);
          if (apiOrder?.id) {
            apiId = apiOrder.id;
          }
        } catch (resolveErr) {
          console.warn("[OrderService] Failed to resolve order number to numeric ID in substituteOrderItem:", resolveErr);
        }
      }

      const raw = await apiClient.post<any>(
        `${ADMIN_ORDERS_PREFIX}/${apiId}/substitute?oldProductId=${oldProductId}&newProductId=${newProductId}`,
        {}
      );
      const updated = raw?.data || (raw as any).order || raw;
      if (updated && (updated.id || updated.orderNumber)) {
        return normalizeAdminApiOrder(updated);
      }
      const extract = extractOrder(raw);
      if (extract) return normalizeApiOrderToAdminOrder(extract);
    } catch (err) {
      console.error("[OrderService] substituteOrderItem API failed:", err);
      throw err;
    }
  },

  /**
   * Admin: Bulk update multiple order statuses at once.
   * POST /api/v1/admin/orders/bulk?status={status}
   * Request Body: Array of backend IDs or order IDs
   */
  async bulkUpdateOrderStatus(
    orderIds: (string | number)[],
    status: string
  ): Promise<boolean> {
    try {
      const resolvedIds = await Promise.all(
        orderIds.map(async (id) => {
          const idStr = String(id);
          const isOrderNumber = idStr.startsWith("ORD-") || isNaN(Number(idStr));
          if (!isOrderNumber) return Number(idStr);
          try {
            const raw = await apiClient.get<any>(`${ORDERS_PREFIX}/number/${idStr}`);
            const apiOrder = extractOrder(raw);
            if (apiOrder?.id) return apiOrder.id;
          } catch { }
          return id;
        })
      );

      await apiClient.post<any>(
        `${ADMIN_ORDERS_PREFIX}/bulk?status=${encodeURIComponent(status)}`,
        resolvedIds
      );
      return true;
    } catch (err) {
      console.error("[OrderService] bulkUpdateOrderStatus API failed:", err);
      throw err;
    }
  },

  /**
   * Admin: Add an internal note to an order.
   * POST /api/v1/orders/:id/notes
   */
  async addOrderNote(
    orderId: string,
    note: string,
    performedBy: string
  ): Promise<boolean> {
    try {
      await apiClient.post(`${ORDERS_PREFIX}/${orderId}/notes`, {
        note,
        performedBy,
      });
      return true;
    } catch (err) {
      console.error("[OrderService] addOrderNote API failed:", err);
      throw err;
    }
  },

  // ── Delivery Partners ─────────────────────────────────

  /**
   * Get list of delivery partners (admin).
   * GET /api/v1/delivery-partners
   */
  async getDeliveryPartners(search?: string): Promise<PartnersListResponse> {
    try {
      let filtered = MOCK_DELIVERY_PARTNERS;
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.zone && p.zone.toLowerCase().includes(query))
        );
      }
      return { partners: filtered, total: filtered.length, isMock: true };
    } catch (err) {
      console.error("[OrderService] getDeliveryPartners failed:", err);
      throw err;
    }
  },

  /**
   * Get delivery partners filtered by delivery zone.
   * GET /api/v1/delivery-partners?zone=:zone&status=available
   */
  async getPartnersByZone(zone: string): Promise<DeliveryPartner[]> {
    try {
      const normalizedZone = zone.trim().toLowerCase();
      const zonePartners = MOCK_DELIVERY_PARTNERS.filter(
        (p) => p.zone && p.zone.toLowerCase().includes(normalizedZone)
      );
      if (zonePartners.length > 0) {
        return zonePartners;
      }
      return MOCK_DELIVERY_PARTNERS.filter((p) => p.status === "online");
    } catch (err) {
      console.error(`[OrderService] getPartnersByZone failed for ${zone}:`, err);
      throw err;
    }
  },

  /**
   * Update a delivery partner's status.
   * PATCH /api/v1/delivery-partners/:id/status
   */
  async updatePartnerStatus(id: string, status: string): Promise<boolean> {
    try {
      const partner = MOCK_DELIVERY_PARTNERS.find((p) => p.id === id);
      if (partner) {
        partner.status = status as any;
      }
      return true;
    } catch (err) {
      console.error(`[OrderService] updatePartnerStatus failed for ${id}:`, err);
      throw err;
    }
  },

  // ── Substitutions ────────────────────────────────────

  /**
   * Get substitution requests.
   * GET /api/v1/orders/substitutions
   */
  async getSubstitutions(
    filters?: { search?: string; status?: string },
    pagination?: Partial<PaginationState>
  ): Promise<{ substitutions: Substitution[]; pagination: PaginationState }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status) params.set("status", filters.status);
      if (pagination?.page) params.set("page", String(pagination.page));
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const qs = params.toString();
      const url = qs ? `/api/v1/orders/substitutions?${qs}` : `/api/v1/orders/substitutions`;
      const raw = await apiClient.get<any>(url);
      const subs: Substitution[] = raw.data?.substitutions || raw.substitutions || raw.data || [];
      const total = raw.data?.total ?? raw.total ?? subs.length;
      const page = pagination?.page ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      return { substitutions: subs, pagination: { page, pageSize, total } };
    } catch (err) {
      console.error("[OrderService] getSubstitutions failed:", err);
      throw err;
    }
  },

  /**
   * Approve or reject a product substitution.
   * POST /api/v1/orders/substitutions/:id/decide
   */
  async decideSubstitution(data: SubstitutionDecisionData): Promise<boolean> {
    try {
      await apiClient.post(
        `/api/v1/orders/substitutions/${data.substitutionId}/decide`,
        { status: data.status, decidedBy: data.decidedBy }
      );
      return true;
    } catch (err) {
      console.error("[OrderService] decideSubstitution failed:", err);
      throw err;
    }
  },

  // ── Bulk Jobs ─────────────────────────────────────────

  /**
   * Get bulk processing jobs (admin).
   * GET /api/v1/orders/bulk-jobs
   */
  async getBulkJobs(
    search?: string,
    pagination?: Partial<PaginationState>
  ): Promise<{ jobs: BulkJob[]; pagination: PaginationState }> {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (pagination?.page) params.set("page", String(pagination.page));
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const qs = params.toString();
      const url = qs ? `/api/v1/orders/bulk-jobs?${qs}` : `/api/v1/orders/bulk-jobs`;
      const raw = await apiClient.get<any>(url);
      const jobs: BulkJob[] = raw.data?.jobs || raw.jobs || raw.data || [];
      const total = raw.data?.total ?? raw.total ?? jobs.length;
      const page = pagination?.page ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      return { jobs, pagination: { page, pageSize, total } };
    } catch (err) {
      console.error("[OrderService] getBulkJobs failed:", err);
      throw err;
    }
  },

  /**
   * Create a bulk action (status update, assignment, cancellation, etc.).
   * POST /api/v1/orders/bulk-action
   */
  async createBulkAction(data: {
    actionType: string;
    orderIds: string[];
    targetStatus?: string;
  }): Promise<BulkJob> {
    try {
      const raw = await apiClient.post<any>(
        `/api/v1/orders/bulk-action`,
        data
      );
      return raw.data?.job || raw.job || raw.data;
    } catch (err) {
      console.error("[OrderService] createBulkAction failed:", err);
      throw err;
    }
  },
};

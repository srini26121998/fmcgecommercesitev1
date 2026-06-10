// ── Order Management System Types ───────────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import { z } from "zod";

// ── Enums ─────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
]);

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "UPI" | "Card" | "Net Banking" | "COD" | "Wallet";
export type PartnerStatus = "online" | "offline" | "busy" | "available";
export type VehicleType = "bike" | "scooter" | "cycle" | "van";
export type SubstitutionStatus = "pending" | "accepted" | "rejected";
export type BulkJobStatus = "pending" | "processing" | "completed" | "partial" | "failed";
export type BulkJobType = "status_update" | "assign_partners" | "bulk_cancel" | "bulk_status_update";

// ── Order Item ────────────────────────────────────────────

export const OrderItemSchema = z.object({
  product: z.string().min(1, "Product name is required"),
  productId: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive"),
  weight: z.string().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// ── Timeline Event ────────────────────────────────────────

export const TimelineEventSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  note: z.string().optional(),
  performedBy: z.string().optional(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// ── Order ─────────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  backendId: z.union([z.string(), z.number()]).optional(),
  customer: z.string().min(1, "Customer name is required"),
  customerId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  status: OrderStatusSchema,
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(["paid", "pending", "failed", "refunded"]).default("pending"),
  deliveryPartner: z.string().optional().nullable(),
  deliveryAddress: z.string().optional(),
  zone: z.string().optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional().nullable(),
  substitutions: z.array(z.lazy(() => SubstitutionSchema)).optional(),
  timeline: z.array(TimelineEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

// ── Delivery Partner ─────────────────────────────────────

export const DeliveryPartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Partner name is required"),
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  vehicleType: z.enum(["bike", "scooter", "cycle", "van", "ev_scooter"]).optional(),
  vehicleNumber: z.string().optional().nullable(),
  status: z.enum(["online", "offline", "busy", "available"]).default("available"),
  currentOrders: z.number().int().nonnegative().default(0),
  totalDeliveries: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  earnings: z.number().nonnegative().default(0),
  zone: z.string().optional(),
  joinedAt: z.string().optional(),
  lastLocation: z
    .object({
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional(),
      updatedAt: z.string().nullable().optional(),
    })
    .optional()
    .nullable(),
});

export type DeliveryPartner = z.infer<typeof DeliveryPartnerSchema>;

// ── Substitution ──────────────────────────────────────────

export const SubstitutionSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1, "Order ID is required"),
  original: z.string().min(1, "Original product is required"),
  substitute: z.string().min(1, "Substitute product is required"),
  reason: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  amount: z.number().nonnegative().default(0),
  customer: z.string().optional(),
  decidedBy: z.string().optional(),
  decidedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Substitution = z.infer<typeof SubstitutionSchema>;

// ── Bulk Job ──────────────────────────────────────────────

export const BulkJobSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  type: z.string(),
  count: z.number().int().nonnegative().default(0),
  success: z.number().int().nonnegative().optional(),
  failed: z.number().int().nonnegative().optional(),
  status: z.enum(["pending", "processing", "completed", "partial", "failed"]).default("pending"),
  processedBy: z.string().optional(),
  details: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type BulkJob = z.infer<typeof BulkJobSchema>;

// ── Order Filters ─────────────────────────────────────────

export interface OrderFilters {
  search: string;
  status: string;
  zone: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// ── Form Types ────────────────────────────────────────────

export interface AssignPartnerFormData {
  orderId: string;
  partnerId: string;
  notes?: string;
  backendId?: string | number;
}

export interface StatusUpdateFormData {
  orderId: string;
  backendId?: string | number;
  newStatus: OrderStatus;
  notes?: string;
}

export interface BulkActionFormData {
  actionType: BulkJobType;
  orderIds: string[];
  targetStatus?: OrderStatus;
  partnerId?: string;
  note?: string;
}

export interface SubstitutionDecisionData {
  substitutionId: string;
  status: "accepted" | "rejected";
  decidedBy: string;
}

// ── API Response Types ────────────────────────────────────

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  summary: {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
    returned: number;
    revenue: number;
  };
  isMock?: boolean;
}

export interface PartnersListResponse {
  partners: DeliveryPartner[];
  total: number;
  isMock?: boolean;
}

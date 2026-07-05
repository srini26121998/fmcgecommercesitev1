// ── Delivery Management Types & Zod Schemas ─────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
// These types form the contract between all layers.
// Zod schemas enable runtime validation when swapping mock → real API.

import { z } from "zod";

// ── Enums ─────────────────────────────────────────────────

export type PartnerStatus = "online" | "offline" | "busy" | "available";
export type VehicleType = "bike" | "scooter" | "cycle" | "van" | "ev_scooter";
export type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";
export type SLAResult = "on_time" | "delayed" | "critical";
export type PerformanceMetricType =
  | "deliveries"
  | "rating"
  | "on_time_rate"
  | "earnings"
  | "distance"
  | "customer_satisfaction";

// ── Partner Profile ───────────────────────────────────────

export const PartnerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Partner name is required"),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  vehicleType: z.enum(["bike", "scooter", "cycle", "van", "ev_scooter"]).default("bike"),
  vehicleReg: z.string().optional(),
  status: z.enum(["online", "offline", "busy", "available"]).default("available"),
  currentOrders: z.number().int().nonnegative().default(0),
  totalDeliveries: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  totalEarnings: z.number().nonnegative().default(0),
  thisMonthEarnings: z.number().nonnegative().default(0),
  zone: z.string().min(1, "Zone is required"),
  city: z.string().default(""),
  address: z.string().optional(),
  joinedAt: z.string(),
  lastActiveAt: z.string(),
  aadharVerified: z.boolean().default(false),
  dlVerified: z.boolean().default(false),
  backgroundCheck: z.boolean().default(false),
  shifts: z.array(
    z.object({
      day: z.string(),
      start: z.string(),
      end: z.string(),
    })
  ).default([]),
  documents: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["verified", "pending", "rejected"]),
      uploadedAt: z.string().optional(),
    })
  ).default([]),
});

export type PartnerProfile = z.infer<typeof PartnerProfileSchema>;

// ── Delivery Partner (Compact) ────────────────────────────

export const DeliveryPartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  vehicleType: z.enum(["bike", "scooter", "cycle", "van", "ev_scooter"]).optional(),
  vehicleNumber: z.string().optional().nullable(),
  status: z.enum(["online", "offline", "busy", "available"]).default("available"),
  partnerType: z.string().optional(),
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

// ── Live Delivery ─────────────────────────────────────────

export const LiveDeliverySchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  customer: z.string().min(1),
  customerAddress: z.string(),
  partner: z.string(),
  partnerId: z.string(),
  partnerPhone: z.string().optional(),
  status: z.enum([
    "assigned",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed",
    "returned",
    "cancelled",
  ]),
  items: z.number().int().nonnegative().default(1),
  total: z.number().nonnegative().default(0),
  distance: z.string().optional(),
  eta: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  zone: z.string().optional(),
  startedAt: z.string().optional(),
  pickedUpAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  timeline: z.array(
    z.object({
      status: z.string(),
      timestamp: z.string(),
      note: z.string().optional(),
      location: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
  ).default([]),
});

export type LiveDelivery = z.infer<typeof LiveDeliverySchema>;

// ── Delivery Route ────────────────────────────────────────

export const DeliveryRouteSchema = z.object({
  id: z.string().min(1),
  zone: z.string().min(1),
  partnerId: z.string().optional(),
  partnerName: z.string().optional(),
  deliveries: z.number().int().nonnegative().default(0),
  totalDistance: z.string(),
  estimatedTime: z.string(),
  fuelEstimate: z.string(),
  status: z.enum(["pending", "optimized", "in_progress", "completed"]).default("pending"),
  savings: z.string().optional(),
  optimizedAt: z.string().optional(),
  waypoints: z.array(
    z.object({
      orderId: z.string(),
      address: z.string(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      estimatedArrival: z.string().optional(),
    })
  ).default([]),
  createdAt: z.string(),
});

export type DeliveryRoute = z.infer<typeof DeliveryRouteSchema>;

// ── Delivery Status Entry ─────────────────────────────────

export const DeliveryStatusEntrySchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  customer: z.string(),
  partner: z.string().optional(),
  status: z.enum([
    "assigned",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed",
    "returned",
    "cancelled",
  ]),
  zone: z.string().optional(),
  assignedAt: z.string().optional(),
  pickedUpAt: z.string().optional(),
  deliveredAt: z.string().nullable().optional(),
  estimatedDelivery: z.string().optional(),
  slaStatus: z.enum(["on_time", "delayed", "critical"]).optional(),
  delayMinutes: z.number().int().nonnegative().default(0),
  note: z.string().optional(),
});

export type DeliveryStatusEntry = z.infer<typeof DeliveryStatusEntrySchema>;

// ── Partner Performance ───────────────────────────────────

export const PerformanceOverviewSchema = z.object({
  partnerId: z.string(),
  partnerName: z.string(),
  period: z.string().default("30d"),
  totalDeliveries: z.number().int().nonnegative().default(0),
  onTimeDeliveries: z.number().int().nonnegative().default(0),
  delayedDeliveries: z.number().int().nonnegative().default(0),
  onTimeRate: z.number().min(0).max(100).default(0),
  avgDeliveryTime: z.string().default("0 min"),
  avgRating: z.number().min(0).max(5).default(0),
  totalEarnings: z.number().nonnegative().default(0),
  customerComplaints: z.number().int().nonnegative().default(0),
  distanceCovered: z.string().default("0 km"),
  trend: z.enum(["up", "down", "stable"]).default("stable"),
  chart: z.array(
    z.object({
      label: z.string(),
      deliveries: z.number().int().nonnegative().default(0),
      onTime: z.number().int().nonnegative().default(0),
    })
  ).default([]),
});

export type PerformanceOverview = z.infer<typeof PerformanceOverviewSchema>;

// ── Delivery Analytics ────────────────────────────────────

export const DeliveryAnalyticsSchema = z.object({
  period: z.string().default("30d"),
  summary: z.object({
    totalDeliveries: z.number().int().nonnegative().default(0),
    successfulDeliveries: z.number().int().nonnegative().default(0),
    failedDeliveries: z.number().int().nonnegative().default(0),
    onTimeDeliveries: z.number().int().nonnegative().default(0),
    delayedDeliveries: z.number().int().nonnegative().default(0),
    avgDeliveryTime: z.string().default("0 min"),
    totalDistance: z.string().default("0 km"),
    totalFuelCost: z.number().nonnegative().default(0),
    revenue: z.number().nonnegative().default(0),
  }),
  zonePerformance: z.array(
    z.object({
      zone: z.string(),
      deliveries: z.number().int().nonnegative(),
      onTimeRate: z.number().min(0).max(100),
      avgTime: z.string(),
      partners: z.number().int().nonnegative(),
    })
  ).default([]),
  hourlyDistribution: z.array(
    z.object({
      hour: z.string(),
      deliveries: z.number().int().nonnegative().default(0),
    })
  ).default([]),
  statusDistribution: z.array(
    z.object({
      status: z.string(),
      count: z.number().int().nonnegative().default(0),
      color: z.string(),
    })
  ).default([]),
  vehicleUtilization: z.array(
    z.object({
      type: z.string(),
      active: z.number().int().nonnegative().default(0),
      total: z.number().int().nonnegative().default(0),
    })
  ).default([]),
  dailyTrend: z.array(
    z.object({
      date: z.string(),
      deliveries: z.number().int().nonnegative().default(0),
      onTime: z.number().int().nonnegative().default(0),
      delayed: z.number().int().nonnegative().default(0),
    })
  ).default([]),
});

export type DeliveryAnalytics = z.infer<typeof DeliveryAnalyticsSchema>;

// ── SLA Metrics ───────────────────────────────────────────

export const SLAMetricSchema = z.object({
  id: z.string().min(1),
  zone: z.string(),
  metric: z.string(),
  target: z.string(),
  actual: z.string(),
  status: z.enum(["on_track", "at_risk", "breached"]),
  trend: z.enum(["up", "down", "stable"]).default("stable"),
  owner: z.string().optional(),
  lastUpdated: z.string(),
});

export type SLAMetric = z.infer<typeof SLAMetricSchema>;

export const SLADashboardSchema = z.object({
  overallHealth: z.enum(["good", "fair", "critical"]).default("good"),
  slaComplianceRate: z.number().min(0).max(100).default(0),
  totalOrders: z.number().int().nonnegative().default(0),
  onTimeDeliveries: z.number().int().nonnegative().default(0),
  delayedDeliveries: z.number().int().nonnegative().default(0),
  avgDelayTime: z.string().default("0 min"),
  criticalDelays: z.number().int().nonnegative().default(0),
  metrics: z.array(SLAMetricSchema).default([]),
  zoneCompliance: z.array(
    z.object({
      zone: z.string(),
      complianceRate: z.number().min(0).max(100),
      color: z.string(),
    })
  ).default([]),
  dailyCompliance: z.array(
    z.object({
      date: z.string(),
      rate: z.number().min(0).max(100),
    })
  ).default([]),
});

export type SLADashboard = z.infer<typeof SLADashboardSchema>;

// ── Socket Event Types (for real-time flow) ──────────────

export interface SocketDeliveryEvent {
  type: "location_update" | "status_change" | "order_assigned" | "delivery_completed";
  partnerId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface LocationUpdate {
  partnerId: string;
  lat: number;
  lng: number;
  speed?: number;
  bearing?: number;
  updatedAt: string;
}

// ── API Response Types ────────────────────────────────────

export interface DeliveryApiResponse<T> {
  success: boolean;
  data: T;
  error?: string | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cachedAt?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// ── Query Params ─────────────────────────────────────────

export interface DeliveryQueryParams {
  search?: string;
  status?: string;
  zone?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface AnalyticsQueryParams {
  period?: "7d" | "30d" | "90d" | "ytd";
  zone?: string;
  partnerId?: string;
}

// ── Form Types ───────────────────────────────────────────

export interface AssignDeliveryFormData {
  orderId: string;
  partnerId: string;
  priority?: "normal" | "high" | "express";
  notes?: string;
}

export interface UpdateDeliveryStatusFormData {
  deliveryId: string;
  status: DeliveryStatus;
  note?: string;
  location?: { lat: number; lng: number };
}

export interface PartnerFilterOptions {
  search: string;
  status: string;
  zone: string;
  vehicleType: string;
  minRating: number;
}

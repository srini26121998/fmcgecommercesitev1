// ── Executive Dashboard Types & Zod Schemas ──────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
// These types are the contract between all layers. Zod schemas enable runtime validation
// so swapping mock → real API requires zero UI changes.

import { z } from "zod/v4";

// ── Chart Primitives ────────────────────────────────────

export const ChartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type ChartPoint = z.infer<typeof ChartPointSchema>;

export const TrendIndicatorSchema = z.object({
  value: z.string(),
  direction: z.enum(["up", "down", "neutral"]),
  label: z.string().optional(),
});
export type TrendIndicator = z.infer<typeof TrendIndicatorSchema>;

// ── 1. Revenue KPI ──────────────────────────────────────

export const RevenueKpiSchema = z.object({
  total: z.number(),
  formatted: z.string(),
  growth: z.number(),
  currency: z.string().default("INR"),
  chart: z.array(ChartPointSchema),
  period: z.string(),
});
export type RevenueKpi = z.infer<typeof RevenueKpiSchema>;

// ── 2. Orders KPI ────────────────────────────────────────

export const OrdersKpiSchema = z.object({
  total: z.number(),
  growth: z.number(),
  pending: z.number(),
  processing: z.number(),
  delivered: z.number(),
  cancelled: z.number(),
  chart: z.array(ChartPointSchema),
  period: z.string(),
});
export type OrdersKpi = z.infer<typeof OrdersKpiSchema>;

// ── 3. Customers KPI ─────────────────────────────────────

export const CustomerAcquisitionSchema = z.object({
  source: z.string(),
  count: z.number(),
  percentage: z.number(),
  trend: z.string(),
  color: z.string(),
});

export const CustomersKpiSchema = z.object({
  total: z.number(),
  growth: z.number(),
  active: z.number(),
  newThisWeek: z.number(),
  churnRate: z.number(),
  lifetimeValue: z.number(),
  acquisition: z.array(CustomerAcquisitionSchema),
});
export type CustomersKpi = z.infer<typeof CustomersKpiSchema>;
export type CustomerAcquisition = z.infer<typeof CustomerAcquisitionSchema>;

// ── 4. Live Order Map ───────────────────────────────────

export const LiveOrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  items: z.number(),
  total: z.number(),
  status: z.enum(["confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
  time: z.string(),
  area: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  assignedPartner: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});
export type LiveOrder = z.infer<typeof LiveOrderSchema>;

// ── 5. Low Stock Alerts ─────────────────────────────────

export const StockAlertSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  stock: z.number(),
  threshold: z.number(),
  warehouse: z.string(),
  category: z.string(),
  status: z.enum(["critical", "warning", "normal"]),
  lastRestocked: z.string().optional(),
});
export type StockAlert = z.infer<typeof StockAlertSchema>;

// ── 6. Vendor Payment Queue ─────────────────────────────

export const VendorPaymentSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  invoiceRef: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  status: z.enum(["pending", "processing", "paid", "overdue", "cancelled"]),
  priority: z.enum(["high", "medium", "low"]),
  paymentMethod: z.string().optional(),
  paidAt: z.string().optional(),
});
export type VendorPayment = z.infer<typeof VendorPaymentSchema>;

// ── 7. Top Selling Products ─────────────────────────────

export const TopProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  sales: z.number(),
  revenue: z.number(),
  growth: z.string(),
  image: z.string().optional(),
  rank: z.number(),
});
export type TopProduct = z.infer<typeof TopProductSchema>;

// ── 8. Customer Acquisition Metrics ─────────────────────

export const AcquisitionMetricSchema = z.object({
  channel: z.string(),
  users: z.number(),
  percentage: z.number(),
  costPerAcquisition: z.number(),
  conversionRate: z.number(),
  trend: z.string(),
  color: z.string(),
});
export type AcquisitionMetric = z.infer<typeof AcquisitionMetricSchema>;

// ── Additional Presentation Data ──────────────────────────
// These are derived/computed metrics displayed on the dashboard.
// They come from the API but are optional — UI handles graceful fallback.

export const CategorySalesSchema = z.object({
  category: z.string(),
  sales: z.number(),
  revenue: z.number(),
  color: z.string(),
});
export type CategorySales = z.infer<typeof CategorySalesSchema>;

export const OrderStatusBreakdownSchema = z.object({
  status: z.string(),
  count: z.number(),
  color: z.string(),
});
export type OrderStatusBreakdown = z.infer<typeof OrderStatusBreakdownSchema>;

export const PaymentMethodSchema = z.object({
  method: z.string(),
  percentage: z.number(),
  count: z.number(),
  color: z.string(),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const ConversionFunnelSchema = z.object({
  stage: z.string(),
  count: z.number(),
  percentage: z.number(),
});
export type ConversionFunnel = z.infer<typeof ConversionFunnelSchema>;

export const TopCategorySchema = z.object({
  name: z.string(),
  revenue: z.number(),
  growth: z.string(),
  color: z.string(),
});
export type TopCategory = z.infer<typeof TopCategorySchema>;

export const DeliveryPerformanceSchema = z.object({
  onTime: z.number(),
  delayed: z.number(),
  total: z.number(),
  avgTime: z.string(),
});
export type DeliveryPerformance = z.infer<typeof DeliveryPerformanceSchema>;

export const SystemHealthSchema = z.object({
  uptime: z.string(),
  apiLatency: z.string(),
  errorRate: z.string(),
  activeUsers: z.number(),
});
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export const ReturnRateMetricsSchema = z.object({
  total: z.number(),
  returned: z.number(),
  rate: z.number(),
  refundAmount: z.number(),
});
export type ReturnRateMetrics = z.infer<typeof ReturnRateMetricsSchema>;

export const PromotionMetricsSchema = z.object({
  active: z.number(),
  redeemed: z.number(),
  revenue: z.number(),
  conversion: z.string(),
});
export type PromotionMetrics = z.infer<typeof PromotionMetricsSchema>;

export const RecentActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  time: z.string(),
  icon: z.string(), // lucide icon name as string
});
export type RecentActivity = z.infer<typeof RecentActivitySchema>;

export const HourlyActivitySchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type HourlyActivity = z.infer<typeof HourlyActivitySchema>;

// ── Aggregated Dashboard Response ────────────────────────

export const DashboardOverviewSchema = z.object({
  revenue: RevenueKpiSchema,
  orders: OrdersKpiSchema,
  customers: CustomersKpiSchema,
  liveOrders: z.array(LiveOrderSchema),
  lowStockAlerts: z.array(StockAlertSchema),
  vendorPayments: z.array(VendorPaymentSchema).optional(),
  upcomingPayments: z.array(VendorPaymentSchema).optional(),
  topProducts: z.array(TopProductSchema),
  acquisitionMetrics: z.array(AcquisitionMetricSchema),
  inventoryReport: z.any().optional(),
  // Optional extended presentation data
  categorySales: z.array(CategorySalesSchema).optional(),
  orderStatusBreakdown: z.array(OrderStatusBreakdownSchema).optional(),
  paymentMethods: z.array(PaymentMethodSchema).optional(),
  conversionFunnel: z.array(ConversionFunnelSchema).optional(),
  topCategories: z.array(TopCategorySchema).optional(),
  deliveryPerformance: DeliveryPerformanceSchema.optional(),
  systemHealth: SystemHealthSchema.optional(),
  returnRate: ReturnRateMetricsSchema.optional(),
  promotionMetrics: PromotionMetricsSchema.optional(),
  recentActivity: z.array(RecentActivitySchema).optional(),
  hourlyActivity: z.array(HourlyActivitySchema).optional(),
  lastUpdated: z.string(),
});
export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;

// ── API Response Envelope ────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    error: z.string().nullable().optional(),
    meta: z
      .object({
        page: z.number().optional(),
        pageSize: z.number().optional(),
        total: z.number().optional(),
        cachedAt: z.string().optional(),
      })
      .optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cachedAt?: string;
  };
};

// ── Dashboard Query Params ───────────────────────────────

export const DashboardQuerySchema = z.object({
  period: z.enum(["today", "7d", "30d", "90d", "ytd"]).optional().default("30d"),
  warehouse: z.string().optional(),
  region: z.string().optional(),
  refresh: z.boolean().optional(),
});
export type DashboardQueryParams = z.infer<typeof DashboardQuerySchema>;

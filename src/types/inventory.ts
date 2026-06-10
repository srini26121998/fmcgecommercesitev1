// ── Inventory Management — Zod Schemas + Types ──────
// Data contracts for stock, warehouses, transfers, FEFO, forecasting

import { z } from "zod";

// ── 1. Inventory Item ─────────────────────────────────────
export const InventoryItemSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  warehouse: z.string().min(1),
  warehouseId: z.string().optional(),
  stock: z.number().int().nonnegative(),
  reserved: z.number().int().nonnegative().default(0),
  available: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  safetyStock: z.number().int().nonnegative().default(0),
  batch: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  lastUpdated: z.string(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "overstocked"]).default("in_stock"),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// ── 2. Warehouse ──────────────────────────────────────────
// Supports both the old frontend-only shape and the real backend API:
//   Backend: { id: number, name, type: "WAREHOUSE"|"STORE", address, isActive, lat, lng, createdAt }
export type WarehouseType = "hub" | "cold_storage" | "depot" | "WAREHOUSE" | "STORE";
export type WarehouseStatus = "active" | "maintenance" | "full";

export const WarehouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // Accept real backend values (WAREHOUSE/STORE) as well as old frontend enums
  type: z.string().default("hub"),
  // location is the display field; address is the raw backend field
  location: z.string().default(""),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  // Capacity / utilisation fields are frontend-computed; optional so real API items work
  capacity: z.number().int().nonnegative().default(0),
  used: z.number().int().nonnegative().default(0),
  utilization: z.number().min(0).max(100).default(0),
  status: z.enum(["active", "maintenance", "full"] as const).default("active"),
  isActive: z.boolean().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  manager: z.string().optional(),
  contact: z.string().optional(),
  totalSkus: z.number().int().nonnegative().default(0),
  staffCount: z.number().int().nonnegative().default(0),
  operatingHours: z.string().optional(),
  products: z.number().int().nonnegative().default(0),
  createdAt: z.string().optional(),
});
export type Warehouse = z.infer<typeof WarehouseSchema>;

// ── 3. Stock Transfer ─────────────────────────────────────
export type TransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

export const StockTransferSchema = z.object({
  id: z.string().min(1),
  product: z.string().min(1),
  sku: z.string().min(1),
  fromWarehouse: z.string().min(1),
  fromWarehouseId: z.string().optional(),
  toWarehouse: z.string().min(1),
  toWarehouseId: z.string().optional(),
  quantity: z.number().int().positive(),
  status: z.enum(["pending", "in_transit", "completed", "cancelled"] as const),
  initiatedBy: z.string().min(1),
  date: z.string().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional().nullable(),
  eta: z.string().optional(),
  notes: z.string().optional(),
  productId: z.string().optional(),
});
export type StockTransfer = z.infer<typeof StockTransferSchema>;

// ── 4. Safety Stock Rule ──────────────────────────────────
export type SafetyStockStatus = "safe" | "warning" | "critical";

export const SafetyStockRuleSchema = z.object({
  id: z.string().min(1),
  product: z.string().min(1),
  sku: z.string().min(1),
  currentStock: z.number().int().nonnegative(),
  safetyLevel: z.number().int().nonnegative(),
  reorderPoint: z.number().int().nonnegative(),
  leadTime: z.number().int().nonnegative(),
  status: z.enum(["safe", "warning", "critical"] as const),
  dailyUsage: z.number().int().nonnegative().default(0),
  lastUpdated: z.string().optional(),
});
export type SafetyStockRule = z.infer<typeof SafetyStockRuleSchema>;

// ── 5. FEFO Batch ─────────────────────────────────────────
export type FEFOStatus = "fresh" | "expiring_soon" | "expired";

export const FEFOBatchSchema = z.object({
  id: z.string().min(1),
  product: z.string().min(1),
  sku: z.string().optional(),
  batch: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  manufactured: z.string(),
  expiry: z.string(),
  daysLeft: z.number().int(),
  warehouse: z.string(),
  status: z.enum(["fresh", "expiring_soon", "expired"] as const),
});
export type FEFOBatch = z.infer<typeof FEFOBatchSchema>;

// ── 6. Demand Forecast ────────────────────────────────────
export type ForecastTrend = "up" | "down" | "stable";

export const DemandForecastSchema = z.object({
  id: z.string().optional(),
  product: z.string().min(1),
  sku: z.string().optional(),
  currentStock: z.number().int().nonnegative(),
  predictedDemand: z.number().int().nonnegative(),
  trend: z.enum(["up", "down", "stable"] as const),
  confidence: z.number().min(0).max(100),
  nextOrderDate: z.string().optional(),
  historicalData: z.array(z.object({
    date: z.string(),
    value: z.number(),
  })).optional(),
});
export type DemandForecast = z.infer<typeof DemandForecastSchema>;

// ── 7. Low Stock Alert ────────────────────────────────────
export const LowStockAlertSchema = z.object({
  id: z.string().min(1),
  product: z.string().min(1),
  sku: z.string().optional(),
  stock: z.number().int().nonnegative(),
  threshold: z.number().int().nonnegative(),
  warehouse: z.string(),
  status: z.enum(["critical", "warning"] as const),
  lastRestocked: z.string().optional(),
  suggestedOrder: z.number().int().nonnegative().optional(),
});
export type LowStockAlert = z.infer<typeof LowStockAlertSchema>;

// ── 8. API Response Wrappers ──────────────────────────────
export const InventoryListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(InventoryItemSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
});
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;

export const InventoryDetailResponseSchema = z.object({
  success: z.boolean(),
  data: InventoryItemSchema,
});
export type InventoryDetailResponse = z.infer<typeof InventoryDetailResponseSchema>;

// ── 9. Stock Movement ─────────────────────────────────────
export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";

export interface StockMovement {
  id: string;
  productId?: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  performedBy?: string;
  warehouse?: string;
  warehouseId?: string;
  createdAt: string;
  notes?: string;
}

// ── 10. Params Types ──────────────────────────────────────
export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  warehouse?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TransferQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

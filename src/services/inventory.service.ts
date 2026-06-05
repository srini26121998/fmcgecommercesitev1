/* eslint-disable @typescript-eslint/no-explicit-any */
// ── Inventory Service ──────────────────────────────────────────────────────
// All methods call the real backend REST API.
// Endpoints:
//
//  GET   /api/v1/admin/inventory?page=0&size=20 – Paginated inventory list (admin)
//  POST  /api/v1/inventory/adjust               – Adjust stock (IN / OUT / ADJUSTMENT)
//  GET   /api/v1/admin/inventory/warehouses     – Get all active warehouses (admin)
//  GET   /api/v1/inventory/report               – Get inventory summary report
//  GET   /api/v1/inventory/:productId/movements – Stock movement history for a product
//  GET   /api/v1/inventory/:productId           – Get inventory for a specific product
//  GET   /api/v1/inventory/out-of-stock         – All items currently out of stock
//  GET   /api/v1/inventory/low-stock            – All items currently in low stock
//
// Auth token is attached automatically by the apiClient interceptor.

import { apiClient } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  StockTransfer,
  SafetyStockRule,
  FEFOBatch,
  DemandForecast,
  LowStockAlert,
  InventoryQueryParams,
  TransferQueryParams,
} from "@/types/inventory";

// ── Shared response normaliser ──────────────────────────────────────────────
// The backend may return  { data: [...] }  or  { data: { items: [...] } }  etc.
// These small helpers extract the array / object from whatever the backend sends.

function extractArray<T>(res: any, fallbackKeys: string[] = []): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res?.data && Array.isArray(res.data)) return res.data as T[];
  for (const key of fallbackKeys) {
    if (res?.[key] && Array.isArray(res[key])) return res[key] as T[];
    if (res?.data?.[key] && Array.isArray(res.data[key])) return res.data[key] as T[];
  }
  return [];
}

function extractObject<T>(res: any): T {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data as T;
  return res as T;
}

function extractPagination(res: any) {
  const src = res?.pagination || res?.data?.pagination || res?.meta || res?.data?.meta;
  return {
    page: src?.page ?? src?.currentPage ?? 1,
    pageSize: src?.pageSize ?? src?.limit ?? src?.perPage ?? 10,
    total: src?.total ?? src?.totalItems ?? src?.count ?? 0,
    totalPages: src?.totalPages ?? src?.pages ?? 0,
  };
}

// ── Stock Adjustment Payload ────────────────────────────────────────────────
export interface StockAdjustPayload {
  /** product id (or SKU – depends on your backend) */
  productId: string;
  /** number of units — positive for IN, negative for OUT is also accepted */
  quantity: number;
  /** "IN" | "OUT" | "ADJUSTMENT" */
  type: "IN" | "OUT" | "ADJUSTMENT";
  /** optional reason / notes */
  reason?: string;
  warehouseId?: string;
  batchNumber?: string;
  expiryDate?: string;
}

// ── Stock Movement type (returned from the movements endpoint) ──────────────
export interface StockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  warehouseId?: string;
  warehouse?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
  notes?: string;
}

// ── Inventory Report type ───────────────────────────────────────────────────
export interface InventoryReport {
  totalProducts?: number;
  totalStock?: number;
  totalValue?: number;
  outOfStockCount?: number;
  lowStockCount?: number;
  warehouseCount?: number;
  [key: string]: any; // backend may add more fields
}

// ═══════════════════════════════════════════════════════════════════════════
//  normalizeWarehouse & mapToBackendWarehouse
//  Maps the admin API response shape to the flat Warehouse type used in the UI.
//  Backend: { id: number, name, type: "WAREHOUSE"|"STORE", address, isActive, lat, lng }
// ═══════════════════════════════════════════════════════════════════════════
function mapToBackendWarehouse(w: any) {
  return {
    id: w.id ? Number(w.id) : undefined,
    name: w.name ?? "",
    type: w.type || "WAREHOUSE",
    address: w.address || w.location || "",
    lat: w.lat !== undefined && w.lat !== null ? Number(w.lat) : 0.0,
    lng: w.lng !== undefined && w.lng !== null ? Number(w.lng) : 0.0,
    capacity: w.capacity !== undefined && w.capacity !== null ? Number(w.capacity) : 0,
    isActive: w.isActive !== undefined && w.isActive !== null ? Boolean(w.isActive) : true,
    shortLocation: w.location || w.address || "",
    city: w.city || "",
    state: w.state || "",
    pincode: w.pincode || "",
    usedCapacity: w.used !== undefined && w.used !== null ? Number(w.used) : 0,
    staffCount: w.staffCount !== undefined && w.staffCount !== null ? Number(w.staffCount) : 0,
    operatingHours: w.operatingHours || "",
    managerName: w.manager || "",
    contactNumber: w.contact || "",
  };
}

function normalizeWarehouse(raw: any): Warehouse {
  const cap = raw?.capacity ?? 0;
  const usd = raw?.usedCapacity ?? raw?.used ?? 0;
  const util = raw?.utilization ?? (cap > 0 ? (usd / cap) * 100 : 0);
  return {
    id: String(raw?.id ?? ""),
    name: raw?.name ?? "Unknown Warehouse",
    // Keep the raw backend type value (WAREHOUSE / STORE); UI can display it directly
    type: raw?.type ?? "hub",
    // Map address → location for display; keep address as a separate field too
    location: raw?.shortLocation ?? raw?.location ?? raw?.address ?? "",
    address: raw?.address ?? raw?.location ?? "",
    city: raw?.city ?? undefined,
    state: raw?.state ?? undefined,
    pincode: raw?.pincode ?? undefined,
    capacity: cap,
    used: usd,
    utilization: util,
    // Derive status from isActive flag
    status: raw?.isActive === false ? "maintenance" : "active",
    isActive: raw?.isActive ?? true,
    lat: raw?.lat ?? null,
    lng: raw?.lng ?? null,
    manager: raw?.managerName ?? raw?.manager ?? undefined,
    contact: raw?.contactNumber ?? raw?.contact ?? undefined,
    totalSkus: raw?.totalSkus ?? 0,
    staffCount: raw?.staffCount ?? 0,
    operatingHours: raw?.operatingHours ?? undefined,
    products: raw?.products ?? 0,
    createdAt: raw?.createdAt ?? undefined,
  } satisfies Warehouse;
}
function normalizeInventoryItem(raw: any): InventoryItem & {
  // Extra product fields preserved for the detail view
  brand?: string;
  description?: string;
  price?: number;
  mrp?: number;
  costPrice?: number;
  taxRate?: number;
  unit?: string;
  weight?: string;
  productStatus?: string;
  // Extra warehouse fields
  warehouseName?: string;
  warehouseType?: string;
  warehouseAddress?: string;
  warehouseIsActive?: boolean;
  warehouseCreatedAt?: string;
  productCreatedAt?: string;
  productUpdatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
} {
  const product = raw?.product ?? {};
  const warehouse = raw?.warehouse ?? {};

  // Derive stock status
  const qty: number = raw?.qtyAvailable ?? 0;
  const safety: number = raw?.safetyStock ?? raw?.reorderPoint ?? 10;
  let status: InventoryItem["status"] = "in_stock";
  if (qty === 0) status = "out_of_stock";
  else if (qty <= safety) status = "low_stock";

  return {
    id: String(raw?.id ?? product?.id ?? ""),
    productName: product?.title ?? product?.name ?? "Unknown Product",
    sku: product?.sku ?? "",
    barcode: product?.barcode,
    warehouse: warehouse?.name ?? product?.warehouse ?? "",
    warehouseId: String(warehouse?.id ?? ""),
    stock: raw?.qtyAvailable ?? 0,            // total on-hand
    reserved: raw?.qtyReserved ?? 0,
    available: (raw?.qtyAvailable ?? 0) - (raw?.qtyReserved ?? 0),
    lowStockThreshold: raw?.reorderPoint ?? 10,
    safetyStock: raw?.safetyStock ?? 0,
    batch: raw?.batchNumber ?? undefined,
    expiryDate: raw?.expiryDate ?? null,
    lastUpdated: raw?.updatedAt ?? new Date().toISOString(),
    status,
    // ── Extra product fields ──────────────────────────────────
    brand: product?.brand ?? undefined,
    description: product?.description ?? product?.shortDescription ?? undefined,
    price: product?.price ?? undefined,
    mrp: product?.mrp ?? undefined,
    costPrice: product?.costPrice ?? undefined,
    taxRate: product?.taxRate ?? undefined,
    unit: product?.unit ?? undefined,
    weight: product?.weight ?? undefined,
    productStatus: product?.status ?? undefined,
    // ── Extra warehouse fields ────────────────────────────────
    warehouseName: warehouse?.name ?? undefined,
    warehouseType: warehouse?.type ?? undefined,
    warehouseAddress: warehouse?.address ?? undefined,
    warehouseIsActive: warehouse?.isActive ?? undefined,
    warehouseCreatedAt: warehouse?.createdAt ?? undefined,
    productCreatedAt: product?.createdAt ?? undefined,
    productUpdatedAt: product?.updatedAt ?? undefined,
    seoTitle: product?.seo?.metaTitle ?? undefined,
    seoDescription: product?.seo?.metaDescription ?? undefined,
  };
}

function normalizeStockTransfer(raw: any): StockTransfer {
  return {
    id: String(raw?.id ?? raw?.transferNumber ?? ""),
    product: raw?.productName ?? raw?.product ?? "Unknown Product",
    sku: raw?.sku ?? String(raw?.productId ?? ""),
    fromWarehouse: raw?.fromWarehouseName ?? raw?.fromWarehouse ?? "Unknown Warehouse",
    fromWarehouseId: raw?.fromWarehouseId ? String(raw.fromWarehouseId) : undefined,
    toWarehouse: raw?.toWarehouseName ?? raw?.toWarehouse ?? "Unknown Warehouse",
    toWarehouseId: raw?.toWarehouseId ? String(raw.toWarehouseId) : undefined,
    quantity: raw?.quantity ?? 0,
    status: (raw?.status?.toLowerCase() || "pending") as StockTransfer["status"],
    initiatedBy: raw?.initiatedBy ?? "System",
    date: raw?.createdAt ? raw.createdAt.split("T")[0] : undefined,
    createdAt: raw?.createdAt ?? undefined,
    completedAt: raw?.completedAt ?? null,
    eta: raw?.eta ?? undefined,
    notes: raw?.notes ?? undefined,
    productId: raw?.productId ? String(raw.productId) : undefined,
  } satisfies StockTransfer;
}

function normalizeFEFOBatch(raw: any): FEFOBatch {
  const quantity = Number(raw?.quantity ?? raw?.qty ?? raw?.amount ?? 0);
  const manufactured = raw?.manufactured ?? raw?.manufacturedDate ?? "";
  const expiry = raw?.expiry ?? raw?.expiryDate ?? "";
  let daysLeft = raw?.daysLeft;
  if (daysLeft === undefined || daysLeft === null) {
    if (expiry) {
      const expDate = new Date(expiry);
      if (!isNaN(expDate.getTime())) {
        const diffTime = expDate.getTime() - new Date().getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysLeft = 0;
      }
    } else {
      daysLeft = 0;
    }
  } else {
    daysLeft = Number(daysLeft);
  }

  let status = raw?.status?.toLowerCase();
  if (status !== "fresh" && status !== "expiring_soon" && status !== "expired") {
    if (daysLeft <= 0) {
      status = "expired";
    } else if (daysLeft <= 7) {
      status = "expiring_soon";
    } else {
      status = "fresh";
    }
  }

  return {
    id: String(raw?.id ?? raw?.batchNumber ?? raw?.batch ?? Math.random().toString()),
    product: raw?.productName ?? raw?.product ?? raw?.name ?? "Unknown Product",
    sku: raw?.sku ?? "",
    batch: raw?.batch ?? raw?.batchNumber ?? "Unknown Batch",
    quantity,
    manufactured,
    expiry,
    daysLeft,
    warehouse: raw?.warehouseName ?? raw?.warehouse ?? raw?.location ?? "Unknown Warehouse",
    status,
  };
}

function normalizeDemandForecast(raw: any): DemandForecast {
  const currentStock = Number(raw?.currentStock ?? raw?.stock ?? raw?.qtyAvailable ?? 0);
  const predictedDemand = Number(raw?.predictedDemand ?? raw?.predicted ?? raw?.demand ?? 0);
  const confidence = Number(raw?.confidence ?? 80);

  let trend = raw?.trend?.toLowerCase();
  if (trend !== "up" && trend !== "down" && trend !== "stable") {
    trend = "stable";
  }

  return {
    id: raw?.id ? String(raw.id) : undefined,
    product: raw?.productName ?? raw?.product ?? raw?.name ?? "Unknown Product",
    sku: raw?.sku ?? "",
    currentStock,
    predictedDemand,
    trend: trend as "up" | "down" | "stable",
    confidence,
    nextOrderDate: raw?.nextOrderDate ?? undefined,
    historicalData: Array.isArray(raw?.historicalData)
      ? raw.historicalData.map((h: any) => ({
        date: String(h.date),
        value: Number(h.value ?? h.qty ?? 0),
      }))
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  inventoryService
// ═══════════════════════════════════════════════════════════════════════════
export const inventoryService = {

  // ── GET /api/v1/admin/inventory ────────────────────────────────────────
  // Paginated inventory list (admin endpoint, 0-based page index)
  async getInventory(params?: InventoryQueryParams): Promise<{
    success: boolean;
    data: InventoryItem[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      // The admin API uses 0-based page indexing and `size` (not `pageSize`)
      const zeroBasedPage = Math.max(0, (params?.page ?? 1) - 1);
      const res = await apiClient.get<any>("/api/v1/admin/inventory", {
        params: {
          page: zeroBasedPage,
          size: params?.pageSize ?? 20,
          search: params?.search || undefined,
          sort: params?.sortBy ? `${params.sortBy},${params.sortOrder || "asc"}` : undefined,
        },
      });

      // Response: { success, data: { content: [...], page, size, totalElements, totalPages, ... } }
      const envelope = res?.data ?? res;
      const rawItems: any[] = envelope?.content ?? [];

      return {
        success: true,
        data: rawItems.map(normalizeInventoryItem),
        pagination: {
          page: (envelope?.page ?? zeroBasedPage) + 1,   // convert back to 1-based
          pageSize: envelope?.size ?? params?.pageSize ?? 20,
          total: envelope?.totalElements ?? rawItems.length,
          totalPages: envelope?.totalPages ?? 1,
        },
      };
    } catch (error: any) {
      console.warn("[inventoryService.getInventory]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/product/:productId ──────────────────────────────────
  // Get inventory details for a specific product
  async getInventoryItem(productId: string): Promise<{ success: boolean; data: InventoryItem }> {
    try {
      const res = await apiClient.get<any>(`/api/v1/admin/inventory/product/${productId}`);
      return { success: true, data: normalizeInventoryItem(extractObject<any>(res)) };
    } catch (error: any) {
      console.warn("[inventoryService.getInventoryItem]", error);
      throw error;
    }
  },

  // ── POST /api/v1/admin/inventory/adjust ───────────────────────────────
  // Adjust stock: IN / OUT / ADJUSTMENT
  async adjustStock(payload: StockAdjustPayload): Promise<{ success: boolean; data: any }> {
    try {
      // Backend expects a Map<String, String> (swagger: additionalProp1: "string")
      const stringPayload = Object.fromEntries(
        Object.entries(payload)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([key, value]) => [key, String(value)])
      );

      const res = await apiClient.post<any>("/api/v1/admin/inventory/adjust", stringPayload);
      return {
        success: res?.success ?? true,
        data: res?.data ?? res,
      };
    } catch (error: any) {
      console.warn("[inventoryService.adjustStock]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/warehouses ────────────────────────────
  // Get all active warehouses (admin endpoint)
  // Response: { success, data: [ { id, name, type, address, isActive, lat, lng, createdAt } ] }
  async getWarehouses(): Promise<{ success: boolean; data: Warehouse[] }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/warehouses");
      // Backend wraps the list in { success, data: [...] }
      const rawList: any[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      return {
        success: true,
        data: rawList.map(normalizeWarehouse),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getWarehouses]", error);
      throw error;
    }
  },

  async createWarehouse(
    warehouse: Partial<Warehouse>
  ): Promise<{ success: boolean; data: Warehouse }> {
    try {
      const payload = mapToBackendWarehouse(warehouse);
      const res = await apiClient.post<any>("/api/v1/admin/inventory/warehouses", payload);
      return { success: true, data: normalizeWarehouse(extractObject<any>(res)) };
    } catch (error: any) {
      console.warn("[inventoryService.createWarehouse]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/report ──────────────────────────────────────
  // Get inventory summary report
  async getInventoryReport(): Promise<{ success: boolean; data: InventoryReport }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/report");
      return {
        success: true,
        data: extractObject<InventoryReport>(res),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getInventoryReport]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/product/:productId/movements ──────────
  // Get stock movement history for a specific product
  async getProductMovements(
    productId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<{
    success: boolean;
    data: StockMovement[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const zeroBasedPage = Math.max(0, (params?.page ?? 1) - 1);
      const res = await apiClient.get<any>(
        `/api/v1/admin/inventory/product/${productId}/movements`,
        {
          params: {
            page: zeroBasedPage,
            size: params?.pageSize ?? 20,
          },
        }
      );

      const envelope = res?.data ?? res;
      const rawMovements: any[] = envelope?.content ?? [];

      const mappedMovements: StockMovement[] = rawMovements.map((m: any) => ({
        id: String(m.id),
        productId: String(m.product?.id || productId),
        type: m.movementType || m.type,
        quantity: m.qty || m.quantity,
        warehouseId: String(m.warehouse?.id || ""),
        warehouse: m.warehouse?.name || m.warehouse,
        reason: m.reason,
        performedBy: m.createdBy || m.performedBy,
        createdAt: m.createdAt,
        notes: m.notes,
      }));

      return {
        success: true,
        data: mappedMovements,
        pagination: {
          page: (envelope?.page ?? zeroBasedPage) + 1,
          pageSize: envelope?.size ?? params?.pageSize ?? 20,
          total: envelope?.totalElements ?? rawMovements.length,
          totalPages: envelope?.totalPages ?? 1,
        },
      };
    } catch (error: any) {
      console.warn("[inventoryService.getProductMovements]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/out-of-stock ────────────────────────────────
  // Get all items currently out of stock
  async getOutOfStockItems(): Promise<{ success: boolean; data: InventoryItem[] }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/out-of-stock");
      const rawData = res?.data ?? res;
      const rawItems = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      return {
        success: true,
        data: rawItems.map(normalizeInventoryItem),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getOutOfStockItems]", error);
      throw error;
    }
  },

  // ── GET /api/v1/admin/inventory/low-stock ───────────────────────────────────
  // Get all items currently in low stock
  async getLowStockItems(): Promise<{ success: boolean; data: InventoryItem[] }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/low-stock");
      const rawData = res?.data ?? res;
      const rawItems = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      return {
        success: true,
        data: rawItems.map(normalizeInventoryItem),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getLowStockItems]", error);
      throw error;
    }
  },

  // ── Warehouse helpers (single get / update – not in current spec but kept
  //    for compatibility with existing hooks/pages) ───────────────────────
  async getWarehouse(id: string): Promise<{ success: boolean; data: Warehouse }> {
    try {
      // No dedicated single-warehouse endpoint in the spec — fetch all and filter.
      const all = await inventoryService.getWarehouses();
      const wh = all.data.find((w) => w.id === id);
      if (!wh) throw new Error(`Warehouse ${id} not found`);
      return { success: true, data: wh };
    } catch (error: any) {
      console.warn("[inventoryService.getWarehouse]", error);
      throw error;
    }
  },

  async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<{ success: boolean; data: Warehouse }> {
    try {
      const payload = mapToBackendWarehouse({ ...updates, id });
      const res = await apiClient.put<any>(`/api/v1/admin/inventory/warehouses/${id}`, payload);
      return { success: true, data: normalizeWarehouse(extractObject<any>(res)) };
    } catch (error: any) {
      console.warn("[inventoryService.updateWarehouse]", error);
      throw error;
    }
  },

  // ── Stock Transfers (using dedicated admin/inventory/transfers endpoints) ─
  async getTransfers(params?: TransferQueryParams): Promise<{
    success: boolean;
    data: StockTransfer[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const zeroBasedPage = Math.max(0, (params?.page ?? 1) - 1);
      const res = await apiClient.get<any>("/api/v1/admin/inventory/transfers", {
        params: {
          page: zeroBasedPage,
          size: params?.pageSize ?? 10,
          search: params?.search || undefined,
          status: params?.status || undefined,
        },
      });

      const envelope = res?.data ?? res;
      const rawItems: any[] = envelope?.content ?? [];

      return {
        success: true,
        data: rawItems.map(normalizeStockTransfer),
        pagination: {
          page: (envelope?.page ?? zeroBasedPage) + 1,
          pageSize: envelope?.size ?? params?.pageSize ?? 10,
          total: envelope?.totalElements ?? rawItems.length,
          totalPages: envelope?.totalPages ?? 1,
        },
      };
    } catch (error: any) {
      console.warn("[inventoryService.getTransfers]", error);
      throw error;
    }
  },

  async createTransfer(
    transfer: Omit<StockTransfer, "id" | "status" | "createdAt"> & { productId?: string }
  ): Promise<{ success: boolean; data: StockTransfer }> {
    try {
      const payload = {
        transferNumber: `TRF-${Date.now()}`,
        productId: Number(transfer.productId || transfer.sku || 0),
        productName: transfer.product,
        fromWarehouseId: Number(transfer.fromWarehouseId || 0),
        fromWarehouseName: transfer.fromWarehouse,
        toWarehouseId: Number(transfer.toWarehouseId || 0),
        toWarehouseName: transfer.toWarehouse,
        quantity: Number(transfer.quantity || 0),
        status: "PENDING",
        notes: transfer.notes || "",
        createdAt: new Date().toISOString(),
      };

      const res = await apiClient.post<any>("/api/v1/admin/inventory/transfers", payload);
      return { success: true, data: normalizeStockTransfer(extractObject<any>(res)) };
    } catch (error: any) {
      console.warn("[inventoryService.createTransfer]", error);
      throw error;
    }
  },

  async updateTransferStatus(
    id: string,
    status: StockTransfer["status"]
  ): Promise<{ success: boolean; data: StockTransfer }> {
    try {
      const res = await apiClient.patch<any>(`/api/v1/admin/inventory/transfers/${id}`, {
        status: status.toUpperCase(),
      });
      return { success: true, data: normalizeStockTransfer(extractObject<any>(res)) };
    } catch (error: any) {
      console.warn("[inventoryService.updateTransferStatus]", error);
      throw error;
    }
  },

  // ── Safety Stock (no dedicated spec endpoint; kept for existing pages) ──
  async getSafetyStockRules(params?: { status?: string; search?: string }): Promise<{
    success: boolean;
    data: SafetyStockRule[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/safety-stock", { params });
      return {
        success: true,
        data: extractArray<SafetyStockRule>(res, ["rules"]),
        pagination: extractPagination(res),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getSafetyStockRules]", error);
      throw error;
    }
  },

  async updateSafetyStockRule(
    id: string,
    updates: Partial<SafetyStockRule>
  ): Promise<{ success: boolean; data: SafetyStockRule }> {
    try {
      const res = await apiClient.patch<any>(`/api/v1/admin/inventory/safety-stock/${id}`, updates);
      return { success: true, data: extractObject<SafetyStockRule>(res) };
    } catch (error: any) {
      console.warn("[inventoryService.updateSafetyStockRule]", error);
      throw error;
    }
  },

  // ── PUT /api/v1/admin/inventory/safety-stock ───────────────────────────
  // Adjust low-stock thresholds (safety stock) for an inventory item
  async updateSafetyStock(
    inventoryId: number,
    safetyStock: number
  ): Promise<{ success: boolean; data: any }> {
    try {
      const res = await apiClient.put<any>("/api/v1/admin/inventory/safety-stock", null, {
        params: {
          inventoryId,
          safetyStock,
        },
      });
      return {
        success: true,
        data: res?.data ?? res,
      };
    } catch (error: any) {
      console.warn("[inventoryService.updateSafetyStock]", error);
      throw error;
    }
  },

  // ── FEFO Batches (no dedicated spec endpoint; kept for existing pages) ──
  async getFEFOBatches(params?: { search?: string; status?: string }): Promise<{
    success: boolean;
    data: FEFOBatch[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/fefo", { params });
      const rawList = extractArray<any>(res, ["batches", "content"]);
      return {
        success: true,
        data: rawList.map(normalizeFEFOBatch),
        pagination: extractPagination(res),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getFEFOBatches]", error);
      throw error;
    }
  },

  // ── Demand Forecasts (no dedicated spec endpoint; kept for existing pages)
  async getDemandForecasts(): Promise<{ success: boolean; data: DemandForecast[] }> {
    try {
      const res = await apiClient.get<any>("/api/v1/admin/inventory/forecast");
      const rawList = extractArray<any>(res, ["forecasts", "content"]);
      return {
        success: true,
        data: rawList.map(normalizeDemandForecast),
      };
    } catch (error: any) {
      console.warn("[inventoryService.getDemandForecasts]", error);
      throw error;
    }
  },

  // ── Low Stock Alerts (kept for existing hook compatibility) ────────────
  // Delegates to the real /low-stock endpoint and casts to LowStockAlert shape
  async getLowStockAlerts(): Promise<{ success: boolean; data: LowStockAlert[] }> {
    try {
      const res = await inventoryService.getLowStockItems();
      // Map InventoryItem → LowStockAlert shape
      const alerts: LowStockAlert[] = res.data.map((item: any) => ({
        id: item.id ?? item._id ?? item.productId ?? "",
        product: item.productName ?? item.name ?? item.product ?? "",
        sku: item.sku,
        stock: item.available ?? item.stock ?? 0,
        threshold: item.lowStockThreshold ?? item.threshold ?? 0,
        warehouse: item.warehouse ?? item.warehouseId ?? "",
        status: (item.available === 0 || item.status === "out_of_stock") ? "critical" : "warning",
        lastRestocked: item.lastUpdated,
        suggestedOrder: item.lowStockThreshold
          ? Math.max(0, item.lowStockThreshold * 2 - (item.available ?? 0))
          : undefined,
      }));
      return { success: true, data: alerts };
    } catch (error: any) {
      console.warn("[inventoryService.getLowStockAlerts]", error);
      throw error;
    }
  },

  // ── Compatibility alias: updateStock → adjustStock ─────────────────────
  // Kept so existing pages that call updateStock() don't break.
  async updateStock(
    productId: string,
    updates: Partial<InventoryItem>
  ): Promise<{ success: boolean; data: any }> {
    return inventoryService.adjustStock({
      productId,
      quantity: updates.stock ?? 0,
      type: "ADJUSTMENT",
      reason: "Manual stock update via admin panel",
      warehouseId: updates.warehouseId,
    });
  },
};

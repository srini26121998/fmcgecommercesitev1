// ── Vendors API Service ───────────────────────────────────
// Full API integration for all vendor-related operations.
// Architecture: UI → Component → Hook → Service → API Gateway → Backend
//
// Postman Collection: admin > vendors
// Backend endpoints follow: /api/v1/admin/vendors/*
// ─────────────────────────────────────────────────────────

import { apiClient } from "@/lib/api-client";
import type {
  Vendor,
  VendorOnboarding,
  VendorProduct,
  VendorSettlement,
  VendorAnalyticsEntry,
  VendorFilters,
  VendorPageMeta,
  VendorSummary,
  SettlementSummary,
  OnboardingSummary,
  VendorAnalyticsSummary,
} from "@/types/vendors";

// ── Constants ─────────────────────────────────────────────

const VENDORS_PREFIX = "/api/v1/admin/vendors";

// ── Helpers ───────────────────────────────────────────────

/**
 * Extract a vendors array from any backend response shape.
 * Handles: { data: [...] }, { vendors: [...] }, raw array, { data: { vendors: [...] } }
 */
function extractVendors(raw: any): Vendor[] {
  if (!raw) return [];
  let list = [];
  if (Array.isArray(raw.data?.content)) list = raw.data.content;
  else if (Array.isArray(raw.content)) list = raw.content;
  else if (Array.isArray(raw.data?.vendors)) list = raw.data.vendors;
  else if (Array.isArray(raw.vendors)) list = raw.vendors;
  else if (Array.isArray(raw.data)) list = raw.data;
  else if (Array.isArray(raw)) list = raw;
  return list.map(mapVendorFromApi);
}

/**
 * Extract a single vendor from any backend response shape.
 */
function extractVendor(raw: any): Vendor | null {
  if (!raw) return null;
  let v = null;
  if (raw.data?.vendor) v = raw.data.vendor;
  else if (raw.vendor) v = raw.vendor;
  else if (raw.data?._id || raw.data?.id) v = raw.data;
  else if (raw._id || raw.id) v = raw;
  return v ? mapVendorFromApi(v) : null;
}

function mapVendorFromApi(v: any): Vendor {
  return {
    id: String(v.id || v._id || ""),
    vendorId: String(v.vendorId || v.id || v._id || ""),
    name: v.businessName || v.name || "Unknown Vendor",
    email: v.email || "",
    phone: v.phone || "",
    category: v.category || "Uncategorized",
    subCategories: v.subCategories || [],
    status: (v.status || "pending").toLowerCase(),
    performance: v.performance || "average",
    rating: v.rating || 0,
    totalProducts: v.totalProducts || 0,
    activeProducts: v.activeProducts || 0,
    totalOrders: v.totalOrders || 0,
    totalSales: v.totalSales || 0,
    commissionRate: v.commissionRate || 0,
    totalCommission: v.totalCommission || 0,
    netPayout: v.netPayout || 0,
    pendingPayout: v.pendingPayout || 0,
    onTimeDeliveryRate: v.onTimeDeliveryRate || 0,
    returnRate: v.returnRate || 0,
    city: v.city || "",
    state: v.state || "",
    pincode: v.pincode || "",
    address: v.address || "",
    gstin: v.gstNumber || v.gstin || "",
    pan: v.pan || "",
    bankAccount: v.bankAccount || "",
    ifsc: v.ifsc || "",
    bankName: v.bankName || "",
    contactPerson: v.contactName || v.contactPerson || "",
    joinedDate: v.createdAt || v.joinedDate || new Date().toISOString().split("T")[0],
    lastActiveDate: v.updatedAt || v.lastActiveDate || new Date().toISOString().split("T")[0],
    tags: v.tags || [],
  };
}

function mapVendorSettlementFromApi(s: any): VendorSettlement {
  if (!s) {
    return {
      id: "",
      vendorId: "",
      vendorName: "",
      period: "",
      periodStart: "",
      periodEnd: "",
      totalOrders: 0,
      grossSales: 0,
      returns: 0,
      netSales: 0,
      commissionRate: 0,
      commission: 0,
      tax: 0,
      adjustments: 0,
      netPayable: 0,
      status: "pending",
      dueDate: "",
      bankAccount: "",
      ifsc: "",
    };
  }
  return {
    id: String(s.id || s._id || ""),
    vendorId: String(s.vendorId || s.vendor_id || ""),
    vendorName: String(s.vendorName || s.vendor_name || s.vendor?.businessName || s.vendor?.name || "Unknown Vendor"),
    period: String(s.period || ""),
    periodStart: String(s.periodStart || s.period_start || s.startDate || s.start_date || ""),
    periodEnd: String(s.periodEnd || s.period_end || s.endDate || s.end_date || ""),
    totalOrders: Number(s.totalOrders || s.total_orders || s.ordersCount || 0),
    grossSales: Number(s.grossSales || s.gross_sales || s.grossAmount || s.gross_amount || 0),
    returns: Number(s.returns || 0),
    netSales: Number(s.netSales || s.net_sales || 0),
    commissionRate: Number(s.commissionRate || s.commission_rate || 0),
    commission: Number(s.commission || 0),
    tax: Number(s.tax || 0),
    adjustments: Number(s.adjustments || 0),
    netPayable: Number(s.netPayable || s.net_payable || s.netAmount || s.net_amount || 0),
    status: (s.status || "pending").toLowerCase() as VendorSettlement["status"],
    dueDate: String(s.dueDate || s.due_date || ""),
    paidDate: s.paidDate || s.paid_date || undefined,
    paymentRef: s.paymentRef || s.payment_ref || undefined,
    bankAccount: String(s.bankAccount || s.bank_account || s.vendor?.bankAccount || ""),
    ifsc: String(s.ifsc || s.vendor?.ifsc || ""),
    notes: s.notes || undefined,
  };
}

/**
 * Extract pagination meta from a backend response.
 * Normalises to our internal VendorPageMeta shape.
 */
function extractMeta(raw: any, fallbackTotal: number, page: number, pageSize: number): VendorPageMeta {
  const total      = raw?.data?.totalElements ?? raw?.totalElements ?? raw?.data?.total ?? raw?.total ?? fallbackTotal;
  const totalPages = raw?.data?.totalPages ?? raw?.totalPages ?? Math.ceil(total / pageSize);
  return { page, pageSize, total, totalPages };
}

/**
 * Build a URLSearchParams string for list queries.
 */
function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ── Vendor Summary computed from a list ───────────────────

function computeVendorSummary(vendors: Vendor[]): VendorSummary {
  return {
    totalVendors:     vendors.length,
    activeVendors:    vendors.filter((v) => v.status === "active").length,
    pendingVendors:   vendors.filter((v) => v.status === "pending").length,
    suspendedVendors: vendors.filter((v) => v.status === "suspended").length,
    totalProducts:    vendors.reduce((s, v) => s + v.totalProducts, 0),
    totalSales:       vendors.reduce((s, v) => s + v.totalSales, 0),
    totalCommission:  vendors.reduce((s, v) => s + v.totalCommission, 0),
    pendingPayouts:   vendors.reduce((s, v) => s + v.pendingPayout, 0),
    avgRating:
      vendors.length
        ? Math.round((vendors.reduce((s, v) => s + v.rating, 0) / vendors.length) * 10) / 10
        : 0,
    excellentCount: vendors.filter((v) => v.performance === "excellent").length,
    poorCount:      vendors.filter((v) => v.performance === "poor").length,
  };
}

// ── vendorsService ────────────────────────────────────────

export const vendorsService = {

  // ══════════════════════════════════════════════════════
  // ── 1. GET ALL VENDORS WITH PAGINATION ──────────────
  // GET /api/v1/admin/vendors?page=&limit=&search=&status=
  // Postman: "Get all vendors with pagination"
  // ══════════════════════════════════════════════════════

  async getVendors(
    filters?: Partial<VendorFilters>,
    page = 1,
    pageSize = 10
  ): Promise<{ data: Vendor[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1), // API is 0-indexed
        size: pageSize,
        search:      filters?.search,
        status:      filters?.status,
        category:    filters?.category,
        performance: filters?.performance,
        sortBy:      filters?.sortBy,
        sortOrder:   filters?.sortOrder,
        dateFrom:    filters?.dateFrom,
        dateTo:      filters?.dateTo,
      });

      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}${query}`);
      const vendors = extractVendors(raw);
      const meta    = extractMeta(raw, vendors.length, page, pageSize);

      return { data: vendors, meta };
    } catch (err) {
      console.error("[VendorsService] getVendors failed:", err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── 2. GET VENDOR BY ID ───────────────────────────
  // GET /api/v1/admin/vendors/:id
  // Postman: "Get vendor by ID"
  // ══════════════════════════════════════════════════════

  async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/${id}`);
      return extractVendor(raw);
    } catch (err) {
      console.error(`[VendorsService] getVendorById(${id}) failed:`, err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── 3. CREATE A NEW VENDOR ────────────────────────
  // POST /api/v1/admin/vendors
  // Postman: "Create a new vendor"
  // ══════════════════════════════════════════════════════

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    try {
      const payload = {
        businessName: data.name,
        contactName: data.contactPerson || data.name,
        email: data.email,
        phone: data.phone || "0000000000",
        gstNumber: data.gstin || "PENDING",
        status: data.status || "pending",
        commissionRate: data.commissionRate || 10,
      };
      
      const raw = await apiClient.post<any>(`${VENDORS_PREFIX}`, payload);
      const vendor = extractVendor(raw);
      if (!vendor) throw new Error("Invalid response from create vendor API");
      return vendor;
    } catch (err) {
      console.error("[VendorsService] createVendor API failed:", err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── 4. UPDATE VENDOR DETAILS ──────────────────────
  // PUT /api/v1/admin/vendors/:id
  // Postman: "Update vendor details"
  // ══════════════════════════════════════════════════════

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor | null> {
    try {
      const payload: any = {
        businessName: data.name,
        contactName: data.contactPerson,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstin,
        status: data.status,
        commissionRate: data.commissionRate,
      };
      
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      
      const raw = await apiClient.put<any>(`${VENDORS_PREFIX}/${id}`, payload);
      return extractVendor(raw);
    } catch (err) {
      console.error(`[VendorsService] updateVendor(${id}) API failed:`, err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── 5. DELETE A VENDOR ────────────────────────────
  // DELETE /api/v1/admin/vendors/:id
  // Postman: "Delete a vendor"
  // ══════════════════════════════════════════════════════

  async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const raw = await apiClient.delete<any>(`${VENDORS_PREFIX}/${id}`);
      return {
        success: true,
        message: raw?.message || raw?.data?.message || "Vendor deleted successfully",
      };
    } catch (err) {
      console.error(`[VendorsService] deleteVendor(${id}) API failed:`, err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── 6. GET VENDOR SETTLEMENTS ─────────────────────
  // GET /api/v1/admin/vendors/:id/settlements
  // Postman: "Get vendor settlements"
  // ══════════════════════════════════════════════════════

  async getVendorSettlements(
    vendorId: string,
    page = 1,
    pageSize = 10
  ): Promise<{ data: VendorSettlement[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1),
        size: pageSize,
      });
      const raw = await apiClient.get<any>(
        `${VENDORS_PREFIX}/${vendorId}/settlements${query}`
      );
      const settlements: any[] =
        raw?.data?.settlements ?? raw?.settlements ?? raw?.data ?? [];
      const mapped = settlements.map(mapVendorSettlementFromApi);
      const meta = extractMeta(raw, mapped.length, page, pageSize);
      return { data: mapped, meta };
    } catch (err) {
      console.error(`[VendorsService] getVendorSettlements(${vendorId}) failed:`, err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════
  // ── DERIVED / AGGREGATED METHODS ─────────────────────
  // These methods compute KPI summaries or support the
  // admin dashboard. They call the real APIs then aggregate.
  // ══════════════════════════════════════════════════════

  /**
   * Vendor KPI summary for dashboard cards.
   * Fetches page-1 data from the real API and aggregates.
   */
  async getVendorSummary(): Promise<VendorSummary> {
    try {
      // Fetch a large page to get an accurate summary
      const { data } = await vendorsService.getVendors({}, 1, 1000);
      return computeVendorSummary(data);
    } catch (err) {
      console.error("[VendorsService] getVendorSummary failed:", err);
      throw err;
    }
  },

  /**
   * Update vendor status (active / suspended / inactive…).
   * Delegates to updateVendor() — kept as a convenience alias
   * used by the vendor management UI.
   */
  async updateVendorStatus(id: string, status: Vendor["status"]): Promise<void> {
    await vendorsService.updateVendor(id, { status });
  },

  // ══════════════════════════════════════════════════════
  // ── ONBOARDING ────────────────────────────────────────

  async getOnboardingApplications(
    filters?: Partial<VendorFilters>,
    page = 1,
    pageSize = 10
  ): Promise<{ data: VendorOnboarding[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1),
        size: pageSize,
        search: filters?.search,
        status: filters?.status,
      });
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/onboarding${query}`);
      const applications = raw?.data?.content ?? raw?.content ?? raw?.data ?? [];
      const meta = extractMeta(raw, applications.length, page, pageSize);
      return { data: applications, meta };
    } catch (err) {
      console.error("[VendorsService] getOnboardingApplications failed:", err);
      throw err;
    }
  },

  async getOnboardingSummary(): Promise<OnboardingSummary> {
    try {
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/onboarding/summary`);
      return raw?.data || raw;
    } catch (err) {
      console.error("[VendorsService] getOnboardingSummary failed:", err);
      throw err;
    }
  },

  async approveVendor(id: string): Promise<void> {
    try {
      await apiClient.post(`${VENDORS_PREFIX}/${id}/approve`, {});
    } catch (err) {
      console.error(`[VendorsService] approveVendor(${id}) failed:`, err);
      throw err;
    }
  },

  async rejectVendor(id: string, reason: string): Promise<void> {
    try {
      await apiClient.post(`${VENDORS_PREFIX}/${id}/reject`, { reason });
    } catch (err) {
      console.error(`[VendorsService] rejectVendor(${id}) failed:`, err);
      throw err;
    }
  },

  // ── VENDOR PRODUCTS ───────────────────────────────────

  async getVendorProducts(
    filters?: Partial<VendorFilters> & { vendorId?: string },
    page = 1,
    pageSize = 10
  ): Promise<{ data: VendorProduct[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1),
        size: pageSize,
        vendorId: filters?.vendorId,
        search: filters?.search,
        status: filters?.status,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      });
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/products${query}`);
      const products = raw?.data?.content ?? raw?.content ?? raw?.data ?? [];
      const meta = extractMeta(raw, products.length, page, pageSize);
      return { data: products, meta };
    } catch (err) {
      console.error("[VendorsService] getVendorProducts failed:", err);
      throw err;
    }
  },

  async getProductSummary(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStockCount: number;
    inactiveCount: number;
    avgMargin: number;
    totalStockValue: number;
  }> {
    try {
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/products/summary`);
      return raw?.data || raw;
    } catch (err) {
      console.error("[VendorsService] getProductSummary failed:", err);
      throw err;
    }
  },

  // ── ALL-VENDORS SETTLEMENTS (admin dashboard) ─────────

  async getSettlements(
    filters?: Partial<VendorFilters>,
    page = 1,
    pageSize = 10
  ): Promise<{ data: VendorSettlement[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1),
        size:      pageSize,
        search:    filters?.search,
        status:    filters?.status,
        sortBy:    filters?.sortBy,
        sortOrder: filters?.sortOrder,
      });
      const raw = await apiClient.get<any>(`/api/v1/admin/settlements${query}`);
      const settlements: any[] =
        raw?.data?.settlements ?? raw?.settlements ?? raw?.data ?? [];
      const mapped = settlements.map(mapVendorSettlementFromApi);
      const meta = extractMeta(raw, mapped.length, page, pageSize);
      return { data: mapped, meta };
    } catch (err) {
      console.error("[VendorsService] getSettlements failed:", err);
      throw err;
    }
  },

  async getSettlementSummary(): Promise<SettlementSummary> {
    try {
      const { data: settlements } = await vendorsService.getSettlements({}, 1, 1000);
      return {
        totalSettlements: settlements.length,
        pendingCount:     settlements.filter((s) => s.status === "pending").length,
        processingCount:  settlements.filter((s) => s.status === "processing").length,
        completedCount:   settlements.filter((s) => s.status === "completed").length,
        totalGrossSales:  settlements.reduce((s, st) => s + st.grossSales, 0),
        totalCommission:  settlements.reduce((s, st) => s + st.commission, 0),
        totalNetPayable:  settlements.reduce((s, st) => s + st.netPayable, 0),
        pendingAmount:    settlements
          .filter((s) => s.status === "pending")
          .reduce((s, st) => s + st.netPayable, 0),
      };
    } catch (err) {
      console.error("[VendorsService] getSettlementSummary failed:", err);
      throw err;
    }
  },

  async processSettlement(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/admin/settlements/${id}/process`, {});
    } catch (err) {
      console.error(`[VendorsService] processSettlement(${id}) failed:`, err);
      throw err;
    }
  },

  // ── ANALYTICS ─────────────────────────────────────────

  async getVendorAnalytics(
    filters?: Partial<VendorFilters>,
    page = 1,
    pageSize = 10
  ): Promise<{ data: VendorAnalyticsEntry[]; meta: VendorPageMeta }> {
    try {
      const query = buildQuery({
        page: Math.max(0, page - 1),
        size: pageSize,
        search: filters?.search,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      });
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/analytics${query}`);
      const analytics = raw?.data?.content ?? raw?.content ?? raw?.data ?? [];
      const meta = extractMeta(raw, analytics.length, page, pageSize);
      return { data: analytics, meta };
    } catch (err) {
      console.error("[VendorsService] getVendorAnalytics failed:", err);
      throw err;
    }
  },

  async getAnalyticsSummary(): Promise<VendorAnalyticsSummary> {
    try {
      const raw = await apiClient.get<any>(`${VENDORS_PREFIX}/analytics/summary`);
      return raw?.data || raw;
    } catch (err) {
      console.error("[VendorsService] getAnalyticsSummary failed:", err);
      throw err;
    }
  },

  // ── EXPORT ────────────────────────────────────────────

  async exportVendors(
    format: "csv" | "xlsx" | "pdf"
  ): Promise<{ success: boolean; downloadUrl: string }> {
    try {
      const raw = await apiClient.get<any>(
        `${VENDORS_PREFIX}/export?format=${format}`
      );
      return {
        success: true,
        downloadUrl: raw?.downloadUrl || raw?.data?.downloadUrl || `/api/vendors/export?format=${format}`,
      };
    } catch (err) {
      console.error("[VendorsService] exportVendors failed:", err);
      throw err;
    }
  },
};

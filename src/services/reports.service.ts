// ── Reports & Analytics Service Layer ─────────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import { apiClient } from "@/lib/api-client";
import type {
  GSTReportEntry,
  CustomerReportEntry,
  CohortEntry,
  AbandonedCartEntry,
  RevenueAnalyticsEntry,
  PromotionROIEntry,
  InventoryReportEntry,
  VendorReportEntry,
  TaxReportEntry,
  SalesReportEntry,
  ReportPageMeta,
  ReportFilters,
} from "@/types/reports";

export const reportsService = {
  async getGSTReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: GSTReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/gst?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch GST reports:", error);
      throw error;
    }
  },

  async getGSTSummary(): Promise<{
    totalLiability: number;
    totalInputCredit: number;
    netPayable: number;
    pendingReturns: number;
    overdueReturns: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/gst/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalLiability !== undefined) return summary;
      throw new Error("Invalid GST summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch GST summary:", error);
      throw error;
    }
  },

  async getCustomerReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: CustomerReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/customers?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch customer reports:", error);
      throw error;
    }
  },

  async getCustomerSummary(): Promise<{
    totalCustomers: number;
    totalRevenue: number;
    avgRetentionRate: number;
    platinumCount: number;
    atRiskCount: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/customers/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalCustomers !== undefined) return summary;
      throw new Error("Invalid customer summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch customer summary:", error);
      throw error;
    }
  },

  async getCohortData(
    page = 1,
    pageSize = 12,
  ): Promise<{ data: CohortEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/cohorts?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch cohort data:", error);
      throw error;
    }
  },

  async getCohortSummary(): Promise<{
    totalCohorts: number;
    totalUsers: number;
    avgRetentionWeek1: number;
    avgRetentionWeek4: number;
    avgRetentionWeek12: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/cohorts/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalCohorts !== undefined) return summary;
      throw new Error("Invalid cohort summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch cohort summary:", error);
      throw error;
    }
  },

  async getAbandonedCartData(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: AbandonedCartEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/abandoned-carts?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch abandoned cart data:", error);
      throw error;
    }
  },

  async getAbandonedCartSummary(): Promise<{
    totalAbandoned: number;
    totalRecovered: number;
    recoveryRate: number;
    lostRevenue: number;
    recoveredRevenue: number;
    avgCartValue: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/abandoned-carts/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalAbandoned !== undefined) return summary;
      throw new Error("Invalid abandoned cart summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch abandoned cart summary:", error);
      throw error;
    }
  },

  async getRevenueAnalytics(
    page = 1,
    pageSize = 12,
  ): Promise<{ data: RevenueAnalyticsEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/revenue?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch revenue analytics:", error);
      throw error;
    }
  },

  async getRevenueSummary(): Promise<{
    totalRevenue: number;
    totalCOGS: number;
    totalGrossProfit: number;
    avgGrossMargin: number;
    totalNetProfit: number;
    revenueGrowth: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/revenue/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalRevenue !== undefined) return summary;
      throw new Error("Invalid revenue summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch revenue summary:", error);
      throw error;
    }
  },

  async getPromotionROIData(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: PromotionROIEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/promotions?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch promotion ROI data:", error);
      throw error;
    }
  },

  async getPromotionROISummary(): Promise<{
    totalPromotions: number;
    totalCost: number;
    totalRevenue: number;
    avgROI: number;
    highestROI: number;
    bestPromotion: string;
    totalRedemptions: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/promotions/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalPromotions !== undefined) return summary;
      throw new Error("Invalid promotion ROI summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch promotion ROI summary:", error);
      throw error;
    }
  },

  async exportReport(
    reportType: string,
    format: "csv" | "xlsx" | "pdf",
    filters?: Partial<ReportFilters>,
  ): Promise<{ success: boolean; downloadUrl: string }> {
    try {
      const params = new URLSearchParams();
      params.append("format", format);
      if (filters?.dateFrom) params.append("startDate", filters.dateFrom);
      if (filters?.dateTo) params.append("endDate", filters.dateTo);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.period) params.append("period", filters.period);

      const qs = params.toString();
      const requestUrl = qs
        ? `/api/v1/reports/${reportType}/export?${qs}`
        : `/api/v1/reports/${reportType}/export`;
      const response = await apiClient.get<any>(requestUrl, {
        responseType: "blob",
      });
      const blob =
        response instanceof Blob
          ? response
          : new Blob([response], {
            type: format === "csv" ? "text/csv" : "application/octet-stream",
          });
      const url = window.URL.createObjectURL(blob);
      return { success: true, downloadUrl: url };
    } catch (error) {
      console.error(`[reportsService] Failed to export ${reportType} report:`, error);
      throw error;
    }
  },

  // ── Sales Reports ─────────────────────────────────────

  async getSalesReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: SalesReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(pageSize));
      if (filters?.dateFrom) params.append("startDate", filters.dateFrom);
      if (filters?.dateTo) params.append("endDate", filters.dateTo);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy as string);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const qs = params.toString();
      const url = qs ? `/api/v1/admin/reports/sales?${qs}` : `/api/v1/admin/reports/sales`;
      const response = await apiClient.get<any>(url);
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch sales reports:", error);
      throw error;
    }
  },

  async getSalesSummary(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalRefunds: number;
    totalDiscounts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    topCategory: string;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/sales/summary",
      );
      return response?.data || response;
    } catch (error) {
      console.error("[reportsService] Failed to fetch sales summary:", error);
      throw error;
    }
  },

  // ── Inventory Reports ─────────────────────────────────

  async getInventoryReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: InventoryReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(pageSize));
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy as string);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const qs = params.toString();
      const url = qs
        ? `/api/v1/admin/reports/inventory?${qs}`
        : `/api/v1/admin/reports/inventory`;
      const response = await apiClient.get<any>(url);
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch inventory reports:", error);
      throw error;
    }
  },

  async getInventorySummary(): Promise<{
    totalSKUs: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockedCount: number;
    avgTurnoverRate: number;
    totalDamagedValue: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/inventory/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalSKUs !== undefined) return summary;
      throw new Error("Invalid inventory summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch inventory summary:", error);
      throw error;
    }
  },

  // ── Vendor Reports ────────────────────────────────────

  async getVendorReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: VendorReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/vendors?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch vendor reports:", error);
      throw error;
    }
  },

  async getVendorSummary(): Promise<{
    totalVendors: number;
    totalGrossSales: number;
    totalCommission: number;
    totalNetPayout: number;
    totalPendingPayout: number;
    avgRating: number;
    excellentCount: number;
    poorCount: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/vendors/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalVendors !== undefined) return summary;
      throw new Error("Invalid vendor summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch vendor summary:", error);
      throw error;
    }
  },

  // ── Tax Reports ───────────────────────────────────────

  async getTaxReports(
    filters?: Partial<ReportFilters>,
    page = 1,
    pageSize = 10,
  ): Promise<{ data: TaxReportEntry[]; meta: ReportPageMeta }> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("pageSize", String(pageSize));
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString();
      const response = await apiClient.get<any>(
        `/api/v1/admin/reports/taxes?${qs}`,
      );
      const resData = response?.data || response;
      const data = resData?.content || resData?.reports || (Array.isArray(resData) ? resData : []);
      const total = resData?.totalElements || resData?.total || data.length;

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error("[reportsService] Failed to fetch tax reports:", error);
      throw error;
    }
  },

  async getTaxSummary(): Promise<{
    totalTaxCollected: number;
    totalTaxPaid: number;
    pendingFilings: number;
    overdueFilings: number;
    nextDueDate: string;
    totalITCClaimed: number;
  }> {
    try {
      const response = await apiClient.get<any>(
        "/api/v1/admin/reports/taxes/summary",
      );
      const summary =
        response?.data?.summary ||
        response?.summary ||
        response?.data ||
        response;
      if (summary && summary.totalTaxCollected !== undefined) return summary;
      throw new Error("Invalid tax summary response format");
    } catch (error) {
      console.error("[reportsService] Failed to fetch tax summary:", error);
      throw error;
    }
  },
};

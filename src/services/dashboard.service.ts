// ── Dashboard Service Layer ──────────────────────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
//
// This service is the single source of truth for dashboard data.

import type {
  DashboardOverview,
  DashboardQueryParams,
  ApiResponse,
} from "@/types/dashboard";
import { apiClient } from "@/lib/api-client";

const DEFAULT_PARAMS: Partial<DashboardQueryParams> = {
  period: "30d",
};

/**
 * Common request helper for dashboard endpoints to eliminate code duplication.
 */
async function fetchDashboardData<T>(endpoint: string, params?: Partial<DashboardQueryParams>): Promise<ApiResponse<T>> {
  try {
    const merged = { ...DEFAULT_PARAMS, ...params };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any>(endpoint, { params: merged });
    
    // Normalize response from various backend formats
    const success = response?.success ?? true;
    const data = response?.data !== undefined ? response.data : response;
    
    return {
      success,
      data,
      error: response?.error || null,
      meta: response?.meta,
    };
  } catch (error) {
    console.error(`[dashboardService] fetch from ${endpoint} failed:`, error);
    throw error;
  }
}

// ── Dashboard Service ────────────────────────────────────

export const dashboardService = {
  /**
   * Fetch the full executive dashboard overview.
   */
  getOverview(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview>> {
    return fetchDashboardData<DashboardOverview>("/api/v1/admin/dashboard/overview", params);
  },

  /**
   * Fetch only revenue data.
   */
  getRevenue(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["revenue"]>> {
    return fetchDashboardData<DashboardOverview["revenue"]>("/api/v1/admin/dashboard/revenue", params);
  },

  /**
   * Fetch only orders data.
   */
  getOrders(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["orders"]>> {
    return fetchDashboardData<DashboardOverview["orders"]>("/api/v1/admin/dashboard/orders", params);
  },

  /**
   * Fetch only customers data.
   */
  getCustomers(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["customers"]>> {
    return fetchDashboardData<DashboardOverview["customers"]>("/api/v1/admin/dashboard/customers", params);
  },

  /**
   * Fetch live orders for the real-time map / list.
   */
  getLiveOrders(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["liveOrders"]>> {
    return fetchDashboardData<DashboardOverview["liveOrders"]>("/api/v1/admin/dashboard/live-orders", params);
  },

  /**
   * Fetch low stock alerts.
   */
  getLowStockAlerts(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["lowStockAlerts"]>> {
    return fetchDashboardData<DashboardOverview["lowStockAlerts"]>("/api/v1/admin/dashboard/low-stock", params);
  },

  /**
   * Fetch vendor payment queue.
   */
  getVendorPayments(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["vendorPayments"]>> {
    return fetchDashboardData<DashboardOverview["vendorPayments"]>("/api/v1/admin/dashboard/vendor-payments", params);
  },

  /**
   * Fetch top selling products.
   */
  getTopProducts(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["topProducts"]>> {
    return fetchDashboardData<DashboardOverview["topProducts"]>("/api/v1/admin/dashboard/top-products", params);
  },

  /**
   * Fetch customer acquisition metrics.
   */
  getAcquisitionMetrics(params?: Partial<DashboardQueryParams>): Promise<ApiResponse<DashboardOverview["acquisitionMetrics"]>> {
    return fetchDashboardData<DashboardOverview["acquisitionMetrics"]>("/api/v1/admin/dashboard/acquisition", params);
  },
};

export type DashboardService = typeof dashboardService;

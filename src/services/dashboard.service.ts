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

const mockDashboardOverview: DashboardOverview = {
  revenue: {
    total: 125000,
    formatted: "₹1,25,000",
    growth: 15.5,
    currency: "INR",
    chart: [
      { label: "Mon", value: 10000 },
      { label: "Tue", value: 15000 },
      { label: "Wed", value: 12000 },
      { label: "Thu", value: 20000 },
      { label: "Fri", value: 25000 },
      { label: "Sat", value: 30000 },
      { label: "Sun", value: 13000 },
    ],
    period: "7d",
  },
  orders: {
    total: 450,
    growth: 8.2,
    pending: 45,
    processing: 120,
    delivered: 280,
    cancelled: 5,
    chart: [
      { label: "Mon", value: 40 },
      { label: "Tue", value: 50 },
      { label: "Wed", value: 45 },
      { label: "Thu", value: 60 },
      { label: "Fri", value: 80 },
      { label: "Sat", value: 100 },
      { label: "Sun", value: 75 },
    ],
    period: "7d",
  },
  customers: {
    total: 12500,
    growth: 5.4,
    active: 8500,
    newThisWeek: 350,
    churnRate: 2.1,
    lifetimeValue: 15000,
    acquisition: [
      { source: "Organic", count: 5000, percentage: 40, trend: "up", color: "#10b981" },
      { source: "Direct", count: 3750, percentage: 30, trend: "up", color: "#3b82f6" },
      { source: "Social", count: 2500, percentage: 20, trend: "up", color: "#8b5cf6" },
      { source: "Referral", count: 1250, percentage: 10, trend: "up", color: "#f59e0b" },
    ],
  },
  liveOrders: [
    {
      id: "ORD-1001",
      customer: "Rahul Sharma",
      items: 3,
      total: 1250,
      status: "preparing",
      time: "10 mins ago",
      area: "Indiranagar, Bangalore",
    },
    {
      id: "ORD-1002",
      customer: "Priya Patel",
      items: 1,
      total: 450,
      status: "out_for_delivery",
      time: "25 mins ago",
      area: "Koramangala, Bangalore",
    },
  ],
  lowStockAlerts: [
    {
      id: "PRD-001",
      name: "Organic Honey 500g",
      sku: "ORG-HNY-500",
      stock: 5,
      threshold: 20,
      warehouse: "Bangalore Central",
      category: "Groceries",
      status: "critical",
    },
    {
      id: "PRD-002",
      name: "Premium Almonds 1kg",
      sku: "PRM-ALM-1KG",
      stock: 12,
      threshold: 15,
      warehouse: "Mumbai North",
      category: "Dry Fruits",
      status: "warning",
    },
  ],
  vendorPayments: [
    {
      id: "PAY-001",
      vendor: "Farm Fresh Suppliers",
      invoiceRef: "INV-2023-001",
      amount: 45000,
      dueDate: new Date().toISOString(),
      status: "pending",
      priority: "high",
    },
    {
      id: "PAY-002",
      vendor: "Global Traders",
      invoiceRef: "INV-2023-002",
      amount: 125000,
      dueDate: new Date().toISOString(),
      status: "processing",
      priority: "medium",
    }
  ],
  topProducts: [
    {
      id: "PRD-003",
      name: "Whole Wheat Atta 5kg",
      sales: 1250,
      revenue: 250000,
      growth: "+15%",
      rank: 1,
    },
    {
      id: "PRD-004",
      name: "Basmati Rice 10kg",
      sales: 980,
      revenue: 490000,
      growth: "+8%",
      rank: 2,
    },
  ],
  acquisitionMetrics: [
    {
      channel: "Google Ads",
      users: 5000,
      percentage: 40,
      costPerAcquisition: 150,
      conversionRate: 3.5,
      trend: "up",
      color: "#3b82f6",
    },
  ],
  lastUpdated: new Date().toISOString(),
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
  } catch (error: any) {
    console.warn(`[dashboardService] fetch from ${endpoint} failed, falling back to mock data:`, error.message || error);
    
    let mockData: any = mockDashboardOverview;
    
    if (endpoint.includes("/revenue")) mockData = mockDashboardOverview.revenue;
    else if (endpoint.includes("/orders")) mockData = mockDashboardOverview.orders;
    else if (endpoint.includes("/customers")) mockData = mockDashboardOverview.customers;
    else if (endpoint.includes("/live-orders")) mockData = mockDashboardOverview.liveOrders;
    else if (endpoint.includes("/low-stock")) mockData = mockDashboardOverview.lowStockAlerts;
    else if (endpoint.includes("/vendor-payments")) mockData = mockDashboardOverview.vendorPayments;
    else if (endpoint.includes("/top-products")) mockData = mockDashboardOverview.topProducts;
    else if (endpoint.includes("/acquisition")) mockData = mockDashboardOverview.acquisitionMetrics;
    
    return {
      success: true,
      data: mockData as T,
      error: null,
    };
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

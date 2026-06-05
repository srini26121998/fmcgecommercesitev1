"use client";

// ── useDashboard Hook ────────────────────────────────────
// Manages all data fetching for the Executive Dashboard.
// Provides granular loading/error per section and aggregate states.
//
// Usage:
//   const { data, loading, error, refresh } = useDashboard();
//   const { data, loading, error } = useDashboard({ period: "7d" });

import { useState, useEffect, useCallback, useRef } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { inventoryService } from "@/services/inventory.service";
import type {
  DashboardOverview,
  DashboardQueryParams,
  RevenueKpi,
  OrdersKpi,
  CustomersKpi,
  LiveOrder,
  StockAlert,
  VendorPayment,
  TopProduct,
  AcquisitionMetric,
} from "@/types/dashboard";

// ── Per-section loading / error tracking ─────────────────

interface SectionState {
  loading: boolean;
  error: string | null;
}

interface DashboardState {
  // Data
  overview: DashboardOverview | null;
  revenue: RevenueKpi | null;
  orders: OrdersKpi | null;
  customers: CustomersKpi | null;
  liveOrders: LiveOrder[] | null;
  lowStockAlerts: StockAlert[] | null;
  vendorPayments: VendorPayment[] | null;
  topProducts: TopProduct[] | null;
  acquisitionMetrics: AcquisitionMetric[] | null;

  // Aggregate loading states
  loading: boolean;
  error: string | null;

  // Per-section granular loading
  sections: Record<string, SectionState>;

  // Timestamp of last successful fetch
  lastUpdated: string | null;
}

interface DashboardActions {
  refresh: () => Promise<void>;
  refreshSection: (section: string) => Promise<void>;
}

const initialSectionState: SectionState = { loading: false, error: null };

function createInitialState(): DashboardState {
  return {
    overview: null,
    revenue: null,
    orders: null,
    customers: null,
    liveOrders: null,
    lowStockAlerts: null,
    vendorPayments: null,
    topProducts: null,
    acquisitionMetrics: null,
    loading: true,
    error: null,
    sections: {},
    lastUpdated: null,
  };
}

export type UseDashboardReturn = DashboardState & DashboardActions;

export function useDashboard(params?: Partial<DashboardQueryParams>): UseDashboardReturn {
  const [state, setState] = useState<DashboardState>(createInitialState);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      sections: {
        ...prev.sections,
        revenue: { loading: true, error: null },
        orders: { loading: true, error: null },
        customers: { loading: true, error: null },
        liveOrders: { loading: true, error: null },
        lowStockAlerts: { loading: true, error: null },
        vendorPayments: { loading: true, error: null },
        topProducts: { loading: true, error: null },
        acquisitionMetrics: { loading: true, error: null },
      },
    }));

    try {
      const [
        overviewRes,
        invRes,
      ] = await Promise.all([
        dashboardService.getOverview(params).catch((err) => {
          console.error("Failed to fetch dashboard overview:", err);
          return { success: false, data: null, error: err?.message || "Failed to fetch dashboard overview" };
        }),
        inventoryService.getInventoryReport().catch((err) => {
          console.warn("Failed to fetch inventory report:", err);
          return { success: false, data: null };
        }),
      ]);

      if (!overviewRes.success || !overviewRes.data) {
        throw new Error(overviewRes.error || "Failed to fetch dashboard overview");
      }

      const overviewData = overviewRes.data;
      const inventoryReport = invRes.success && invRes.data ? invRes.data : null;

      const liveOrdersData = overviewData.liveOrders || [];
      const lowStockData = overviewData.lowStockAlerts || [];
      const vendorPaymentsData = overviewData.vendorPayments || overviewData.upcomingPayments || [];
      const topProductsData = overviewData.topProducts || [];
      const acquisitionData = overviewData.acquisitionMetrics || [];

      const updatedOverview: DashboardOverview = {
        ...overviewData,
        liveOrders: liveOrdersData,
        lowStockAlerts: lowStockData,
        vendorPayments: vendorPaymentsData,
        topProducts: topProductsData,
        acquisitionMetrics: acquisitionData,
        inventoryReport,
      };

      setState({
        overview: updatedOverview,
        revenue: overviewData.revenue,
        orders: overviewData.orders,
        customers: overviewData.customers,
        liveOrders: liveOrdersData,
        lowStockAlerts: lowStockData,
        vendorPayments: vendorPaymentsData,
        topProducts: topProductsData,
        acquisitionMetrics: acquisitionData,
        loading: false,
        error: null,
        sections: {},
        lastUpdated: overviewData.lastUpdated || new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        sections: {},
      }));
    }
  }, [params?.period, params?.warehouse, params?.region]);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchAll();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchAll]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Refresh a single section (for granular loading)
  const refreshSection = useCallback(
    async (section: string) => {
      setState((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: { loading: true, error: null },
        },
      }));

      try {
        let data: unknown;
        switch (section) {
          case "revenue":
            const revRes = await dashboardService.getRevenue(params);
            if (!revRes.success || !revRes.data) throw new Error(revRes.error || "Failed to fetch revenue");
            data = revRes.data;
            break;
          case "orders":
            const ordRes = await dashboardService.getOrders(params);
            if (!ordRes.success || !ordRes.data) throw new Error(ordRes.error || "Failed to fetch orders");
            data = ordRes.data;
            break;
          case "customers":
            const custRes = await dashboardService.getCustomers(params);
            if (!custRes.success || !custRes.data) throw new Error(custRes.error || "Failed to fetch customers");
            data = custRes.data;
            break;
          case "liveOrders":
            const liveRes = await dashboardService.getLiveOrders(params);
            if (!liveRes.success || !liveRes.data) throw new Error(liveRes.error || "Failed to fetch live orders");
            data = liveRes.data;
            break;
          case "lowStockAlerts":
            const lowRes = await dashboardService.getLowStockAlerts(params);
            if (!lowRes.success || !lowRes.data) throw new Error(lowRes.error || "Failed to fetch low stock alerts");
            data = lowRes.data;
            break;
          case "vendorPayments":
            const payRes = await dashboardService.getVendorPayments(params);
            if (!payRes.success || !payRes.data) throw new Error(payRes.error || "Failed to fetch vendor payments");
            data = payRes.data;
            break;
          case "topProducts":
            const topRes = await dashboardService.getTopProducts(params);
            if (!topRes.success || !topRes.data) throw new Error(topRes.error || "Failed to fetch top products");
            data = topRes.data;
            break;
          case "acquisitionMetrics":
            const acqRes = await dashboardService.getAcquisitionMetrics(params);
            if (!acqRes.success || !acqRes.data) throw new Error(acqRes.error || "Failed to fetch acquisition metrics");
            data = acqRes.data;
            break;
          default:
            throw new Error(`Unknown section: ${section}`);
        }

        setState((prev) => ({
          ...prev,
          [section]: data,
          sections: { ...prev.sections, [section]: { loading: false, error: null } },
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load section";
        setState((prev) => ({
          ...prev,
          sections: { ...prev.sections, [section]: { loading: false, error: message } },
        }));
      }
    },
    [params],
  );

  return { ...state, refresh, refreshSection };
}

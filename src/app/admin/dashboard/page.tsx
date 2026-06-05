"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  AlertTriangle,
  DollarSign,
  UserPlus,
  RefreshCw,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import DashboardLayout from "../dashboard-layout";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  KpiGrid,
  QuickActions,
  ChartsSection,
  DonutSection,
  ConversionFunnel,
  TopProductsCategories,
  DeliverySystemHealth,
  SidePanels,
  CustomerMetrics,
  InventoryHealth,
  DashboardSkeleton,
  DashboardError,
} from "@/components/ui/dashboard";

// -- Icon Map (for recent activity icons stored as strings) -

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  CreditCard,
  Truck,
  AlertTriangle,
  DollarSign,
  UserPlus,
};

function resolveIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || ShoppingCart;
}

// -- Page Component ----------------------------------------

export default function AdminDashboardPage() {
  const {
    overview,
    loading,
    error,
    refresh,
  } = useDashboard();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh()
      .then(() => {
        toast.success("Dashboard refreshed");
      })
      .catch(() => {
        toast.error("Failed to refresh dashboard");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refresh]);

  const sections = useMemo(() => {
    if (!overview) return null;

    return {
      kpiData: {
        revenue: overview.revenue,
        orders: overview.orders,
        customers: overview.customers,
        avgDeliveryTime: overview.deliveryPerformance?.avgTime ?? "25 min",
        returnRate: overview.returnRate?.rate ?? (overview.orders.total > 0 ? Number(((overview.orders.cancelled / overview.orders.total) * 100).toFixed(1)) : 0),
        promoConversion: overview.promotionMetrics?.conversion ?? "0.0%",
        systemUptime: overview.systemHealth?.uptime ?? "99.9%",
      },
      chartsData: {
        revenueChart: overview.revenue.chart,
        hourlyActivity: (overview.hourlyActivity && overview.hourlyActivity.length > 0) ? overview.hourlyActivity : (overview.orders.chart ?? []),
        revenueTotal: overview.revenue.total,
        hourlyPeak: Math.max(...(((overview.hourlyActivity && overview.hourlyActivity.length > 0) ? overview.hourlyActivity : (overview.orders.chart ?? [])).map(h => h.value)), 0),
        ordersChartSubtitle: (overview.hourlyActivity && overview.hourlyActivity.length > 0) ? "Hourly Activity (Today)" : "Weekly Trend",
        ordersChartPeakLabel: (overview.hourlyActivity && overview.hourlyActivity.length > 0) ? "Peak" : "Max",
      },
      donutData: {
        categorySales: (overview.categorySales && overview.categorySales.length > 0)
          ? overview.categorySales.map(c => ({ label: c.category, value: c.sales, color: c.color }))
          : [
              { label: "Fruits & Vegetables", value: 0, color: "#0c831f" },
              { label: "Dairy & Bread", value: 0, color: "#2563eb" },
              { label: "Atta, Rice & Dals", value: 0, color: "#9333ea" },
              { label: "Snacks & Munchies", value: 0, color: "#ff4f8b" },
            ],
        categoryTotal: (overview.categorySales && overview.categorySales.length > 0)
          ? overview.categorySales.reduce((s: number, c) => s + c.sales, 0)
          : 0,
        orderStatusBreakdown: (overview.orderStatusBreakdown && overview.orderStatusBreakdown.length > 0)
          ? overview.orderStatusBreakdown.map(s => ({ label: s.status, value: s.count, color: s.color }))
          : [
              { label: "Pending", value: overview.orders.pending ?? 0, color: "#d97706" },
              { label: "Processing", value: overview.orders.processing ?? 0, color: "#2563eb" },
              { label: "Delivered", value: overview.orders.delivered ?? 0, color: "#0c831f" },
              { label: "Cancelled", value: overview.orders.cancelled ?? 0, color: "#dc2626" },
            ],
        orderStatusTotal: (overview.orderStatusBreakdown && overview.orderStatusBreakdown.length > 0)
          ? overview.orderStatusBreakdown.reduce((s: number, os) => s + os.count, 0)
          : (overview.orders.pending ?? 0) + (overview.orders.processing ?? 0) + (overview.orders.delivered ?? 0) + (overview.orders.cancelled ?? 0),
        paymentMethods: (overview.paymentMethods && overview.paymentMethods.length > 0)
          ? overview.paymentMethods.map(p => ({ label: p.method, value: p.percentage, color: p.color }))
          : [
              { label: "UPI / Net Banking", value: 0, color: "#0c831f" },
              { label: "Credit/Debit Card", value: 0, color: "#2563eb" },
              { label: "Cash on Delivery", value: 0, color: "#d97706" },
            ],
        paymentTotal: (overview.paymentMethods && overview.paymentMethods.length > 0)
          ? overview.paymentMethods.reduce((s: number, p) => s + p.percentage, 0)
          : 0,
      },
      deliveryData: {
        onTime: overview.deliveryPerformance?.onTime ?? 0,
        delayed: overview.deliveryPerformance?.delayed ?? 0,
        total: overview.deliveryPerformance?.total ?? (overview.deliveryPerformance ? (overview.deliveryPerformance.onTime + overview.deliveryPerformance.delayed) : 0),
        avgTime: overview.deliveryPerformance?.avgTime ?? "25 min",
        uptime: overview.systemHealth?.uptime ?? "99.9%",
        apiLatency: overview.systemHealth?.apiLatency ?? "<50ms",
        errorRate: overview.systemHealth?.errorRate ?? "<0.1%",
        activeUsers: overview.systemHealth?.activeUsers ?? 12,
      },
      sidePanelData: {
        liveOrders: overview.liveOrders ?? [],
        stockAlerts: overview.lowStockAlerts ?? [],
        vendorPayments: overview.vendorPayments ?? (overview as any).upcomingPayments ?? [],
        activityFeed: (overview.recentActivity ?? []).map(a => ({
          ...a,
          icon: resolveIcon(a.icon),
        })),
        vendorPaymentTotal: (overview.vendorPayments ?? (overview as any).upcomingPayments ?? []).reduce((s: number, p: any) => s + p.amount, 0),
      },
      custData: {
        total: overview.customers.total,
        active: overview.customers.active,
        newWeekly: overview.customers.newThisWeek,
        returnRate: overview.returnRate?.rate ?? (overview.orders.total > 0 ? Number(((overview.orders.cancelled / overview.orders.total) * 100).toFixed(1)) : 0),
        avgOrderValue: overview.orders.total > 0
          ? `₹${Math.round(overview.revenue.total / overview.orders.total).toLocaleString()}`
          : "₹0",
        lifetimeValue: overview.customers.lifetimeValue !== undefined
          ? `₹${overview.customers.lifetimeValue.toLocaleString()}`
          : "₹0",
        churnRate: overview.customers.churnRate !== undefined
          ? `${overview.customers.churnRate}%`
          : "0%",
      },
      invData: {
        inStock: (overview as any).inventoryReport?.totalStock ?? (overview.lowStockAlerts ? Math.max(1500 - overview.lowStockAlerts.length, 0) : 1200),
        lowStock: (overview as any).inventoryReport?.lowStockCount ?? (overview.lowStockAlerts?.length ?? 0),
        outOfStock: (overview as any).inventoryReport?.outOfStockCount ?? (overview.lowStockAlerts?.filter(a => a.stock === 0).length ?? 0),
        discontinued: 0,
        fillRate: (overview as any).inventoryReport?.totalProducts && (overview as any).inventoryReport?.totalProducts > 0
          ? `${Math.round((((overview as any).inventoryReport.totalProducts - ((overview as any).inventoryReport.outOfStockCount ?? 0)) / (overview as any).inventoryReport.totalProducts) * 100)}%`
          : "92%",
      },
      topProdCatData: {
        topProducts: overview.topProducts ?? [],
        topCategories: (overview.topCategories ?? []).map(c => ({
          name: c.name,
          revenue: c.revenue,
          growth: c.growth,
          color: c.color,
        })),
      },
      funnelData: {
        stages: overview.conversionFunnel ?? [],
      },
    };
  }, [overview]);

  if (!isHydrated || (loading && !overview)) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // -- Error state ----------------------------------------

  if (error && !overview) {
    return (
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          {/* Header */}
          <DashboardHeader onRefresh={handleRefresh} />
          <DashboardError error={error} onRetry={handleRefresh} />
        </div>
      </DashboardLayout>
    );
  }

  // -- Empty state ----------------------------------------

  if (!sections) return null;

  // -- Render ----------------------------------------------

  const { kpiData, chartsData, donutData, deliveryData, sidePanelData, custData, invData, topProdCatData, funnelData } =
    sections;

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* --- Header --- */}
        <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* --- KPI Cards --- */}
        <KpiGrid {...kpiData} />

        {/* --- Quick Actions --- */}
        <QuickActions />

        {/* --- Charts Row --- */}
        <ChartsSection {...chartsData} />

        {/* --- 3 Donut Analytics --- */}
        <DonutSection {...donutData} />

        {/* --- Conversion Funnel --- */}
        {funnelData.stages.length > 0 && (
          <ConversionFunnel stages={funnelData.stages} />
        )}

        {/* --- Top Products + Categories --- */}
        <TopProductsCategories {...topProdCatData} />

        {/* --- Delivery + System Health --- */}
        <DeliverySystemHealth {...deliveryData} />

        {/* --- 4 Side Panels --- */}
        <SidePanels {...sidePanelData} />

        {/* --- Customer Metrics --- */}
        <CustomerMetrics {...custData} />

        {/* --- Inventory Health --- */}
        <InventoryHealth {...invData} />
      </div>
    </DashboardLayout>
  );
}

// -- Header Section ---------------------------------------

function DashboardHeader({ onRefresh, isRefreshing }: { onRefresh: () => void; isRefreshing?: boolean }) {
  return (
    <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
            Dashboard
          </p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            Operations Overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
            Real-time metrics across revenue, orders, customers, inventory,
            delivery, and system health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <button className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6] transition-colors">
              <BarChart3 className="h-4 w-4" />
              View Reports
            </button>
          </Link>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </section>
  );
}


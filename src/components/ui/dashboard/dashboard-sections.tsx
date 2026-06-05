"use client";

// ── Dashboard Section Components ─────────────────────────
// Each section is a self-contained component that receives typed data.
// Architecture: UI → Component → Hook → Service → Axios → API Gateway
// No API logic here — just presentation.

import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Truck,
  Percent,
  Gift,
  Activity,
  Package,
  AlertTriangle,
  Bell,
  UserPlus,
  Star,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CreditCard,
  Zap,
  CheckCircle,
  XCircle,
  Target,
  type LucideIcon,
} from "lucide-react";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import {
  BarChart,
  DonutChart,
  LegendRows,
  MiniProgressBar,
  SectionHeader,
  ChartCard,
  type ChartPoint,
} from "./charts";
import type {
  RevenueKpi,
  OrdersKpi,
  CustomersKpi,
  LiveOrder,
  StockAlert,
  VendorPayment,
  TopProduct,
  AcquisitionMetric,
} from "@/types/dashboard";

// ── 1. KPI Grid ───────────────────────────────────────────

interface KpiGridProps {
  revenue: RevenueKpi;
  orders: OrdersKpi;
  customers: CustomersKpi;
  avgDeliveryTime: string;
  returnRate: number;
  promoConversion: string;
  systemUptime: string;
}

export function KpiGrid({ revenue, orders, customers, avgDeliveryTime, returnRate, promoConversion, systemUptime }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-8">
      <ReusableCard
        title="Revenue (MTD)"
        value={revenue.formatted}
        icon={<DollarSign className="h-4 w-4" />}
        trend={{ value: `${revenue.growth}%`, direction: "up", label: "vs last month" }}
        color="text-[#0c831f]" bgColor="bg-[#e8f5e9]"
      />
      <ReusableCard
        title="Orders (MTD)"
        value={orders.total.toLocaleString()}
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={{ value: `${orders.growth}%`, direction: "up", label: "vs last month" }}
        color="text-[#2563eb]" bgColor="bg-[#eff6ff]"
      />
      <ReusableCard
        title="Customers"
        value={customers.total.toLocaleString()}
        icon={<Users className="h-4 w-4" />}
        trend={{ value: `${customers.growth}%`, direction: "up", label: "vs last month" }}
        color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]"
      />
      <ReusableCard
        title="Pending Orders"
        value={orders.pending}
        icon={<Clock className="h-4 w-4" />}
        trend={{ value: "Needs attention", direction: "down", label: "" }}
        color="text-[#d97706]" bgColor="bg-[#fffbeb]"
      />
      <ReusableCard
        title="Avg Delivery"
        value={avgDeliveryTime}
        icon={<Truck className="h-4 w-4" />}
        trend={{ value: "2 min faster", direction: "up", label: "vs last week" }}
        color="text-[#0c831f]" bgColor="bg-[#e8f5e9]"
      />
      <ReusableCard
        title="Return Rate"
        value={`${returnRate}%`}
        icon={<Percent className="h-4 w-4" />}
        trend={{ value: "-0.3%", direction: "down", label: "improved" }}
        color="text-[#9333ea]" bgColor="bg-[#f3e8ff]"
      />
      <ReusableCard
        title="Promo Redemption"
        value={promoConversion}
        icon={<Gift className="h-4 w-4" />}
        trend={{ value: "18.5%", direction: "up", label: "conversion" }}
        color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]"
      />
      <ReusableCard
        title="System Uptime"
        value={systemUptime}
        icon={<Activity className="h-4 w-4" />}
        trend={{ value: "99.9%+", direction: "up", label: "30-day avg" }}
        color="text-[#0c831f]" bgColor="bg-[#e8f5e9]"
      />
    </div>
  );
}

// ── 2. Quick Actions ──────────────────────────────────────

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const quickActions: QuickAction[] = [
  { icon: <ShoppingCart className="h-3.5 w-3.5" />, label: "New Order", href: "/admin/orders" },
  { icon: <Package className="h-3.5 w-3.5" />, label: "Add Product", href: "/admin/products" },
  { icon: <Users className="h-3.5 w-3.5" />, label: "View Customers", href: "/admin/customers" },
  { icon: <Bell className="h-3.5 w-3.5" />, label: "Send Notification", href: "/admin/promotions/push-notifications" },
  { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Generate Report", href: "/admin/reports" },
  { icon: <Percent className="h-3.5 w-3.5" />, label: "Create Coupon", href: "/admin/promotions/coupons" },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-[#0c831f] mr-2">Quick Actions</span>
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-semibold text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a] transition-all">
              {action.icon}
              {action.label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── 3. Charts Row (Revenue + Hourly Activity) ────────────

interface ChartsSectionProps {
  revenueChart: ChartPoint[];
  hourlyActivity: ChartPoint[];
  revenueTotal: number;
  hourlyPeak: number;
  ordersChartSubtitle?: string;
  ordersChartPeakLabel?: string;
}

export function ChartsSection({
  revenueChart,
  hourlyActivity,
  revenueTotal,
  hourlyPeak,
  ordersChartSubtitle = "Hourly Activity (Today)",
  ordersChartPeakLabel = "Peak",
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      <ChartCard>
        <SectionHeader title="Revenue" subtitle="Monthly Trend" icon={<BarChart3 className="h-4 w-4" />} />
        <BarChart
          data={revenueChart}
          color="text-[#0c831f]"
          barColor="bg-[#0c831f]/20"
          barHover="hover:bg-[#0c831f]/40"
          formatValue={(v) => `₹${(v / 100000).toFixed(1)}L`}
        />
      </ChartCard>

      <ChartCard>
        <SectionHeader
          title="Orders"
          subtitle={ordersChartSubtitle}
          color="text-[#2563eb]"
          icon={<ShoppingCart className="h-4 w-4" />}
          action={
            <span className="text-xs font-bold text-[#2563eb]">
              {ordersChartPeakLabel}: {hourlyPeak} orders
            </span>
          }
        />
        <BarChart
          data={hourlyActivity}
          color="text-[#2563eb]"
          barColor="bg-[#2563eb]/20"
          barHover="hover:bg-[#2563eb]/40"
        />
      </ChartCard>
    </div>
  );
}

// ── 4. Donut Analytics Row ────────────────────────────────

interface DonutSectionProps {
  categorySales: { label: string; value: number; color: string }[];
  categoryTotal: number;
  orderStatusBreakdown: { label: string; value: number; color: string }[];
  orderStatusTotal: number;
  paymentMethods: { label: string; value: number; color: string }[];
  paymentTotal: number;
}

export function DonutSection({ categorySales, categoryTotal, orderStatusBreakdown, orderStatusTotal, paymentMethods, paymentTotal }: DonutSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Category Sales */}
      <ChartCard>
        <SectionHeader title="Categories" subtitle="Sales Distribution" color="text-[#0c831f]" icon={<Package className="h-4 w-4 text-[#0c831f]" />} />
        <div className="flex justify-center">
          <DonutChart data={categorySales} size={140} strokeWidth={22} />
        </div>
        <LegendRows data={categorySales} total={categoryTotal} />
      </ChartCard>

      {/* Order Status */}
      <ChartCard>
        <SectionHeader title="Orders" subtitle="Status Breakdown" color="text-[#9333ea]" icon={<BarChart3 className="h-4 w-4 text-[#9333ea]" />} />
        <div className="flex justify-center">
          <DonutChart data={orderStatusBreakdown} size={140} strokeWidth={22} />
        </div>
        <LegendRows data={orderStatusBreakdown} total={orderStatusTotal} />
      </ChartCard>

      {/* Payment Methods */}
      <ChartCard>
        <SectionHeader title="Payments" subtitle="Payment Methods" color="text-[#d97706]" icon={<CreditCard className="h-4 w-4 text-[#d97706]" />} />
        <div className="flex justify-center">
          <DonutChart data={paymentMethods} size={140} strokeWidth={22} />
        </div>
        <LegendRows data={paymentMethods} total={paymentTotal} />
      </ChartCard>
    </div>
  );
}

// ── 5. Conversion Funnel ──────────────────────────────────

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
}

export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  return (
    <ChartCard>
      <SectionHeader title="Analytics" subtitle="Conversion Funnel" icon={<Target className="h-4 w-4 text-[#0c831f]" />} color="text-[#0c831f]" />
      <p className="mb-4 text-xs text-[#999]">Visitor to delivery conversion tracking</p>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const prevPct = i > 0 ? stages[i - 1].percentage : 100;
          const dropRate = prevPct - stage.percentage;
          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center gap-3">
                <div className="w-28 text-right">
                  <span className="text-xs font-bold text-[#1a1a1a]">{stage.stage}</span>
                </div>
                <div className="flex-1">
                  <div className="relative h-8 rounded-lg bg-[#f6f7f6] overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{
                        width: `${stage.percentage}%`,
                        background: `linear-gradient(90deg, #0c831f, ${i === 4 ? '#0c831f' : i === 3 ? '#16a34a' : i === 2 ? '#22c55e' : i === 1 ? '#4ade80' : '#86efac'})`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-bold text-white drop-shadow-sm">{stage.count.toLocaleString()}</span>
                    </div>
                  </div>
                  {dropRate > 0 && i > 0 && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <TrendingDown className="h-2.5 w-2.5 text-[#ff4f8b]" />
                      <span className="text-[9px] text-[#ff4f8b]">{dropRate.toFixed(1)}% drop</span>
                    </div>
                  )}
                </div>
                <div className="w-16 text-right">
                  <span className="text-xs font-bold text-[#0c831f]">{stage.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// ── 6. Top Products + Top Categories ──────────────────────

interface TopProductsCategoriesProps {
  topProducts: TopProduct[];
  topCategories: { name: string; revenue: number; growth: string; color: string }[];
}

export function TopProductsCategories({ topProducts, topCategories }: TopProductsCategoriesProps) {
  const maxRev = Math.max(...topCategories.map((c) => c.revenue));

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      {/* Top Selling Products */}
      <ChartCard>
        <SectionHeader title="Products" subtitle="Top Selling" color="text-[#0c831f]" icon={<Package className="h-4 w-4 text-[#0c831f]" />} />
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl bg-[#f9fafb] p-3 transition-all hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0c831f]/10 text-xs font-black text-[#0c831f]">
                {p.rank || i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1a1a1a]">{p.name}</p>
                <p className="text-xs text-[#999]">{p.sales.toLocaleString()} units sold</p>
              </div>
              <p className="text-sm font-black text-[#0c831f]">₹{p.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Top Categories by Revenue */}
      <ChartCard>
        <SectionHeader title="Categories" subtitle="Top by Revenue" color="text-[#0c831f]" icon={<BarChart3 className="h-4 w-4 text-[#0c831f]" />} />
        <div className="space-y-3">
          {topCategories.map((cat) => {
            const barPct = (cat.revenue / maxRev) * 100;
            return (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-28 text-right">
                  <span className="text-xs font-medium text-[#666] truncate block">{cat.name}</span>
                </div>
                <div className="flex-1 h-7 rounded-lg bg-[#f6f7f6] overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                    style={{ width: `${barPct}%`, backgroundColor: cat.color }}
                  >
                    <span className="text-[10px] font-bold text-white">₹{(cat.revenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <span className={`w-14 text-right text-[10px] font-bold ${cat.growth.startsWith("+") ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
                  {cat.growth}
                </span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

// ── 7. Delivery Performance + System Health ──────────────

interface DeliverySystemProps {
  onTime: number;
  delayed: number;
  total: number;
  avgTime: string;
  uptime: string;
  apiLatency: string;
  errorRate: string;
  activeUsers: number;
}

export function DeliverySystemHealth({ onTime, delayed, total, avgTime, uptime, apiLatency, errorRate, activeUsers }: DeliverySystemProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      {/* Delivery Performance */}
      <ChartCard>
        <SectionHeader title="Delivery" subtitle="Delivery Performance" color="text-[#0c831f]" icon={<Truck className="h-4 w-4 text-[#0c831f]" />} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#e8f5e9] p-4 text-center">
            <CheckCircle className="mx-auto h-6 w-6 text-[#0c831f]" />
            <p className="mt-1 text-xl font-black text-[#0c831f]">{total > 0 ? ((onTime / total) * 100).toFixed(1) : "0.0"}%</p>
            <p className="text-[10px] font-bold text-[#0c831f]">On Time</p>
            <p className="text-[10px] text-[#0c831f]/70">{onTime.toLocaleString()} deliveries</p>
          </div>
          <div className="rounded-xl bg-[#fef2f2] p-4 text-center">
            <XCircle className="mx-auto h-6 w-6 text-[#dc2626]" />
            <p className="mt-1 text-xl font-black text-[#dc2626]">{total > 0 ? ((delayed / total) * 100).toFixed(1) : "0.0"}%</p>
            <p className="text-[10px] font-bold text-[#dc2626]">Delayed</p>
            <p className="text-[10px] text-[#dc2626]/70">{delayed.toLocaleString()} deliveries</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f9fafb] px-4 py-2.5">
          <span className="text-xs text-[#666]">Average Delivery Time</span>
          <span className="text-sm font-black text-[#1a1a1a]">{avgTime}</span>
        </div>
      </ChartCard>

      {/* System Health */}
      <ChartCard>
        <SectionHeader title="System" subtitle="System Health" color="text-[#0c831f]" icon={<Activity className="h-4 w-4 text-[#0c831f]" />} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#0c831f] animate-pulse" />
              <span className="text-xs font-bold text-[#0c831f]">Uptime</span>
            </div>
            <p className="mt-1 text-xl font-black text-[#1a1a1a]">{uptime}</p>
            <p className="text-[10px] text-[#999]">30-day rolling</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[#2563eb]" />
              <span className="text-xs font-bold text-[#2563eb]">API Latency</span>
            </div>
            <p className="mt-1 text-xl font-black text-[#1a1a1a]">{apiLatency}</p>
            <p className="text-[10px] text-[#999]">Avg response time</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 text-[#d97706]" />
              <span className="text-xs font-bold text-[#d97706]">Error Rate</span>
            </div>
            <p className="mt-1 text-xl font-black text-[#1a1a1a]">{errorRate}</p>
            <p className="text-[10px] text-[#999]">Last 24 hours</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-[#9333ea]" />
              <span className="text-xs font-bold text-[#9333ea]">Active Admins</span>
            </div>
            <p className="mt-1 text-xl font-black text-[#1a1a1a]">{activeUsers}</p>
            <p className="text-[10px] text-[#999]">Currently online</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

// ── 8. Side Panels (4 columns) ────────────────────────────

interface SidePanelsProps {
  liveOrders: LiveOrder[];
  stockAlerts: StockAlert[];
  vendorPayments: VendorPayment[];
  activityFeed: { id: string; type: string; message: string; time: string; icon: LucideIcon }[];
  vendorPaymentTotal: number;
}

export function SidePanels({ liveOrders, stockAlerts, vendorPayments, activityFeed, vendorPaymentTotal }: SidePanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
      {/* Live Orders */}
      <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-[#2563eb]" />
            <h3 className="text-sm font-black text-[#1a1a1a]">Live Orders</h3>
            <span className="flex h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-[#2563eb] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-[#e8e8e8]">
          {liveOrders.map((order) => (
            <div key={order.id} className="flex items-center gap-3 px-5 py-3 transition-all hover:bg-[#f9fafb]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1a1a1a]">{order.id}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
                <p className="text-xs text-[#999]">{order.customer} · {order.items} items · ₹{order.total.toLocaleString()}</p>
              </div>
              <span className="text-[10px] text-[#999]">{order.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#ff4f8b]" />
            <h3 className="text-sm font-black text-[#1a1a1a]">Low Stock Alerts</h3>
          </div>
          <span className="text-xs font-bold text-[#ff4f8b]">{stockAlerts.length} items</span>
        </div>
        <div className="divide-y divide-[#e8e8e8]">
          {stockAlerts.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 transition-all hover:bg-[#f9fafb]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                item.stock === 0 ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#fffbeb] text-[#d97706]"
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{item.name}</p>
                <p className="text-xs text-[#999]">{item.warehouse} · Threshold: {item.threshold}</p>
              </div>
              <span className={`text-lg font-black ${item.stock === 0 ? "text-[#dc2626]" : "text-[#d97706]"}`}>
                {item.stock}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Payments */}
      <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#d97706]" />
            <h3 className="text-sm font-black text-[#1a1a1a]">Vendor Payments</h3>
          </div>
          <span className="text-xs font-bold text-[#d97706]">₹{vendorPaymentTotal.toLocaleString()}</span>
        </div>
        <div className="divide-y divide-[#e8e8e8]">
          {vendorPayments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-3 px-5 py-3 transition-all hover:bg-[#f9fafb]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{payment.vendor}</p>
                <p className="text-xs text-[#999]">Due {payment.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#1a1a1a]">₹{payment.amount.toLocaleString()}</p>
                <StatusBadge status={payment.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#0c831f]" />
            <h3 className="text-sm font-black text-[#1a1a1a]">Recent Activity</h3>
            <span className="flex h-2 w-2 rounded-full bg-[#0c831f] animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-[#e8e8e8] max-h-[340px] overflow-y-auto">
          {activityFeed.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-3 transition-all hover:bg-[#f9fafb]">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
                <activity.icon className="h-4 w-4 text-[#0c831f]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#1a1a1a]">{activity.message}</p>
                <p className="text-[10px] text-[#999]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 9. Customer Metrics ───────────────────────────────────

interface CustomerMetricsProps {
  total: number;
  active: number;
  newWeekly: number;
  returnRate: number;
  avgOrderValue?: string;
  lifetimeValue?: string;
  churnRate?: string;
  loyaltyMembers?: string;
}

export function CustomerMetrics({
  total,
  active,
  newWeekly,
  returnRate,
  avgOrderValue = "₹0",
  lifetimeValue = "₹0",
  churnRate = "0%",
  loyaltyMembers = "8,450",
}: CustomerMetricsProps) {
  const metrics = [
    { label: "Total Customers", value: total.toLocaleString(), icon: Users, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
    { label: "Active (30d)", value: active.toLocaleString(), icon: TrendingUp, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
    { label: "New (7d)", value: newWeekly.toLocaleString(), icon: UserPlus, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
    { label: "Avg Order Value", value: avgOrderValue, icon: ShoppingBag, color: "text-[#ff4f8b]", bg: "bg-[#fff0f6]" },
    { label: "Lifetime Value", value: lifetimeValue, icon: Star, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
    { label: "Churn Rate", value: churnRate, icon: Percent, color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
  ];

  return (
    <ChartCard>
      <SectionHeader title="Customers" subtitle="Customer Metrics" color="text-[#0c831f]" icon={<Users className="h-4 w-4 text-[#ff4f8b]" />} />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4 lg:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-3.5 w-3.5 ${metric.color}`} />
              </div>
              <span className="text-xs text-[#666]">{metric.label}</span>
            </div>
            <p className="mt-2 text-lg font-black text-[#1a1a1a]">{metric.value}</p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// ── 10. Inventory Health Summary ──────────────────────────

interface InventoryHealthProps {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  fillRate?: string;
  totalSku?: number;
}

export function InventoryHealth({ inStock, lowStock, outOfStock, discontinued, fillRate = "92%", totalSku }: InventoryHealthProps) {
  const max = totalSku || (inStock + lowStock + outOfStock + discontinued);

  return (
    <ChartCard>
      <SectionHeader title="Inventory" subtitle="Inventory Health Summary" color="text-[#0c831f]" icon={<Package className="h-4 w-4 text-[#0c831f]" />} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <MiniProgressBar label="In Stock" value={inStock} max={max} color="#0c831f" />
          <MiniProgressBar label="Low Stock" value={lowStock} max={max} color="#d97706" />
          <MiniProgressBar label="Out of Stock" value={outOfStock} max={max} color="#dc2626" />
          <MiniProgressBar label="Discontinued" value={discontinued} max={max} color="#999" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#e8f5e9] p-3 text-center">
            <p className="text-lg font-black text-[#0c831f]">{inStock.toLocaleString()}</p>
            <p className="text-[10px] text-[#0c831f]">SKUs In Stock</p>
          </div>
          <div className="rounded-xl bg-[#fffbeb] p-3 text-center">
            <p className="text-lg font-black text-[#d97706]">{lowStock.toLocaleString()}</p>
            <p className="text-[10px] text-[#d97706]">Low Stock</p>
          </div>
          <div className="rounded-xl bg-[#fef2f2] p-3 text-center">
            <p className="text-lg font-black text-[#dc2626]">{outOfStock.toLocaleString()}</p>
            <p className="text-[10px] text-[#dc2626]">Out of Stock</p>
          </div>
          <div className="rounded-xl bg-[#f3e8ff] p-3 text-center">
            <p className="text-lg font-black text-[#9333ea]">{fillRate}</p>
            <p className="text-[10px] text-[#9333ea]">Fill Rate</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

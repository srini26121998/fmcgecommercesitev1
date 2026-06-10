"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { KanbanColumn, OrderTimeline, AssignPartnerModal } from "@/components/ui/orders/admin";
import { ShoppingCart, Clock, CheckCircle, XCircle, LayoutDashboard, List, RefreshCw, Truck, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DataSourceBanner } from "@/components/ui/admin/data-source-banner";
import { AnimatedLoader } from "@/components/ui/animated-loader";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/use-orders";
import { orderService } from "@/services/orders.service";
import { productService } from "@/services/products.service";
import type { Order } from "@/types/orders";

/** Format a number as Indian Rupees without the ₹ symbol (plain number with commas) */
function formatINR(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function OrdersPage() {
  const {
    orders, loading, error, search, setSearch,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    pagination, summary, kanbanGroups,
    isMock,
    setPage, setPageSize, fetchOrders,
  } = useOrders();
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // States for Substitution flow
  const [showSubstituteModal, setShowSubstituteModal] = useState<{
    order: Order;
    item: Order["items"][0];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submittingSubstitute, setSubmittingSubstitute] = useState(false);

  // State for Bulk Actions
  const [bulkSelectIds, setBulkSelectIds] = useState<string[] | null>(null);

  // Real-time search for products during substitution
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(() => {
      setSearchLoading(true);
      productService.getProducts({ search: searchQuery }, { page: 1, pageSize: 10 })
        .then((res) => setSearchResults(res.products))
        .catch(() => toast.error("Failed to fetch products"))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleViewOrder = async (order: Order) => {
    setViewLoading(true);
    const toastId = toast.loading("Loading order details...");
    try {
      const lookupId = String(order.backendId ?? order.id);
      const detail = await orderService.getOrderById(lookupId);
      setViewOrder(detail || order);
    } catch {
      toast.error("Failed to load order details");
      setViewOrder(order);
    } finally {
      toast.dismiss(toastId);
      setViewLoading(false);
    }
  };

  const statusButtons = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <DataSourceBanner isMock={isMock} module="Orders" />

        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Order Management</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Track, manage, and fulfill orders. View order timelines, assign delivery partners, and process substitutions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <div className="flex rounded-xl border border-[#e8e8e8] bg-white p-0.5">
                <button onClick={() => setViewMode("table")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "table" ? "bg-[#0c831f] text-white" : "text-[#666] hover:text-[#1a1a1a]"}`}><List className="h-3.5 w-3.5" />Table</button>
                <button onClick={() => setViewMode("kanban")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "kanban" ? "bg-[#0c831f] text-white" : "text-[#666] hover:text-[#1a1a1a]"}`}><LayoutDashboard className="h-3.5 w-3.5" />Kanban</button>
              </div>
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
            </div>
          </div>
        </section>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Orders" value={summary.total} icon={<ShoppingCart className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Pending" value={summary.pending + summary.confirmed} icon={<Clock className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Delivered" value={summary.delivered} icon={<CheckCircle className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Revenue" value={formatINR(summary.revenue)} icon={<ShoppingCart className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        {/* Status Quick View */}
        <div className="flex flex-wrap gap-2">
          {statusButtons.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${statusFilter === s
                  ? "bg-[#0c831f] text-white"
                  : "border border-[#e8e8e8] bg-white text-[#666] hover:border-[#0c831f]/30"
                }`}
            >
              {s === "cancelled" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ({summary[s as keyof typeof summary] || 0})
            </button>
          ))}
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="rounded-xl px-3 py-2 text-xs font-bold text-[#999] hover:text-[#666]">Clear</button>
          )}
        </div>

        {/* Search */}
        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by order ID or customer name..." />

        {viewMode === "table" ? (
          <ReusableTable
            data={orders}
            keyExtractor={(o: Order) => o.id}
            isLoading={loading}
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={(o: Order) => setShowDetailModal(o)}
            enableSelection={true}
            bulkActions={[
              {
                label: "Update Status",
                icon: <Clock className="h-4 w-4" />,
                onClick: (ids) => setBulkSelectIds(ids),
                variant: "success",
              }
            ]}
            columns={[
              {
                key: "id",
                header: "Order ID",
                width: "150px",
                render: (o) => <span className="font-bold text-[#0c831f] text-xs">{(o as Order).id}</span>,
              },
              {
                key: "createdAt",
                header: "Order Date",
                width: "130px",
                sortable: true,
                hideOnMobile: true,
                render: (o) => {
                  const date = new Date((o as Order).createdAt);
                  return (
                    <div>
                      <span className="block text-xs font-bold text-[#1a1a1a]">{date.toLocaleDateString("en-IN")}</span>
                      <span className="block text-[10px] text-[#999]">{date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                },
              },
              {
                key: "customer",
                header: "Customer",
                width: "160px",
                sortable: true,
                render: (o) => {
                  const ord = o as Order;
                  return (
                    <div className="w-full max-w-[150px] whitespace-normal overflow-hidden">
                      <span className="font-bold text-[#1a1a1a] block text-xs truncate w-full">{ord.customer}</span>
                      <span className="block text-[10px] text-[#999] truncate w-full">{ord.email}</span>
                    </div>
                  );
                },
              },
              {
                key: "items",
                header: "Items",
                width: "180px",
                render: (o) => {
                  const ord = o as Order;
                  return (
                    <div className="space-y-0.5 w-full max-w-[170px] whitespace-normal overflow-hidden">
                      {ord.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="text-[10px] text-[#444] flex gap-1">
                          <span className="truncate max-w-[120px] font-medium">{item.product}</span>
                          <span className="text-[#999] shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                      {ord.items.length > 2 && (
                        <span className="text-[10px] text-[#0c831f] font-bold">+{ord.items.length - 2} more</span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "paymentMethod",
                header: "Pay Method",
                width: "100px",
                hideOnMobile: true,
                render: (o) => {
                  const method = (o as Order).paymentMethod;
                  return method ? (
                    <span className="rounded-lg bg-[#f0f9ff] px-2 py-1 text-[10px] font-bold text-[#0369a1]">{method}</span>
                  ) : <span className="text-[#bbb] text-[10px]">-</span>;
                },
              },
              {
                key: "subtotal",
                header: "Subtotal",
                width: "90px",
                align: "right",
                hideOnMobile: true,
                render: (o) => {
                  const ord = o as Order;
                  const sub = (ord as any).subtotal;
                  return <span className="text-xs text-[#555]">{sub != null ? formatINR(sub) : formatINR(ord.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>;
                },
              },
              {
                key: "discountAmount",
                header: "Discount",
                width: "80px",
                align: "right",
                hideOnMobile: true,
                render: (o) => {
                  const discount = (o as Order).discountAmount;
                  return <span className="text-xs text-[#dc2626]">{discount ? `-${formatINR(discount)}` : "-"}</span>;
                },
              },
              {
                key: "deliveryFee",
                header: "Del. Fee",
                width: "80px",
                align: "right",
                hideOnMobile: true,
                render: (o) => {
                  const fee = (o as Order).deliveryFee;
                  return <span className="text-xs text-[#555]">{fee ? formatINR(fee) : <span className="text-[#0c831f] font-bold">FREE</span>}</span>;
                },
              },
              {
                key: "taxAmount",
                header: "Tax",
                width: "80px",
                align: "right",
                hideOnMobile: true,
                render: (o) => {
                  const tax = (o as any).taxAmount;
                  return <span className="text-xs text-[#888]">{tax != null ? formatINR(tax) : "-"}</span>;
                },
              },
              {
                key: "total",
                header: "Total",
                width: "100px",
                align: "right",
                sortable: true,
                render: (o) => <span className="font-bold text-sm text-[#1a1a1a]">{formatINR((o as Order).total)}</span>,
              },
              {
                key: "deliveryAddress",
                header: "Delivery Address",
                width: "180px",
                hideOnMobile: true,
                render: (o) => {
                  const addr = (o as Order).deliveryAddress;
                  if (!addr || addr === "N/A") return <span className="text-[#bbb] text-[10px]">-</span>;
                  const parts = addr.split(",").map(p => p.trim());
                  const hasLabel = parts.length > 1 && parts[0].length < 15;
                  const label = hasLabel ? parts[0] : null;
                  const details = hasLabel ? parts.slice(1).join(", ") : addr;
                  return (
                    <div className="flex flex-col items-start gap-1 w-full max-w-[170px] whitespace-normal overflow-hidden">
                      {label && <span className="inline-flex items-center rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[9px] font-bold text-[#4b5563] uppercase tracking-wider">{label}</span>}
                      <span className="text-[10px] text-[#555] leading-snug line-clamp-2 break-words w-full" title={details}>{details}</span>
                    </div>
                  );
                },
              },
              {
                key: "timeline",
                header: "Last Event",
                width: "150px",
                hideOnMobile: true,
                render: (o) => {
                  const ord = o as Order;
                  const last = ord.timeline?.[ord.timeline.length - 1];
                  return last ? (
                    <div className="w-full max-w-[140px] whitespace-normal overflow-hidden">
                      <span className="text-[10px] font-bold text-[#555] capitalize block truncate w-full">{last.status.replace(/_/g, " ")}</span>
                      {last.note && <span className="text-[10px] text-[#999] block truncate w-full">{last.note}</span>}
                    </div>
                  ) : <span className="text-[#bbb] text-[10px]">-</span>;
                },
              },
              {
                key: "deliveryPartner",
                header: "Partner",
                width: "130px",
                hideOnMobile: true,
                render: (o) => {
                  const partner = (o as Order).deliveryPartner;
                  return partner ? (
                    <span className="font-bold text-[#0c831f] text-xs">{partner}</span>
                  ) : (
                    <span className="text-[#999] text-xs">—</span>
                  );
                },
              },
              {
                key: "status",
                header: "Status",
                width: "130px",
                render: (o) => <StatusBadge status={(o as Order).status} />,
              },
              {
                key: "paymentStatus",
                header: "Pay Status",
                width: "110px",
                hideOnMobile: true,
                render: (o) => <StatusBadge status={(o as Order).paymentStatus} />,
              },
            ]}
          />
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {["pending", "confirmed", "preparing", "out_for_delivery", "delivered"].map((status) => (
              <KanbanColumn
                key={status}
                title={status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                status={status}
                orders={kanbanGroups[status] || []}
                onOrderClick={(o) => setShowDetailModal(o)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal (row click) */}
      <ReusableModal open={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={`Order ${showDetailModal?.id}`} subtitle="Quick view" size="lg">
        {showDetailModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Customer", value: showDetailModal.customer },
                { label: "Email", value: showDetailModal.email },
                { label: "Status", value: <StatusBadge status={showDetailModal.status} /> },
                { label: "Total", value: formatINR(showDetailModal.total) },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                  <div className="mt-1 text-sm font-bold text-[#1a1a1a]">{f.value as React.ReactNode}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button onClick={() => { setShowDetailModal(null); handleViewOrder(showDetailModal); }} className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <Eye className="h-4 w-4" /> View Full Details
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* ── Full Order Detail Modal (View Icon) ── */}
      <ReusableModal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.id}`} subtitle="Complete order details" size="lg">
        {viewOrder && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewOrder.status} />
              <StatusBadge status={viewOrder.paymentStatus} />
              {viewOrder.paymentMethod && <span className="rounded-lg bg-[#f0f9ff] px-2.5 py-1 text-[10px] font-bold text-[#0369a1] border border-[#bae6fd]">{viewOrder.paymentMethod}</span>}
            </div>

            {/* Customer & Order Info */}
            <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Customer & Order Info</p>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Customer</p><p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{viewOrder.customer}</p></div>
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Email</p><p className="mt-0.5 text-sm font-bold text-[#1a1a1a] break-all">{viewOrder.email || "-"}</p></div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Phone</p><p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{viewOrder.phone || "-"}</p></div>
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Delivery Partner</p><p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{viewOrder.deliveryPartner || "Not assigned"}</p></div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Created At</p><p className="mt-0.5 text-xs font-bold text-[#555]">{new Date(viewOrder.createdAt).toLocaleString("en-IN")}</p></div>
                  <div className="px-4 py-3"><p className="text-[10px] text-[#999] font-semibold uppercase">Updated At</p><p className="mt-0.5 text-xs font-bold text-[#555]">{new Date(viewOrder.updatedAt).toLocaleString("en-IN")}</p></div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {viewOrder.deliveryAddress && viewOrder.deliveryAddress !== "N/A" && (
              <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
                <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Delivery Address</p>
                </div>
                <div className="px-4 py-3"><p className="text-sm text-[#1a1a1a] font-medium leading-relaxed">{viewOrder.deliveryAddress}</p></div>
              </div>
            )}

            {/* Items Table */}
            <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Order Items ({viewOrder.items.length})</p>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#f9fafb] text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  <span className="col-span-5">Product</span><span className="col-span-2 text-right">Qty</span><span className="col-span-2 text-right">Price</span><span className="col-span-3 text-right">Total</span>
                </div>
                {viewOrder.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#f9fafb] transition-colors">
                    <div className="col-span-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-[#1a1a1a]">{item.product}</p>
                        {["pending", "confirmed", "preparing"].includes(viewOrder.status) && (
                          <button
                            onClick={() => {
                              setShowSubstituteModal({ order: viewOrder, item });
                            }}
                            className="inline-flex items-center gap-0.5 rounded bg-[#e8f5e9] px-1.5 py-0.5 text-[9px] font-bold text-[#0c831f] hover:bg-[#c8e6c9] transition-colors shrink-0"
                            title="Replace out-of-stock item"
                          >
                            <RefreshCw className="h-2 w-2 animate-pulse" />
                            Substitute
                          </button>
                        )}
                      </div>
                      {item.productId && <p className="text-[10px] text-[#999] mt-0.5">ID: {item.productId}</p>}
                    </div>
                    <p className="col-span-2 text-right text-sm font-bold text-[#555]">{item.quantity}</p>
                    <p className="col-span-2 text-right text-sm text-[#555]">{formatINR(item.price)}</p>
                    <p className="col-span-3 text-right text-sm font-black text-[#1a1a1a]">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Pricing Breakdown</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#666]">Subtotal</span><span className="font-bold">{formatINR(viewOrder.subtotal ?? viewOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span></div>
                {(viewOrder.discountAmount ?? 0) > 0 && <div className="flex justify-between text-sm"><span className="text-[#666]">Discount</span><span className="font-bold text-[#dc2626]">-{formatINR(viewOrder.discountAmount!)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#666]">Tax</span><span className="font-bold">{formatINR(viewOrder.taxAmount ?? 0)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#666]">Delivery Fee</span><span className="font-bold">{(viewOrder.deliveryFee ?? 0) === 0 ? <span className="text-[#0c831f]">FREE</span> : formatINR(viewOrder.deliveryFee!)}</span></div>
                <div className="flex justify-between text-base border-t border-[#e8e8e8] pt-2 mt-2"><span className="font-black text-[#1a1a1a]">Total</span><span className="font-black text-[#0c831f] text-lg">{formatINR(viewOrder.total)}</span></div>
              </div>
            </div>

            {/* Cancellation Reason */}
            {viewOrder.cancellationReason && (
              <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#991b1b] mb-1">Cancellation Reason</p>
                <p className="text-sm text-[#991b1b] font-medium">{viewOrder.cancellationReason}</p>
              </div>
            )}

            {/* Timeline */}
            {viewOrder.timeline.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#666]">Order Timeline</p>
                <OrderTimeline timeline={viewOrder.timeline} currentStatus={viewOrder.status} />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button onClick={() => { setViewOrder(null); setShowAssignModal(viewOrder); }} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">
                <Truck className="h-4 w-4" /> Assign Partner
              </button>
              <button onClick={() => { setViewOrder(null); router.push(`/admin/orders/status-management?search=${viewOrder.id}`); }} className="rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">
                Update Status
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Assign Partner Modal */}
      <AssignPartnerModal
        open={!!showAssignModal}
        onClose={() => setShowAssignModal(null)}
        order={showAssignModal}
        onAssigned={fetchOrders}
      />

      {/* Substitute Modal */}
      <ReusableModal
        open={!!showSubstituteModal}
        onClose={() => {
          setShowSubstituteModal(null);
          setSearchQuery("");
          setSearchResults([]);
        }}
        title="Substitute Product in Order"
        subtitle={`Replace out-of-stock item: ${showSubstituteModal?.item.product}`}
        size="md"
      >
        {showSubstituteModal && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] p-3 text-xs text-[#d97706] font-medium">
              You are replacing <span className="font-bold">{showSubstituteModal.item.product}</span> (Qty: {showSubstituteModal.item.quantity}) in Order <span className="font-bold">{showSubstituteModal.order.id}</span>.
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Search Replacement Product</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type product name, SKU, or category..."
                className="w-full rounded-xl border border-[#e8e8e8] px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#0c831f]/50 bg-white text-[#1a1a1a]"
              />
            </div>

            {searchLoading ? (
              <div className="flex items-center justify-center py-6">
                <AnimatedLoader text="Searching products..." />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between rounded-xl border border-[#e8e8e8] p-3 hover:border-[#0c831f]/30 transition-colors bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[#f0f0f0] flex items-center justify-center text-xs font-black text-[#999]">
                          IMG
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-[#1a1a1a]">{prod.name}</p>
                        <p className="text-[10px] text-[#999]">{prod.category} | Stock: {prod.stock}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-[#1a1a1a]">₹{formatINR(prod.price)}</p>
                      <button
                        disabled={submittingSubstitute}
                        onClick={async () => {
                          setSubmittingSubstitute(true);
                          const toastId = toast.loading("Processing substitution...");
                          try {
                            const orderIdVal = showSubstituteModal.order.backendId ?? showSubstituteModal.order.id;
                            const oldProdIdVal = showSubstituteModal.item.productId;
                            const newProdIdVal = prod.id;

                            if (!oldProdIdVal || !newProdIdVal) {
                              toast.error("Invalid product identifiers");
                              return;
                            }

                            const updated = await orderService.substituteOrderItem(
                              orderIdVal,
                              oldProdIdVal,
                              newProdIdVal
                            );

                            if (updated) {
                              toast.success("Product substituted successfully!");
                              setViewOrder(updated);
                              setShowSubstituteModal(null);
                              setSearchQuery("");
                              setSearchResults([]);
                              fetchOrders();
                            } else {
                              toast.error("Failed to perform substitution");
                            }
                          } catch (err) {
                            toast.error("Substitution API call failed");
                          } finally {
                            toast.dismiss(toastId);
                            setSubmittingSubstitute(false);
                          }
                        }}
                        className="rounded-lg bg-[#0c831f] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="text-center text-xs text-[#999] py-4">No products found matching &quot;{searchQuery}&quot;</p>
            ) : null}
          </div>
        )}
      </ReusableModal>

      {/* Bulk Status Update Modal */}
      <ReusableModal
        open={!!bulkSelectIds}
        onClose={() => setBulkSelectIds(null)}
        title="Bulk Update Order Status"
        subtitle={`Updating status for ${bulkSelectIds?.length} orders`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#666]">Select the new status to apply to all selected orders:</p>
          <div className="grid grid-cols-2 gap-2">
            {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={async () => {
                  if (!bulkSelectIds) return;
                  const backendIds = bulkSelectIds
                    .map(id => {
                      const o = orders.find(ord => ord.id === id);
                      return o?.backendId ?? o?.id;
                    })
                    .filter(Boolean);
                  
                  const toastId = toast.loading(`Updating ${bulkSelectIds.length} orders...`);
                  try {
                    const success = await orderService.bulkUpdateOrderStatus(backendIds as any, status);
                    if (success) {
                      toast.success(`Successfully updated ${bulkSelectIds.length} orders to ${status}`);
                      setBulkSelectIds(null);
                      fetchOrders();
                    } else {
                      toast.error("Failed to update orders");
                    }
                  } catch (err) {
                    toast.error("Error bulk updating orders");
                  } finally {
                    toast.dismiss(toastId);
                  }
                }}
                className="rounded-xl border border-[#e8e8e8] bg-white p-3 text-xs font-bold text-[#1a1a1a] hover:border-[#0c831f] hover:bg-[#e8f5e9]/20 transition-all flex items-center justify-center capitalize"
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </ReusableModal>
    </DashboardLayout>
  );
}

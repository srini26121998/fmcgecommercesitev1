"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  Package,
  Truck,
  Search,
  ChevronRight,
  Star,
  Clock,
  RotateCcw,
  ShoppingBag,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useUserOrders } from "@/hooks/use-user-orders";
import ReturnsWorkflow from "@/components/ui/orders/returns-workflow";
import ReorderFromHistory from "@/components/ui/orders/reorder-from-history";

const FILTERS = ["All", "Delivered", "Processing", "Out for Delivery", "Cancelled"];

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Delivered:          { color: "text-[#0c831f]",  bg: "bg-[#e8f5e9]",  icon: CheckCircle },
  Processing:         { color: "text-[#e65100]",  bg: "bg-[#fff3e0]",  icon: Clock },
  "Out for Delivery": { color: "text-[#1565c0]",  bg: "bg-[#e3f2fd]",  icon: Truck },
  Cancelled:          { color: "text-[#c62828]",  bg: "bg-[#ffebee]",  icon: XCircle },
};

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [returnOrder, setReturnOrder] = useState<{
    id: string;
    items: { id: number; name: string; image: string; price: number; quantity: number }[];
  } | null>(null);
  const [reorderData, setReorderData] = useState<{
    isOpen: boolean;
    orderId: string;
    orderDate: string;
    items: { id: number; name: string; image: string; price: number; quantity: number }[];
  }>({ isOpen: false, orderId: "", orderDate: "", items: [] });
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);

  const { orders, loading, refresh } = useUserOrders();

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = (
    activeFilter === "All" ? safeOrders : safeOrders.filter((o) => {
      const status = (o?.status || "").toLowerCase();
      const filter = activeFilter.toLowerCase();
      // Map display filter to possible status strings
      if (filter === "delivered") return status === "delivered";
      if (filter === "processing") return ["processing", "pending", "confirmed", "preparing"].includes(status);
      if (filter === "out for delivery") return status === "out for delivery" || status === "out_for_delivery";
      if (filter === "cancelled") return status === "cancelled" || status === "returned";
      return o?.status === activeFilter;
    })
  ).filter((o) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const idMatch = String(o?.id || "").toLowerCase().includes(lowerQuery);
    const itemMatch = Array.isArray(o?.items) && o.items.some((i) => String(i?.name || "").toLowerCase().includes(lowerQuery));
    return idMatch || itemMatch;
  });

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setIsCancellingId(orderId);
      const { orderService } = await import("@/services/orders.service");
      const res = await orderService.cancelOrder(orderId);
      if (res.success) {
        toast.success(res.message || "Order cancelled successfully");
        refresh();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "An error occurred while cancelling");
    } finally {
      setIsCancellingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
            aria-label="Back to account"
          >
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Your Orders</h1>
            {safeOrders.length > 0 && (
              <p className="text-xs text-[#999]">{safeOrders.length} order{safeOrders.length !== 1 ? "s" : ""} found</p>
            )}
          </div>
          {showSearch ? (
            <input
              autoFocus
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              className="h-9 px-3 rounded-full bg-[#f2f2f2] text-sm outline-none border border-transparent focus:border-[#ff4f8b] w-[160px] transition-all"
            />
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => refresh()}
                className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
                aria-label="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 text-[#666] ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
                aria-label="Search orders"
              >
                <Search className="w-4 h-4 text-[#666]" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5">
        {/* ── Filter Chips ── */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 hide-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-[#ff4f8b] text-white shadow-sm shadow-[#ff4f8b]/20"
                  : "bg-white border border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton while fetching from API ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden animate-pulse">
                <div className="h-10 bg-[#f2f2f2]" />
                <div className="px-5 py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#f2f2f2] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#f2f2f2] rounded-full w-1/3" />
                    <div className="h-3 bg-[#f2f2f2] rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const safeItems = Array.isArray(order?.items) ? order.items : [];
              const itemCount = safeItems.reduce((sum, i) => sum + (i?.quantity || 0), 0);
              const sc = STATUS_CONFIG[order?.status] ?? { color: "text-[#666]", bg: "bg-[#f2f2f2]", icon: Package };
              const StatusIcon = sc.icon;
              const completedSteps = Array.isArray(order?.trackingSteps) ? order.trackingSteps.filter((s) => s?.completed).length : 0;
              const totalSteps = Array.isArray(order?.trackingSteps) ? order.trackingSteps.length : 6;
              const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* ── Top status bar ── */}
                  <div className={`flex items-center justify-between px-5 py-2.5 ${sc.bg}`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-3.5 h-3.5 ${sc.color}`} />
                      <span className={`text-xs font-black ${sc.color}`}>{order.status}</span>
                    </div>
                    <span className="text-[10px] text-[#999] font-medium">{order.date}</span>
                  </div>

                  {/* ── Main clickable body → goes to detail page ── */}
                  <Link href={`/account/orders/${encodeURIComponent(order.id)}`}>
                    <div className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafafa] transition-colors">
                      {/* First item thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-[#f9f9f9] border border-[#efefef] overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={safeItems[0]?.image || "https://placehold.co/100x100?text=No+Image"}
                          alt={safeItems[0]?.name || "Product image"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-[#1a1a1a]">{order?.id}</span>
                          <span className="text-sm font-black text-[#1a1a1a] flex-shrink-0">
                            ₹{(order?.total || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-xs text-[#666] mt-0.5 truncate">
                          {safeItems[0]?.name || "Unknown Item"}
                          {safeItems.length > 1 ? ` +${safeItems.length - 1} more` : ""}
                        </p>
                        <p className="text-[10px] text-[#999] mt-0.5">
                          {itemCount} item{itemCount !== 1 ? "s" : ""} · {order?.deliverySlot || "Standard Delivery"}
                        </p>

                        {/* Inline progress bar for active orders */}
                        {(order.status === "Processing" || order.status === "Out for Delivery") && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0c831f] rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-[#0c831f] font-medium mt-0.5">
                              {progressPct}% complete
                            </p>
                          </div>
                        )}

                        {order.status === "Delivered" && (
                          <p className="text-[10px] text-[#0c831f] font-medium mt-1">
                            ✓ Delivered on {order.deliveryDate}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#ccc] flex-shrink-0 group-hover:text-[#ff4f8b] transition-colors" />
                    </div>
                  </Link>

                  {/* ── Quick Action Buttons ── */}
                  <div className="flex items-center gap-2 px-4 pb-3">
                    {order.status === "Delivered" && (
                      <>
                        <button
                          onClick={() =>
                            setReturnOrder({
                              id: order.id,
                              items: safeItems.map((i) => ({
                                id: Number(i.id),
                                name: i.name,
                                image: i.image,
                                price: i.price,
                                quantity: i.quantity,
                              })),
                            })
                          }
                          className="flex-1 h-9 rounded-xl bg-[#fff0f6] text-[#ff4f8b] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#ffe0eb] transition-colors border border-[#ff4f8b]/10"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Return
                        </button>
                        <button
                          onClick={() =>
                            setReorderData({
                              isOpen: true,
                              orderId: order.id,
                              orderDate: order.date,
                              items: safeItems.map((i) => ({
                                id: Number(i.id),
                                name: i.name,
                                image: i.image,
                                price: i.price,
                                quantity: i.quantity,
                              })),
                            })
                          }
                          className="flex-1 h-9 rounded-xl bg-[#1a1a1a] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black/80 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Reorder
                        </button>
                        <Link
                          href={`/account/orders/${encodeURIComponent(order.id)}`}
                          className="h-9 px-4 rounded-xl border border-[#e8e8e8] text-xs font-bold text-[#666] flex items-center gap-1 hover:bg-[#fafafa] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </>
                    )}

                    {(order.status === "Processing" || order.status === "Out for Delivery" || order.status === "pending") && (
                      <>
                        {(order.status === "Processing" || order.status === "pending") && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancellingId === order.id}
                            className="flex-1 h-9 rounded-xl bg-white text-[#c62828] border border-[#c62828]/20 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#ffebee] transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isCancellingId === order.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                        <Link
                          href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
                          className="flex-1 h-9 rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#ff4f8b]/20 hover:shadow-md transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Track Order
                        </Link>
                        <Link
                          href={`/account/orders/${encodeURIComponent(order.id)}`}
                          className="h-9 px-4 rounded-xl border border-[#e8e8e8] text-xs font-bold text-[#666] flex items-center gap-1 hover:bg-[#fafafa] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </>
                    )}

                    {order.status === "Cancelled" && (
                      <>
                        <button
                          onClick={() =>
                            setReorderData({
                              isOpen: true,
                              orderId: order.id,
                              orderDate: order.date,
                              items: safeItems.map((i) => ({
                                id: Number(i.id),
                                name: i.name,
                                image: i.image,
                                price: i.price,
                                quantity: i.quantity,
                              })),
                            })
                          }
                          className="flex-1 h-9 rounded-xl bg-[#fff0f6] text-[#ff4f8b] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#ffe0eb] transition-colors border border-[#ff4f8b]/10"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Reorder
                        </button>
                        <Link
                          href={`/account/orders/${encodeURIComponent(order.id)}`}
                          className="h-9 px-4 rounded-xl border border-[#e8e8e8] text-xs font-bold text-[#666] flex items-center gap-1 hover:bg-[#fafafa] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#ccc]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
              {searchQuery ? "No results found" : `No ${activeFilter === "All" ? "" : activeFilter.toLowerCase() + " "}orders`}
            </h3>
            <p className="text-sm text-[#666] mb-6">
              {searchQuery
                ? `No orders match "${searchQuery}"`
                : "Looks like you haven't placed any orders yet"}
            </p>
            <Link
              href="/"
              className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors shadow-md shadow-[#ff4f8b]/20"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {returnOrder && (
        <ReturnsWorkflow
          isOpen={true}
          onClose={() => setReturnOrder(null)}
          orderId={returnOrder.id}
          items={returnOrder.items}
          onSubmitReturn={() => setReturnOrder(null)}
        />
      )}

      <ReorderFromHistory
        isOpen={reorderData.isOpen}
        onClose={() => setReorderData((prev) => ({ ...prev, isOpen: false }))}
        orderId={reorderData.orderId}
        orderDate={reorderData.orderDate}
        items={reorderData.items}
      />
    </main>
  );
}

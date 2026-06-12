"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronLeft,
  Package,
  Truck,
  Search,
  ChevronRight,
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
import { SafeProductImage } from "@/components/ui/safe-image";

const FILTERS = ["All", "Delivered", "Processing", "Out for Delivery", "Cancelled"];

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: React.ElementType; border: string; gradient: string }
> = {
  Delivered: { color: "text-emerald-700", bg: "bg-emerald-50/50", border: "border-emerald-100", icon: CheckCircle, gradient: "from-emerald-500 to-emerald-400" },
  Processing: { color: "text-amber-700", bg: "bg-amber-50/50", border: "border-amber-100", icon: Clock, gradient: "from-amber-500 to-amber-400" },
  "Out for Delivery": { color: "text-indigo-700", bg: "bg-indigo-50/50", border: "border-indigo-100", icon: Truck, gradient: "from-indigo-500 to-indigo-400" },
  Cancelled: { color: "text-rose-700", bg: "bg-rose-50/50", border: "border-rose-100", icon: XCircle, gradient: "from-rose-500 to-rose-400" },
};

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = (
    activeFilter === "All" ? safeOrders : safeOrders.filter((o) => {
      const status = (o?.status || "").toLowerCase();
      const filter = activeFilter.toLowerCase();
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      {/* ── Sticky Header ── */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm transition-all">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Back to account"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Your Orders</h1>
            {safeOrders.length > 0 && (
              <p className="text-[11px] font-medium text-slate-500">{safeOrders.length} order{safeOrders.length !== 1 ? "s" : ""} found</p>
            )}
          </div>
          {showSearch ? (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              autoFocus
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              className="h-9 px-4 rounded-full bg-slate-100 text-sm outline-none border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-slate-800 font-medium"
            />
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => refresh()}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 hover:border-slate-200 transition-colors"
                aria-label="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin text-indigo-500" : ""}`} />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 hover:border-slate-200 transition-colors"
                aria-label="Search orders"
              >
                <Search className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* ── Filter Chips ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all duration-200 ${activeFilter === filter
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
                <div className="h-11 bg-slate-50" />
                <div className="px-5 py-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/4 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => {
                const safeItems = Array.isArray(order?.items) ? order.items : [];
                const itemCount = safeItems.reduce((sum, i) => sum + (i?.quantity || 0), 0);
                const sc = STATUS_CONFIG[order?.status] ?? { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", icon: Package, gradient: "from-slate-400 to-slate-300" };
                const StatusIcon = sc.icon;
                const completedSteps = Array.isArray(order?.trackingSteps) ? order.trackingSteps.filter((s) => s?.completed).length : 0;
                const totalSteps = Array.isArray(order?.trackingSteps) ? order.trackingSteps.length : 6;
                const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <motion.div
                    variants={itemVariants}
                    key={order.id}
                    layout
                    className={`bg-white rounded-2xl shadow-sm border ${sc.border} overflow-hidden hover:shadow-md transition-shadow group relative`}
                  >
                    {/* Status Top Bar */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${sc.border} ${sc.bg}`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${sc.color}`} />
                        <span className={`text-[13px] font-bold ${sc.color} tracking-tight`}>{order.status}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{order.date}</span>
                    </div>

                    {/* Main Clickable Area */}
                    <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className="block">
                      <div className="px-5 py-5 flex items-center gap-5 hover:bg-slate-50/50 transition-colors">
                        {/* Image */}
                        <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                          <SafeProductImage
                            src={safeItems[0]?.image}
                            alt={safeItems[0]?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900 truncate">ID: {order?.id}</span>
                            <span className="text-sm font-black text-slate-900 flex-shrink-0">
                              ₹{(order?.total || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-slate-600 line-clamp-1 mb-1">
                            {safeItems[0]?.name || "Unknown Item"}
                            {safeItems.length > 1 && <span className="text-indigo-500 font-bold ml-1">+{safeItems.length - 1} more</span>}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                            <Package className="w-3 h-3" />
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                            {order?.deliverySlot || "Standard Delivery"}
                          </p>

                          {/* Progress Bar */}
                          {(order.status === "Processing" || order.status === "Out for Delivery") && (
                            <div className="mt-3">
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPct}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full bg-gradient-to-r ${sc.gradient}`}
                                />
                              </div>
                              <p className={`text-[11px] font-bold mt-1.5 ${sc.color}`}>
                                {progressPct}% Complete
                              </p>
                            </div>
                          )}

                          {order.status === "Delivered" && (
                            <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Delivered on {order.deliveryDate}
                            </p>
                          )}
                        </div>

                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-3 px-5 pb-4">
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
                            className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-700 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
                          >
                            <RotateCcw className="w-4 h-4" />
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
                            className="flex-1 h-10 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Reorder
                          </button>
                        </>
                      )}

                      {(order.status === "Processing" || order.status === "Out for Delivery" || order.status === "pending") && (
                        <>
                          {(order.status === "Processing" || order.status === "pending") && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={isCancellingId === order.id}
                              className="flex-1 h-10 rounded-xl bg-white text-rose-600 border border-rose-200 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              {isCancellingId === order.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                          <Link
                            href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
                            className="flex-1 h-10 rounded-xl bg-indigo-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                            Track Order
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
                            className="flex-1 h-10 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Reorder
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner border border-slate-200">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
              {searchQuery ? "No results found" : `No ${activeFilter === "All" ? "" : activeFilter.toLowerCase() + " "}orders`}
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs leading-relaxed">
              {searchQuery
                ? `We couldn't find any orders matching "${searchQuery}". Please try a different search term.`
                : "Looks like you haven't placed any orders yet. Start shopping to see them here!"}
            </p>
            <Link
              href="/"
              className="h-12 px-8 rounded-xl bg-indigo-600 text-white text-[15px] font-bold inline-flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
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

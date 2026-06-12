"use client";
import React, { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { notFound, useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  RotateCcw,
  Star,
  Copy,
  Calendar,
  ShieldCheck,
  Zap,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import ReturnsWorkflow from "@/components/ui/orders/returns-workflow";
import ReorderFromHistory from "@/components/ui/orders/reorder-from-history";
import { useUserOrderDetails } from "@/hooks/use-user-orders";
import { orderService } from "@/services/orders.service";
import ScratchCardModal from "@/components/ui/scratch-card/scratch-card-modal";
import { useScratchCardStore } from "@/store/scratch-card-store";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string; gradient: string, dot: string }> = {
  Delivered: { color: "text-[#0c831f]", bg: "bg-[#e8f5e9]", border: "border-[#0c831f]/20", icon: CheckCircle, label: "Delivered", gradient: "from-[#e8f5e9] via-[#c8e6c9]/50 to-[#e8f5e9]", dot: "bg-[#0c831f]" },
  Processing: { color: "text-[#e65100]", bg: "bg-[#fff3e0]", border: "border-[#e65100]/20", icon: Clock, label: "Processing", gradient: "from-[#fff3e0] via-[#ffe0b2]/50 to-[#fff3e0]", dot: "bg-[#e65100]" },
  "Out for Delivery": { color: "text-[#1565c0]", bg: "bg-[#e3f2fd]", border: "border-[#1565c0]/20", icon: Truck, label: "Out for Delivery", gradient: "from-[#e3f2fd] via-[#bbdefb]/50 to-[#e3f2fd]", dot: "bg-[#1565c0]" },
  Cancelled: { color: "text-[#c62828]", bg: "bg-[#ffebee]", border: "border-[#c62828]/20", icon: XCircle, label: "Cancelled", gradient: "from-[#ffebee] via-[#ffcdd2]/50 to-[#ffebee]", dot: "bg-[#c62828]" },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { order, loading, refresh } = useUserOrderDetails(decodedId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isNewOrder = searchParams.get("new_order") === "true";

  const scratchCard = useScratchCardStore((state) => 
    order ? state.getCardByOrderId(order.id) : undefined
  );

  const [showScratchCard, setShowScratchCard] = useState(false);

  useEffect(() => {
    if (order && scratchCard && !scratchCard.isScratched) {
      // If we have an unscratched card for this order, show the modal.
      setShowScratchCard(true);
    } else if (order && isNewOrder) {
      // If new_order is true but no card exists (fallback), show modal anyway
      setShowScratchCard(true);
    }
    
    if (isNewOrder) {
      router.replace(pathname, { scroll: false });
    }
  }, [isNewOrder, pathname, router, order, scratchCard]);

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
  const [isCancelling, setIsCancelling] = useState(false);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#ff4f8b]/30 border-t-[#ff4f8b] rounded-full" 
        />
      </main>
    );
  }

  if (!order) return notFound();

  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["Processing"];
  const StatusIcon = sc.icon;
  const safeItems = Array.isArray(order.items) ? order.items : [];
  const itemCount = safeItems.reduce((s, i) => s + (i.quantity || 0), 0);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied to clipboard!");
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setIsCancelling(true);
      const res = await orderService.cancelOrder(order.id);
      if (res.success) {
        toast.success(res.message || "Order cancelled successfully");
        refresh();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "An error occurred while cancelling");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] pb-28 font-sans selection:bg-[#ff4f8b]/20">
      {/* ── Sticky Glassmorphism Header ── */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/[0.05] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/[0.08] text-black hover:bg-black/[0.02] transition-colors active:scale-95"
              aria-label="Back to orders"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[17px] font-black text-[#1a1a1a] tracking-tight leading-none mb-1">Order Details</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#666] uppercase tracking-wider">ID: {order.id}</span>
                <button onClick={copyOrderId} className="text-[#999] hover:text-[#ff4f8b] transition-colors p-1 rounded-md hover:bg-[#ff4f8b]/10 active:scale-95">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          {(order.status === "Processing" || order.status === "Out for Delivery") && (
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-gray-900 to-black text-white text-sm font-bold hover:shadow-lg hover:shadow-black/20 transition-all active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Track</span>
            </Link>
          )}
        </div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-[900px] mx-auto px-4 py-6 space-y-6"
      >

        {/* ── Dynamic Status Hero Card ── */}
        <motion.div variants={fadeUp} className={`relative overflow-hidden rounded-[2rem] border ${sc.border} bg-gradient-to-br ${sc.gradient} p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
          {/* Animated Background Elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl ${sc.bg}`}
          />
          <div className="absolute right-4 bottom-4 opacity-[0.03] pointer-events-none rotate-[-15deg] scale-150">
            <StatusIcon className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-[1.25rem] bg-white shadow-sm border border-white/50 flex items-center justify-center flex-shrink-0"
            >
              <StatusIcon className={`w-8 h-8 ${sc.color}`} />
            </motion.div>
            <div className="flex-1">
              <motion.h2 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-black tracking-tight ${sc.color}`}
              >
                {sc.label}
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-1.5 space-y-1"
              >
                <p className="text-sm font-bold text-black/70">
                  {order.deliverySlot || "Standard Delivery"}
                </p>
                <p className="text-xs font-semibold text-black/50 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {order.status === "Delivered"
                    ? `Delivered on ${order.deliveryDate || order.date}`
                    : order.deliveryDate ? `Expected by ${order.deliveryDate}` : "Delivery date pending"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Animated Mini Tracking Bar */}
          {order.trackingSteps && order.trackingSteps.length > 0 && order.status !== "Cancelled" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-black/[0.08] relative z-10"
            >
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-2 right-2 top-2 h-1.5 bg-white/60 rounded-full -z-10 shadow-inner" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(order.trackingSteps!.filter((s: any) => s.completed).length - 1) / Math.max(1, order.trackingSteps!.length - 1) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  className={`absolute left-2 top-2 h-1.5 ${sc.dot} rounded-full -z-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                />
                
                {order.trackingSteps.map((step: any, idx: number) => {
                  const isCurrent = step.completed && (idx === order.trackingSteps!.length - 1 || !order.trackingSteps![idx + 1]?.completed);
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        {isCurrent && (
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className={`absolute inset-0 rounded-full ${sc.dot} opacity-40`}
                          />
                        )}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                          className={`w-5 h-5 rounded-full border-[3px] border-white shadow-sm flex-shrink-0 relative z-10 transition-colors duration-500 ${
                            step.completed ? sc.dot : "bg-white"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-black/40">Placed</span>
                <span className="text-[10px] uppercase tracking-widest font-black text-black/40">Delivered</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Dynamic Cashback Banner ── */}
        <AnimatePresence>
          {(order as any).cashback && (order as any).cashback > 0 && order.status !== "Cancelled" && (
            <motion.div 
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] rounded-[1.5rem] p-5 shadow-[0_8px_20px_-6px_rgba(251,191,36,0.5)]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-inner"
                  >
                    <Zap className="w-6 h-6 text-white drop-shadow-md" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-black text-white tracking-tight drop-shadow-sm">₹{(order as any).cashback} Cashback Earned!</p>
                    <p className="text-xs font-semibold text-white/90 mt-0.5">
                      Credited to your wallet upon successful delivery.
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/wallet"
                  className="px-6 py-3 bg-white text-amber-600 rounded-xl text-sm font-black hover:bg-amber-50 transition-colors shadow-md flex items-center justify-center gap-2 group"
                >
                  View Wallet
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Order Items Professional List ── */}
        <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04] bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
              </div>
              <h2 className="text-base font-black text-[#1a1a1a] tracking-tight">Order Items</h2>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
              <span className="text-xs font-black text-gray-700">{itemCount} Items</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {safeItems.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                key={item.id} 
                className="flex gap-4 px-6 py-5 group hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 p-1.5 flex-shrink-0 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "https://placehold.co/200x200?text=No+Image"}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{item.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-black px-2.5 py-1 rounded-md">Qty: {item.quantity}</span>
                    <span className="text-xs font-bold text-gray-500">₹{item.price.toLocaleString("en-IN")} / unit</span>
                  </div>
                </div>
                <div className="text-right py-1 flex flex-col justify-end">
                  <span className="text-base font-black text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bill summary */}
          <div className="px-6 py-6 bg-gray-50/80 border-t border-gray-100">
            <div className="max-w-xs ml-auto space-y-3.5">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Item Total</span>
                <span className="text-gray-900">₹{(order.subtotal || safeItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)).toLocaleString("en-IN")}</span>
              </div>
              {(order.taxAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Taxes</span>
                  <span className="text-gray-900">₹{order.taxAmount?.toLocaleString("en-IN")}</span>
                </div>
              )}
              {(order.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-gray-900">₹{order.deliveryFee?.toLocaleString("en-IN")}</span>
                </div>
              )}
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Discount</span>
                  <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200 mt-2">
                <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Grand Total</span>
                <span className="text-2xl font-black text-[#ff4f8b] leading-none">₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Info Grid (Address & Payment) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Address */}
          <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-base font-black text-gray-900">Delivery Info</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-gray-900">{order.deliveryAddress?.name || "Customer Name"}</p>
              <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-[90%]">
                {order.deliveryAddress?.address || "Address not provided"}, {order.deliveryAddress?.city || "City"} — {order.deliveryAddress?.pincode || "000000"}
              </p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs font-bold text-gray-700">{order.deliveryAddress?.phone || "N/A"}</p>
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-base font-black text-gray-900">Payment Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Method</p>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5 capitalize">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {order.paymentMethod || "Unknown"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Order Date</p>
                <p className="text-sm font-bold text-gray-900">{order.date || "N/A"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Partner</p>
                <p className="text-sm font-bold text-gray-900 truncate">{order.deliveryPartner || "Assigning..."}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">Est. Time</p>
                <p className="text-sm font-bold text-gray-900">{order.estimatedTime || "N/A"}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Actions Matrix ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 pb-10">
          {order.status === "Delivered" && (
            <>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
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
                className="h-14 rounded-2xl bg-white border border-gray-200 text-gray-900 text-sm font-black flex items-center justify-center gap-2.5 hover:border-gray-900 hover:shadow-md transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Return Items
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.info("Review system coming soon!")}
                className="h-14 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-sm font-black flex items-center justify-center gap-2.5 hover:shadow-md transition-all border border-amber-200/50"
              >
                <Star className="w-4 h-4 fill-current" />
                Rate &amp; Review
              </motion.button>
            </>
          )}
          {(order.status === "Processing" || order.status === "pending") && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="sm:col-span-2 h-14 rounded-2xl bg-rose-50 text-rose-600 text-sm font-black flex items-center justify-center gap-2.5 hover:bg-rose-100 border border-rose-100 transition-all disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4" />
              {isCancelling ? "Cancelling Order..." : "Cancel Order"}
            </motion.button>
          )}
          {(order.status === "Processing" || order.status === "Out for Delivery") && (
            <motion.div className="sm:col-span-2" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
                className="h-14 rounded-2xl bg-gradient-to-r from-[#ff4f8b] to-[#ff7eb3] text-white text-base font-black flex items-center justify-center gap-2.5 shadow-lg shadow-[#ff4f8b]/25 hover:shadow-xl hover:shadow-[#ff4f8b]/40 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-out] pointer-events-none" />
                <Truck className="w-5 h-5 animate-bounce-horizontal" />
                Track Live Order
              </Link>
            </motion.div>
          )}
          {(order.status === "Cancelled" || order.status === "Delivered") && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
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
              className="sm:col-span-2 h-14 rounded-2xl bg-gray-900 text-white text-base font-black flex items-center justify-center gap-2.5 hover:bg-black transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              Reorder Items
            </motion.button>
          )}
        </motion.div>

      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {returnOrder && (
          <ReturnsWorkflow
            isOpen={true}
            onClose={() => setReturnOrder(null)}
            orderId={returnOrder.id}
            items={returnOrder.items}
            onSubmitReturn={() => setReturnOrder(null)}
          />
        )}
      </AnimatePresence>
      <ReorderFromHistory
        isOpen={reorderData.isOpen}
        onClose={() => setReorderData((prev) => ({ ...prev, isOpen: false }))}
        orderId={reorderData.orderId}
        orderDate={reorderData.orderDate}
        items={reorderData.items}
      />
      <ScratchCardModal
        isOpen={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        orderId={order.id}
      />
      <style jsx global>{`
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

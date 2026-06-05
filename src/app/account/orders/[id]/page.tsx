"use client";
import React, { useState } from "react";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  ExternalLink,
} from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import { toast } from "sonner";
import ReturnsWorkflow from "@/components/ui/orders/returns-workflow";
import ReorderFromHistory from "@/components/ui/orders/reorder-from-history";

import { useUserOrderDetails } from "@/hooks/use-user-orders";
import { orderService } from "@/services/orders.service";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  Delivered:        { color: "text-[#0c831f]",  bg: "bg-[#e8f5e9]", border: "border-[#0c831f]/20", icon: CheckCircle, label: "Delivered" },
  Processing:       { color: "text-[#e65100]",  bg: "bg-[#fff3e0]", border: "border-[#e65100]/20", icon: Clock,        label: "Processing" },
  "Out for Delivery":{ color: "text-[#1565c0]", bg: "bg-[#e3f2fd]", border: "border-[#1565c0]/20", icon: Truck,        label: "Out for Delivery" },
  Cancelled:        { color: "text-[#c62828]",  bg: "bg-[#ffebee]", border: "border-[#c62828]/20", icon: XCircle,      label: "Cancelled" },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { order, loading, refresh } = useUserOrderDetails(decodedId);

  // ── Modal state ──
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
      <main className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#ff4f8b] border-t-transparent rounded-full" />
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
    toast.success("Order ID copied!");
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
    <main className="min-h-screen bg-[#f2f2f2] pb-28">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link
            href="/account/orders"
            className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors"
            aria-label="Back to orders"
          >
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#1a1a1a]">Order Details</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#666]">{order.id}</span>
              <button onClick={copyOrderId} className="text-[#999] hover:text-[#ff4f8b] transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          {(order.status === "Processing" || order.status === "Out for Delivery") && (
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
              className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#fff3e0] text-[#e65100] text-xs font-bold hover:bg-[#ffe0b2] transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              Track
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5 space-y-4">

        {/* ── Status Hero Card ── */}
        <div className={`rounded-2xl border ${sc.border} ${sc.bg} p-5`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm flex-shrink-0">
              <StatusIcon className={`w-7 h-7 ${sc.color}`} />
            </div>
            <div className="flex-1">
              <p className={`text-lg font-black ${sc.color}`}>{sc.label}</p>
              <p className="text-sm text-[#555] mt-0.5">{order.deliverySlot}</p>
              <p className="text-xs text-[#777] mt-1">
                {order.status === "Delivered"
                  ? `Delivered on ${order.deliveryDate}`
                  : order.deliveryDate ? `Expected by ${order.deliveryDate}` : "Delivery date pending"}
              </p>
            </div>
          </div>

          {/* Mini Tracking Bar */}
          {order.trackingSteps && order.trackingSteps.length > 0 && order.status !== "Cancelled" && (
            <div className="mt-4 pt-4 border-t border-white/50">
              <div className="flex items-center gap-1">
                {order.trackingSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 border-2 border-white ${
                        step.completed ? "bg-[#0c831f]" : "bg-[#e0e0e0]"
                      }`}
                    />
                    {idx < (order.trackingSteps?.length ?? 0) - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          step.completed && order.trackingSteps?.[idx + 1]?.completed
                            ? "bg-[#0c831f]"
                            : "bg-[#e0e0e0]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#777] font-medium">Placed</span>
                <span className="text-[10px] text-[#777] font-medium">Delivered</span>
              </div>
            </div>
          )}

          {(order.status === "Processing" || order.status === "Out for Delivery") && (
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
              className="mt-4 flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-white/80 text-[#e65100] text-xs font-bold border border-[#e65100]/20 hover:bg-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Tracking
            </Link>
          )}
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e8e8e8]">
            <ShoppingBag className="w-4 h-4 text-[#ff4f8b]" />
            <h2 className="text-sm font-black text-[#1a1a1a]">
              Items Ordered <span className="text-[#999] font-normal">({itemCount})</span>
            </h2>
          </div>
          <div className="divide-y divide-[#f5f5f5]">
            {safeItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-14 rounded-xl bg-[#f9f9f9] border border-[#efefef] overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "https://placehold.co/100x100?text=No+Image"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{item.name}</p>
                  <p className="text-xs text-[#999] mt-0.5">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#1a1a1a] flex-shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          {/* Bill summary */}
          <div className="px-5 py-4 bg-[#fafafa] border-t border-[#e8e8e8] space-y-2">
            <div className="flex justify-between text-xs text-[#666]">
              <span>Item Total</span>
              <span>₹{(order.subtotal || safeItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0)).toLocaleString("en-IN")}</span>
            </div>
            {(order.taxAmount ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-[#666]">
                <span>Taxes</span>
                <span>₹{order.taxAmount?.toLocaleString("en-IN")}</span>
              </div>
            )}
            {(order.deliveryFee ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-[#666]">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee?.toLocaleString("en-IN")}</span>
              </div>
            )}
            {(order.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-[#0c831f]">
                <span>Discount</span>
                <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-[#1a1a1a] pt-2 border-t border-[#e8e8e8]">
              <span>Total Paid</span>
              <span>₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery Address ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e8e8e8]">
            <MapPin className="w-4 h-4 text-[#ff4f8b]" />
            <h2 className="text-sm font-black text-[#1a1a1a]">Delivery Address</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm font-bold text-[#1a1a1a]">{order.deliveryAddress.name}</p>
            <p className="text-xs text-[#666] mt-1 leading-relaxed">
              {order.deliveryAddress.address}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
            </p>
            <p className="text-xs text-[#999] mt-1">{order.deliveryAddress.phone}</p>
          </div>
        </div>

        {/* ── Payment & Delivery Info ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e8e8e8]">
            <CreditCard className="w-4 h-4 text-[#ff4f8b]" />
            <h2 className="text-sm font-black text-[#1a1a1a]">Payment & Delivery</h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide">Payment Method</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-1">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide">Order Date</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-1">{order.date}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide">Delivery Partner</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-1">{order.deliveryPartner}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide">Estimated Time</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-1">{order.estimatedTime}</p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3">
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
                className="h-12 rounded-xl bg-[#fff0f6] text-[#ff4f8b] text-sm font-bold flex items-center justify-center gap-2 border border-[#ff4f8b]/20 hover:bg-[#ffe0eb] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Return
              </button>
              <button
                onClick={() => toast.info("Review system coming soon!")}
                className="h-12 rounded-xl bg-[#e8f5e9] text-[#0c831f] text-sm font-bold flex items-center justify-center gap-2 border border-[#0c831f]/20 hover:bg-[#d0ebd4] transition-colors"
              >
                <Star className="w-4 h-4" />
                Rate &amp; Review
              </button>
            </>
          )}
          {(order.status === "Processing" || order.status === "pending") && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="col-span-2 h-12 rounded-xl bg-white border border-[#c62828] text-[#c62828] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#ffebee] transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
          {(order.status === "Processing" || order.status === "Out for Delivery") && (
            <Link
              href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
              className="col-span-2 h-12 rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#ff4f8b]/20 hover:shadow-lg transition-all"
            >
              <Truck className="w-4 h-4" />
              Track Live Order
            </Link>
          )}
          {(order.status === "Cancelled" || order.status === "Delivered") && (
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
              className="col-span-2 h-12 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
            >
              <Package className="w-4 h-4" />
              Reorder Items
            </button>
          )}
        </div>

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

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotificationStore } from "@/store/notification-store";
import { ArrowLeft, Bell, Package, Check, X } from "lucide-react";
import { orderService } from "@/services/orders.service";
import { adminToast } from "@/lib/admin-toast";
import type { Order } from "@/types/orders";

export default function NotificationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const selectedData = useNotificationStore((s) => s.selectedNotificationData);

  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (selectedData && selectedData.type === "ORDER" && selectedData.referenceId) {
      setLoadingOrder(true);
      orderService.getOrderById(selectedData.referenceId)
        .then((data) => {
          if (data) setOrderDetail(data);
        })
        .catch((err) => console.error("Failed to load order:", err))
        .finally(() => setLoadingOrder(false));
    }
  }, [selectedData]);

  const handleConfirm = async () => {
    if (!orderDetail) return;
    setIsConfirming(true);
    try {
      await orderService.updateOrderStatus(orderDetail.id, "CONFIRMED");
      adminToast.success("Order confirmed successfully!");
      router.back();
    } catch (err) {
      adminToast.apiError("Failed to confirm order.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      adminToast.error("Please provide a reason for rejection.");
      return;
    }
    if (!orderDetail) return;
    setIsRejecting(true);
    try {
      await orderService.updateOrderStatus(orderDetail.id, "CANCELLED", rejectReason);
      adminToast.success("Order rejected.");
      router.back();
    } catch (err) {
      adminToast.apiError("Failed to reject order.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (!selectedData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e8e8e8] max-w-md w-full text-center">
          <Bell className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1a1a1a] mb-2">No Data Available</h2>
          <p className="text-sm text-[#666] mb-6">Please go back and select a notification again.</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#333] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
    if (typeof value === 'boolean') return <span className="text-gray-600">{value ? "Yes" : "No"}</span>;
    if (typeof value === 'object') {
      return (
        <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#e8e8e8] mt-1 space-y-2">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-xs font-bold text-[#666] uppercase tracking-wide min-w-[120px]">{k}</span>
              <div className="text-sm text-[#1a1a1a] break-all">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-sm font-semibold text-[#1a1a1a]">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white border border-[#e8e8e8] rounded-xl flex items-center justify-center hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#ff4f8b] mb-1">
              Notification Details
            </p>
            <h1 className="text-2xl font-black text-[#1a1a1a]">
              Notification #{id}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm overflow-hidden">
          
          {selectedData.type === "ORDER" && orderDetail ? (
             <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between border-b border-[#e8e8e8] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1a1a1a] flex items-center gap-2">
                      <Package className="w-6 h-6 text-[#0c831f]" />
                      Order Details
                    </h2>
                    <p className="text-sm text-[#666] mt-1">Review the order before confirming or rejecting.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#666]">Status</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-[#fffbeb] text-[#d97706] mt-1">
                      {orderDetail.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-[#666] uppercase tracking-wide mb-1">Customer</p>
                    <p className="font-semibold text-[#1a1a1a]">{orderDetail.customer}</p>
                    <p className="text-sm text-[#666]">{orderDetail.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#666] uppercase tracking-wide mb-1">Payment Mode</p>
                    <p className="font-semibold text-[#1a1a1a]">{orderDetail.paymentMethod || "Not specified"}</p>
                  </div>
                </div>

                <div>
                   <p className="text-xs font-bold text-[#666] uppercase tracking-wide mb-2">Items</p>
                   <div className="bg-[#f8f9fa] rounded-xl border border-[#e8e8e8] divide-y divide-[#e8e8e8]">
                      {orderDetail.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-sm font-semibold text-[#1a1a1a]">
                           <span>{item.product} <span className="text-[#666] font-medium">(x{item.quantity})</span></span>
                           <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="p-4 flex justify-between items-center bg-[#f0f1f3] rounded-b-xl">
                        <span className="font-black text-[#1a1a1a]">Total</span>
                        <span className="font-black text-[#0c831f] text-lg">₹{orderDetail.total.toFixed(2)}</span>
                      </div>
                   </div>
                </div>

                {orderDetail.status.toLowerCase() === "pending" && (
                  <div className="pt-4 border-t border-[#e8e8e8] space-y-4">
                    {!showRejectInput ? (
                       <div className="flex gap-4">
                         <button 
                           disabled={isConfirming}
                           onClick={handleConfirm}
                           className="flex-1 bg-[#0c831f] hover:bg-[#0a6a18] text-white py-3 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
                         >
                           <Check className="w-4 h-4" />
                           {isConfirming ? "Confirming..." : "Confirm Order"}
                         </button>
                         <button 
                           onClick={() => setShowRejectInput(true)}
                           className="flex-1 bg-white hover:bg-[#fff0f6] border border-[#ff4f8b] text-[#ff4f8b] py-3 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
                         >
                           <X className="w-4 h-4" />
                           Reject Order
                         </button>
                       </div>
                    ) : (
                       <div className="bg-[#fff0f6] p-4 rounded-xl border border-[#ffb3c6] space-y-3">
                         <p className="text-sm font-bold text-[#ff4f8b]">Reason for Rejection</p>
                         <textarea 
                           className="w-full border border-[#ffb3c6] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f8b]" 
                           placeholder="E.g. Item out of stock, undeliverable area..."
                           value={rejectReason}
                           onChange={(e) => setRejectReason(e.target.value)}
                           rows={3}
                         />
                         <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => setShowRejectInput(false)}
                              className="px-4 py-2 text-sm font-bold text-[#666] hover:bg-white rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              disabled={isRejecting}
                              onClick={handleReject}
                              className="px-4 py-2 bg-[#ff4f8b] hover:bg-[#e91e63] text-white text-sm font-bold rounded-lg transition-colors"
                            >
                              {isRejecting ? "Rejecting..." : "Submit Rejection"}
                            </button>
                         </div>
                       </div>
                    )}
                  </div>
                )}
             </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black text-[#1a1a1a] border-b border-[#e8e8e8] pb-4">
                Payload Response Data
              </h2>
              
              <div className="space-y-4">
                {Object.entries(selectedData).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-[#f2f2f2] pb-4 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-[#666] capitalize w-1/3">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="w-2/3">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

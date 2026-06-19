"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, RotateCcw, Package, Clock, CheckCircle, XCircle, Truck, Search } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { useReturnsStore, type ReturnReason } from "@/store/returns-store";

const reasonLabels: Record<ReturnReason, string> = {
  defective: "Defective Product",
  wrong_item: "Wrong Item Received",
  not_as_described: "Not as Described",
  size_issue: "Size Issue",
  damaged: "Damaged in Transit",
  expired: "Expired Product",
  other: "Other",
};

const statusConfig = {
  pending: { label: "Pending Review", color: "text-[#e65100]", bg: "bg-[#fff3e0]", icon: Clock },
  approved: { label: "Approved", color: "text-[#0c831f]", bg: "bg-[#e8f5e9]", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-[#ff4f8b]", bg: "bg-[#fff0f6]", icon: XCircle },
  picked_up: { label: "Picked Up", color: "text-[#1565c0]", bg: "bg-[#e3f2fd]", icon: Truck },
  refunded: { label: "Refunded", color: "text-[#0c831f]", bg: "bg-[#e8f5e9]", icon: CheckCircle },
};

export default function ReturnsPage() {
  const { returns } = useReturnsStore();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "resolved">("all");

  const filtered = activeTab === "all"
    ? returns
    : activeTab === "pending"
    ? returns.filter((r) => r.status === "pending" || r.status === "approved" || r.status === "picked_up")
    : returns.filter((r) => r.status === "refunded" || r.status === "rejected");

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account/orders" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Returns & Refunds</h1>
            <p className="text-xs text-[#666]">{returns.length} return request{returns.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "pending", "resolved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#ff4f8b] text-white shadow-sm"
                  : "bg-white border border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b]"
              }`}
            >
              {tab === "all" ? "All" : tab === "pending" ? "Active" : "Resolved"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-10 h-10 text-[#ccc]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No return requests</h3>
            <p className="text-sm text-[#666] mb-6">You haven&apos;t initiated any returns yet</p>
            <Link href="/account/orders" className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors">
              <Package className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ret) => {
              const sc = statusConfig[ret.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={ret.id} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#fafafa] border-b border-[#e8e8e8]">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-[#666]" />
                      <span className="font-bold text-sm text-[#1a1a1a]">{ret.id}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#f2f2f2]">
                        <SafeImage src={ret.productImage} alt={ret.productName} fill className="object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{ret.productName}</p>
                        <p className="text-xs text-[#666]">Qty: {ret.quantity} • Refund: ₹{ret.refundAmount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-[#999] font-medium uppercase">Reason</p>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{reasonLabels[ret.reason]}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#999] font-medium uppercase">Order</p>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{ret.orderId}</p>
                      </div>
                    </div>

                    {ret.details && (
                      <p className="mt-2 text-xs text-[#666] bg-[#f9f9f9] rounded-lg p-2.5">{ret.details}</p>
                    )}

                    {ret.tracking && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0c831f] bg-[#e8f5e9] rounded-lg px-3 py-2">
                        <Truck className="w-3.5 h-3.5" />
                        Tracking: {ret.tracking}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8e8e8]">
                      <p className="text-[10px] text-[#999]">Requested {new Date(ret.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

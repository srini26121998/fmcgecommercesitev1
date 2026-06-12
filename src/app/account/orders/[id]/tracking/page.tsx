"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronLeft,
  Truck,
  CheckCircle,
  ShoppingBag,
  Package,
  Home,
  MapPin,
  Phone,
  Clock,
  Star,
  ChevronRight,
  XCircle
} from "lucide-react";
import { useUserOrderDetails } from "@/hooks/use-user-orders";

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  CheckCircle,
  Package,
  Truck,
  Home,
};

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ElementType; label: string; gradient: string; dot: string }
> = {
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

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const { order, loading } = useUserOrderDetails(decodedId);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1565c0]/30 border-t-[#1565c0] rounded-full" 
        />
      </main>
    );
  }

  if (!order) return notFound();

  const safeItems = Array.isArray(order.items) ? order.items : [];
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["Processing"];

  const completedCount = order.trackingSteps?.filter((s) => s.completed).length ?? 0;
  const totalSteps = order.trackingSteps?.length ?? 6;
  const progressPct = Math.round((completedCount / Math.max(1, totalSteps)) * 100);

  // Split items into mock packages to demonstrate item-level tracking
  const packages = [
    {
      id: "PKG-A1",
      warehouse: "Mumbai Central Fulfillment",
      eta: "Today, 4 PM",
      status: "Out for Delivery",
      items: safeItems.slice(0, Math.ceil(safeItems.length / 2) || 1),
      trackingSteps: order.trackingSteps,
      completedCount,
      totalSteps,
    },
    ...(safeItems.length > 1 ? [{
      id: "PKG-B2",
      warehouse: "Pune East Warehouse",
      eta: "Tomorrow, by 8 PM",
      status: "Processing",
      items: safeItems.slice(Math.ceil(safeItems.length / 2)),
      trackingSteps: [
        { id: "s1", status: "Order Placed", label: "We have received your order", time: "10:00 AM", completed: true, icon: "CheckCircle" },
        { id: "s2", status: "Processing", label: "Item is being packed at Pune East", time: "11:30 AM", completed: true, icon: "Package" },
        { id: "s3", status: "Shipped", label: "Waiting for carrier pickup", time: "Pending", completed: false, icon: "Truck" },
        { id: "s4", status: "Out for Delivery", label: "", time: "", completed: false, icon: "Home" },
      ],
      completedCount: 2,
      totalSteps: 4,
    }] : [])
  ];

  return (
    <main className="min-h-screen bg-[#f4f6f8] pb-28 font-sans selection:bg-[#1565c0]/20">
      
      {/* ── Sticky Glassmorphism Header ── */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/[0.05] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href={`/account/orders/${encodeURIComponent(order.id)}`}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-black/[0.08] text-black hover:bg-black/[0.02] transition-colors active:scale-95"
            aria-label="Back to order details"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[17px] font-black text-[#1a1a1a] tracking-tight leading-none mb-1">Live Tracking</h1>
            <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">ID: {order.id}</p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto px-4 py-6 space-y-6 relative z-10"
      >

        {/* ── Dynamic Hero ETA Card ── */}
        <motion.div variants={fadeUp} className={`relative overflow-hidden rounded-[2rem] border ${sc.border} bg-gradient-to-br ${sc.gradient} p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
          <div className="absolute right-4 bottom-4 opacity-[0.03] pointer-events-none rotate-[-15deg] scale-150">
            <sc.icon className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/50 mb-1">Estimated Delivery</p>
              <motion.h2 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-black tracking-tight ${sc.color}`}
              >
                {order.estimatedTime || "Today, 4 PM"}
              </motion.h2>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border border-white/40 shadow-sm backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${sc.dot} ${order.status !== "Delivered" ? "animate-pulse" : ""}`}></span>
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{sc.label}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-[11px] font-black text-black/40 mb-2 uppercase tracking-widest">
              <span>Progress</span>
              <span>{progressPct}% Complete</span>
            </div>
            <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${sc.dot} rounded-full relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full animate-[shine_2s_ease-out_infinite]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Shipments / Packages Tracking ── */}
        {packages.map((pkg, pkgIndex) => (
          <motion.div key={pkg.id} variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-black/[0.04] bg-gray-50/50">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-black text-[#1a1a1a] tracking-tight">
                  Shipment {pkgIndex + 1}
                  <span className="text-sm font-semibold text-[#999] ml-1">({pkg.id})</span>
                </h2>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white border border-gray-200 ${STATUS_CONFIG[pkg.status]?.color || "text-gray-900"}`}>
                  {pkg.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="font-semibold text-gray-900">Shipped from: {pkg.warehouse}</span>
              </div>
              
              {/* Items Mini Grid */}
              <div className="flex flex-wrap gap-2">
                {pkg.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 p-1.5 pr-3 shadow-sm hover:border-gray-300 transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || "https://placehold.co/100x100?text=No+Image"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="max-w-[130px]">
                      <p className="text-[11px] font-bold text-gray-900 truncate leading-tight">{item.name}</p>
                      <p className="text-[10px] font-medium text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Tracking Timeline */}
            <div className="px-6 py-8">
              <div className="relative">
                {/* Vertical Track Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100 rounded-full" />
                
                {/* Active Track Line */}
                {pkg.completedCount > 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `calc(${((pkg.completedCount - 1) / Math.max(1, pkg.totalSteps - 1)) * 100}% - 0px)` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute left-[21px] top-4 w-0.5 bg-[#1565c0] rounded-full"
                  />
                )}

                <div className="space-y-8">
                  {pkg.trackingSteps?.map((step: any, index: number) => {
                    const StepIcon = ICON_MAP[step.icon] ?? CheckCircle;
                    const isCurrent = !step.completed && index > 0 && pkg.trackingSteps?.[index - 1]?.completed;
                    
                    const stepStatusColor = step.completed ? "text-[#1565c0]" : isCurrent ? "text-amber-600" : "text-gray-400";
                    const dotBgColor = step.completed ? "bg-[#1565c0] shadow-md shadow-[#1565c0]/30" : isCurrent ? "bg-white border-[3px] border-amber-500 shadow-md shadow-amber-500/20" : "bg-gray-100 border-[3px] border-white ring-1 ring-gray-200";

                    return (
                      <div key={step.id} className="flex items-start gap-5 relative group">
                        {/* Step Dot */}
                        <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${dotBgColor}`}>
                          <StepIcon className={`w-4 h-4 ${step.completed ? "text-white" : isCurrent ? "text-amber-500" : "text-gray-400"}`} />
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-amber-500/30" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0 pt-1 pb-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className={`text-sm font-black capitalize ${step.completed ? "text-gray-900" : isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                              {step.status ? step.status.replace(/_/g, " ").toLowerCase() : "Update"}
                            </h3>
                            <span className={`text-[10px] font-black tracking-wider uppercase flex-shrink-0 ${step.completed ? "text-gray-500" : "text-gray-300"}`}>
                              {step.time}
                            </span>
                          </div>
                          
                          {step.label && step.label !== step.status && (
                            <div className={`text-[13px] mt-1.5 font-medium leading-relaxed ${step.completed ? "text-gray-600" : "text-gray-400"}`}>
                              {step.label}
                            </div>
                          )}
                          
                          {step.completed && (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1565c0]/5 border border-[#1565c0]/10">
                              <CheckCircle className="w-3 h-3 text-[#1565c0]" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#1565c0]">Completed</span>
                            </div>
                          )}
                          {isCurrent && (
                            <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-50 animate-pulse" />
                              In Progress...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* ── Delivery Partner ── */}
        <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-base font-black text-gray-900">Delivery Partner</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20 text-white font-black text-lg">
                {order.deliveryPartner && order.deliveryPartner !== "Not Assigned" ? order.deliveryPartner.charAt(0) : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{order.deliveryPartner}</p>
                {order.deliveryPartner !== "Not Assigned" && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-black text-gray-700">4.8</span>
                    <span className="text-[10px] font-bold text-gray-400 ml-1">(500+ deliveries)</span>
                  </div>
                )}
              </div>
            </div>
            {order.deliveryPartner !== "Not Assigned" && (
              <a
                href="tel:+919999999999"
                className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100 group-hover:shadow-lg active:scale-95"
                aria-label="Call delivery partner"
              >
                <Phone className="w-5 h-5 text-indigo-600 group-hover/a:text-white" />
              </a>
            )}
          </div>
        </motion.div>

        {/* ── Delivery Address ── */}
        <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <MapPin className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-base font-black text-gray-900">Delivering To</h2>
          </div>
          <div className="pl-13 space-y-2">
            <p className="text-sm font-black text-gray-900">{order.deliveryAddress?.name}</p>
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed max-w-[90%]">
              {order.deliveryAddress?.address}, {order.deliveryAddress?.city} — {order.deliveryAddress?.pincode}
            </p>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-bold text-gray-700">{order.deliveryAddress?.phone}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Back CTA ── */}
        <motion.div variants={fadeUp} className="pt-4 pb-8">
          <Link
            href={`/account/orders/${encodeURIComponent(order.id)}`}
            className="flex items-center justify-center gap-2 h-14 w-full rounded-2xl bg-white border border-gray-200 text-sm font-black text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Order Details
          </Link>
        </motion.div>

      </motion.div>

      <style jsx global>{`
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}

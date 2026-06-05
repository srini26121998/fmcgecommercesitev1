import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import Link from "next/link";
import { ChevronLeft, Truck, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Offers & Delivery Policy | FMCG Commerce",
  description: "Learn about our 10-minute delivery promise and free shipping offers. Free delivery on all orders above ₹199.",
};

export default function ShippingOffersPage() {
  return (
    <main className="bg-[#f2f2f2] min-h-screen pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        {/* Page header */}
        <div className="bg-white border-b border-[#e8e8e8] sticky top-[72px] sm:top-20 z-10">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-full bg-[#f2f2f2] hover-bg-pink-light transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#0c831f]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black leading-tight text-[#1a1a1a]">
                  Shipping Offers
                </h1>
                <p className="text-sm font-bold text-[#666]">Delivery in 10 Minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Offer Card */}
            <div className="bg-gradient-to-br from-[#0c831f] to-[#10b981] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Active Offer</span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">FREE DELIVERY</h2>
                  <p className="text-lg font-bold opacity-90 mt-2">On all orders above &#8377;199</p>
                  
                  <div className="mt-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">No coupon code required</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">Valid across all categories</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">Unlimited uses per user</span>
                    </div>
                  </div>

                  <Link href="/" className="inline-flex mt-10 bg-white text-[#0c831f] px-8 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-transform">
                    Start Shopping
                  </Link>
               </div>
               <Truck className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 rotate-[-15deg]" />
            </div>

            {/* Delivery Policy Details */}
            <div className="space-y-4">
               <div className="bg-white rounded-2xl p-6 border border-[#e8e8e8] shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#fff0f6] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#ff4f8b]" />
                    </div>
                    <h3 className="text-lg font-black text-[#1a1a1a]">10-Minute Promise</h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Our ultra-fast delivery network ensures that your groceries reach your doorstep in under 10 minutes from the moment you place the order.
                  </p>
               </div>

               <div className="bg-white rounded-2xl p-6 border border-[#e8e8e8] shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#e3f2fd] flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-[#2196f3]" />
                    </div>
                    <h3 className="text-lg font-black text-[#1a1a1a]">Safe & Secure Handling</h3>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">
                    Every order is packed with care in hygienic environments. Our delivery partners follow strict safety protocols to ensure your food is fresh and safe.
                  </p>
               </div>

               <div className="bg-[#fffbeb] rounded-2xl p-6 border border-[#fef3c7]">
                  <h3 className="text-base font-black text-[#92400e] mb-2">Standard Delivery Charges</h3>
                  <div className="flex justify-between items-center py-2 border-b border-[#fef3c7]">
                    <span className="text-sm font-bold text-[#b45309]">Below &#8377;199</span>
                    <span className="text-sm font-black text-[#92400e]">&#8377;25</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-bold text-[#b45309]">Above &#8377;199</span>
                    <span className="text-sm font-black text-[#0c831f]">FREE</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

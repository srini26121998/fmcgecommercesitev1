"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home, Search, ShoppingBag } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#fff0f6] flex items-center justify-center mx-auto mb-6">
          <div className="relative">
            <WifiOff className="w-10 h-10 text-[#ff4f8b]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff4f8b] animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#1a1a1a] mb-2">
          You&apos;re Offline
        </h1>
        <p className="text-sm text-[#666] mb-8 leading-relaxed">
          No internet connection detected. Don&apos;t worry — your recently viewed
          products and cart are still available. Connect to browse fresh deals!
        </p>

        {/* Quick actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#ff4f8b] text-white text-sm font-black hover:bg-[#e63872] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#e8e8e8] text-sm font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-[#e8e8e8] text-sm font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            View Cart
          </Link>
        </div>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="mt-6 flex items-center justify-center gap-1.5 mx-auto text-xs font-semibold text-[#999] hover:text-[#ff4f8b] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try reconnecting
        </button>

        <p className="mt-8 text-[10px] text-[#999]">
          FMCG Commerce — cached for offline browsing
        </p>
      </div>
    </main>
  );
}

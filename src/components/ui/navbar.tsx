"use client";

import { ShoppingCart, Search } from "lucide-react";
import { useUserCart } from "@/hooks/use-user-cart";
import { env } from "@/lib/env";
import NotificationPanel from "./notification-panel";
import AuthModal from "./auth/auth-modal";
import WishlistPanel from "./wishlist-panel";
import Link from "next/link";
import LocationPicker from "./location-picker";
import CategoryTreeDrawer from "./category/category-tree-drawer";
import { useState, useEffect } from "react";


export default function Navbar() {
  const { cartItems: cart } = useUserCart();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav
      className="w-full bg-white/80 backdrop-blur-lg border-b border-white/20 fixed top-0 z-50 shadow-sm"
      aria-label="Primary navigation"
      itemScope
      itemType="https://schema.org/WebSite"
    >
      <meta itemProp="name" content="FMCG Commerce" />
      <meta itemProp="url" content={env.siteUrl} />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 h-[72px] sm:h-20 flex items-center gap-4 sm:gap-6 md:gap-8">

        {/* LOGO */}
        <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105 duration-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4f8b] to-[#e63872] shadow-sm flex items-center justify-center">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <span className="font-black text-[#1a1a1a] text-lg sm:text-xl hidden sm:block tracking-tight">
              FMCG
            </span>
          </div>
        </Link>

        {/* CATEGORY & LOCATION PICKER */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <CategoryTreeDrawer />
          <LocationPicker />
        </div>

        {/* SEARCH BAR — hidden on mobile since it's in bottom nav or shown selectively */}
        <Link href="/search" className="flex-1 min-w-0 max-w-2xl mx-auto hidden md:block">
          <div className="h-11 sm:h-12 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center px-4 gap-3 hover-border-pink transition-all duration-200 cursor-pointer hover:shadow-md hover:bg-white group">
            <Search className="w-5 h-5 text-[#999] flex-shrink-0 group-hover:text-[#ff4f8b] transition-colors" />
            <span className="text-[15px] text-[#999] truncate font-medium">
              Search for groceries, snacks, beverages...
            </span>
          </div>
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto md:ml-0">

          {/* Wishlist - Keep on mobile */}
          <WishlistPanel />

          {/* Notifications - Keep on mobile */}
          <NotificationPanel />

          {/* Cart - Hide on mobile (in bottom nav) */}
          <div className="relative hidden md:block">
           <Link href="/cart" className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center justify-center hover-border-pink transition-all duration-200 btn-press hover:scale-105 hover:bg-white hover:shadow-sm group">
              <ShoppingCart className="w-5 h-5 text-[#444] group-hover:text-[#ff4f8b] transition-colors" />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff4f8b] text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1 shadow-sm">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden md:block">
            <AuthModal />
          </div>

        </div>
      </div>
    </nav>
  );
}

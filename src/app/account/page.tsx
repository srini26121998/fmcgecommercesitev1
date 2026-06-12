"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronLeft, User, Package, MapPin, CreditCard,
  Heart, Gift, Settings, HelpCircle, LogOut, Star,
  ShoppingBag, TrendingUp, Clock, Zap, Wallet, Crown, Bell
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserOrders } from "@/hooks/use-user-orders";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { useWalletStore } from "@/store/wallet-store";
import { useMembershipStore, MEMBERSHIP_PLANS } from "@/store/membership-store";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { OffersForYouWidget } from "@/components/ui/offers/offers-for-you-widget";

const menuGroups = [
  {
    title: "Shopping",
    items: [
      { name: "Your Orders", href: "/account/orders", icon: Package, desc: "Track, return, or buy again", color: "text-[#0c831f]", bgColor: "bg-[#e8f5e9]" },
      { name: "Buy Again", href: "/account/buy-again", icon: Zap, desc: "Predictive restock dashboard", color: "text-[#ff4f8b]", bgColor: "bg-[#fff0f6]" },
      { name: "My Wishlists", href: "/account/wishlist", icon: Heart, desc: "Named lists — move items between lists", color: "text-[#e91e63]", bgColor: "bg-[#fce4ec]" },
      { name: "Your Lists", href: "/account/lists", icon: Heart, desc: "Family & collaborative shopping lists", color: "text-[#e91e63]", bgColor: "bg-[#fce4ec]" },
    ],
  },
  {
    title: "Account Settings",
    items: [
      { name: "Your Profile", href: "/account/profile", icon: User, desc: "Personal info, email, phone", color: "text-[#1565c0]", bgColor: "bg-[#e3f2fd]" },
      { name: "Delivery Addresses", href: "/account/addresses", icon: MapPin, desc: "Edit, add or remove addresses", color: "text-[#7b1fa2]", bgColor: "bg-[#f3e5f5]" },
      { name: "Payment Methods", href: "/account/payment", icon: CreditCard, desc: "Manage saved cards & UPI", color: "text-[#e65100]", bgColor: "bg-[#fff3e0]" },
      { name: "Notification Preferences", href: "/account/settings/notifications", icon: Bell, desc: "Email, SMS & push notification controls", color: "text-[#7c3aed]", bgColor: "bg-[#f5f3ff]" },
      { name: "Account Settings", href: "/account/settings", icon: Settings, desc: "Language, privacy & more", color: "text-[#546e7a]", bgColor: "bg-[#eceff1]" },
    ],
  },
  {
    title: "Support & Rewards",
    items: [
      { name: "Rewards & Referral", href: "/account/referral", icon: Gift, desc: "Loyalty tiers, referrals, cashback", color: "text-[#c62828]", bgColor: "bg-[#ffebee]" },
      { name: "My Gift Cards", href: "/account/gift-cards", icon: Gift, desc: "Manage and redeem gift cards", color: "text-[#ff4f8b]", bgColor: "bg-[#fff0f6]" },
      { name: "Help & Support", href: "/account/help", icon: HelpCircle, desc: "FAQs, contact us, policies", color: "text-[#00838f]", bgColor: "bg-[#e0f7fa]" },
    ],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { orders, loading: ordersLoading } = useUserOrders();
  const wishlistCount = useMultiWishlistStore((s) =>
    s.lists.reduce((total, list) => total + list.items.length, 0)
  );
  const walletBalance = useWalletStore((state) => state.balance);
  const { plan: membershipPlan } = useMembershipStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      if (user?.token) {
        await authService.logout({ refreshToken: user.token });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // We still proceed to logout locally even if API fails
    }

    logout();
    toast.success("You've been logged out successfully!", {
      description: "See you again soon!",
      duration: 3000,
      position: "top-center",
      className: "bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white border-none",
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Profile Header Banner ── */}
      <div className="bg-gradient-to-br from-[#ff4f8b] via-[#ff4f8b] to-[#ff6b9d] text-white px-5 pt-8 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Hello, {user?.name || "Guest"}</h1>
              <p className="text-white/80 text-sm">{user?.email || "No email provided"}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star className={`w-3.5 h-3.5 ${membershipPlan !== "free" ? "fill-yellow-300 text-yellow-300" : "fill-white/50 text-white/50"}`} />
                <span className="text-xs text-white/90 font-medium">
                  {membershipPlan !== "free" ? `${MEMBERSHIP_PLANS[membershipPlan].name} Member` : "Standard Member"}
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-colors"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Cards ── */}
      <div className="max-w-[1400px] mx-auto px-4 -mt-6 mb-4">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/account/orders")}>
            <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-5 h-5 text-[#0c831f]" />
            </div>
            <div className="text-xl font-bold text-[#1a1a1a]">{totalOrders}</div>
            <div className="text-[10px] text-[#666] font-medium uppercase tracking-wide">Orders</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#fff3e0] flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-[#e65100]" />
            </div>
            <div className="text-xl font-bold text-[#1a1a1a]">{deliveredOrders}</div>
            <div className="text-[10px] text-[#666] font-medium uppercase tracking-wide">Delivered</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/account/wishlist")}>
            <div className="w-10 h-10 rounded-full bg-[#fce4ec] flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-[#e91e63]" />
            </div>
            <div className="text-xl font-bold text-[#1a1a1a]">{wishlistCount}</div>
            <div className="text-[10px] text-[#666] font-medium uppercase tracking-wide">Wishlist</div>
          </div>
        </div>

        {/* Wallet + Membership quick cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="account-wallet-card"
            onClick={() => router.push("/account/wallet")}
            className="bg-gradient-to-br from-[#ff4f8b] to-[#7c3aed] rounded-2xl p-4 text-left text-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold opacity-80">FMCG Wallet</span>
            </div>
            <div className="text-2xl font-black">₹{walletBalance.toLocaleString("en-IN")}</div>
            <div className="text-[10px] opacity-70 mt-0.5">Tap to add money →</div>
          </button>
          <button
            id="account-membership-card"
            onClick={() => router.push("/account/membership")}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-2xl p-4 text-left text-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-xs font-bold opacity-80">Membership</span>
            </div>
            <div className="text-lg font-black">{MEMBERSHIP_PLANS[membershipPlan].badge}</div>
            <div className="text-[10px] opacity-70 mt-0.5">Tap to manage →</div>
          </button>
        </div>
      </div>

      {/* ── Offers For You Widget ── */}
      <div className="max-w-[1400px] mx-auto px-4 mb-2">
        <OffersForYouWidget placement="account_screen" />
      </div>

      {/* ── Account Sections ── */}
      <div className="max-w-[1400px] mx-auto px-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3 px-1 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#ff4f8b] inline-block" />
              {group.title}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden divide-y divide-[#e8e8e8]">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-[#fafafa] transition-colors group"
                >
                  <div className={`w-11 h-11 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1a1a1a] text-sm group-hover:text-[#ff4f8b] transition-colors">{item.name}</h3>
                    <p className="text-xs text-[#666] mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#ff4f8b] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* ── Recent Activity ── */}
        <div>
          <h2 className="text-base font-bold text-[#1a1a1a] mb-3 px-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#0c831f] inline-block" />
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-4">
            {ordersLoading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#f5f5f5] rounded w-1/3" />
                  <div className="h-3 bg-[#f5f5f5] rounded w-2/3" />
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#0c831f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1a1a1a]">Order {orders[0].id} {orders[0].status.toLowerCase()}</p>
                  <p className="text-xs text-[#666]">Your order of {orders[0].items.length} items was {orders[0].status.toLowerCase()}</p>
                </div>
                <Link href="/account/orders" className="text-xs font-semibold text-[#ff4f8b] whitespace-nowrap hover:underline">
                  View
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[#666] text-center py-2">No recent activity yet.</p>
            )}
          </div>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white rounded-2xl border border-[#e8e8e8] p-4 flex items-center justify-center gap-2 text-[#ff4f8b] font-semibold hover:bg-[#fff0f6] transition-colors disabled:opacity-50 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </button>

        <div className="text-center text-[10px] text-[#999] pb-4">
          FMCG Commerce v1.0 • Secure Account
        </div>
      </div>
    </main>
  );
}

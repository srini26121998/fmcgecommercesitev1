"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useReferralStore } from "@/store/referral-store";
import { Loader2, Lock, ArrowLeft, ShoppingBag, Heart, Package, Star } from "lucide-react";
import AuthModal from "@/components/ui/auth/auth-modal";
import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Package, label: "Track your orders in real time" },
  { icon: Heart, label: "Save items to wishlists" },
  { icon: ShoppingBag, label: "Predictive restock & buy again" },
  { icon: Star, label: "Exclusive member-only offers" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, user } = useAuthStore();
  const initCode = useReferralStore((s) => s.initCode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Seed referral code from user name on login
  useEffect(() => {
    if (isLoggedIn && user?.name) {
      initCode(user.name);
    }
  }, [isLoggedIn, user?.name, initCode]);

  // ── Loading skeleton ────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-[#ff4f8b] animate-spin" />
          <p className="text-sm text-[#666] font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  // ── Auth wall ───────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff0f6] via-[#f8f9ff] to-[#f0f4ff] flex flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-[#f0e0ea] overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0c831f] via-[#ff4f8b] to-[#7c3aed]" />

            <div className="px-8 pt-8 pb-6 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#ff4f8b] to-[#e63872] flex items-center justify-center shadow-xl shadow-pink-500/30"
              >
                <Lock className="w-9 h-9 text-white" />
              </motion.div>

              <h1 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-2">
                Sign in to continue
              </h1>
              <p className="text-sm text-[#666] leading-relaxed">
                Access your orders, wishlists, wallet, and exclusive offers.
              </p>
            </div>

            {/* Feature list */}
            <div className="px-6 pb-5 space-y-2.5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-3 bg-[#fafafa] rounded-xl px-3.5 py-2.5 border border-[#f0f0f0]"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4f8b]/15 to-[#7c3aed]/15 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-[#ff4f8b]" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#444]">{f.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="px-6 pb-7 flex flex-col gap-3">
              <AuthModal
                trigger={
                  <button className="flex items-center justify-center gap-2 h-12 w-full rounded-2xl bg-gradient-to-r from-[#ff4f8b] to-[#e63872] text-white font-black text-sm hover:from-[#e63872] hover:to-[#cc2f61] transition-all shadow-lg shadow-pink-500/25 active:scale-[0.98]">
                    <Lock className="w-4 h-4" />
                    Login to Continue
                  </button>
                }
              />
              <Link
                href="/"
                className="flex items-center justify-center gap-2 h-12 w-full rounded-2xl bg-[#f5f5f5] text-[#555] font-bold text-sm hover:bg-[#ebebeb] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Browsing
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#aaa] mt-4">
            Your data is encrypted and never shared.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

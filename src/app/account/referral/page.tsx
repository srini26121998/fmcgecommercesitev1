"use client";

import Link from "next/link";
import { ChevronLeft, Gift, Copy, CheckCircle, Users, TrendingUp, Loader2 } from "lucide-react";
import { LoyaltyCard, ReferralCard } from "@/components/ui/loyality-cashback-card";
import { useUserLoyalty } from "@/hooks/use-user-loyalty";
import { useReferralStore, selectTotalEarned } from "@/store/referral-store";

export default function ReferralPage() {
  const { points, tier, loading } = useUserLoyalty();
  const { referrals } = useReferralStore();
  const totalEarned = selectTotalEarned(referrals);

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Rewards & Referrals</h1>
          </div>
          {loading && (
            <Loader2 className="w-4 h-4 text-[#0c831f] animate-spin" />
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5 space-y-5">
        <LoyaltyCard />
        <ReferralCard />

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">How Referral Works</h3>
          <div className="space-y-4">
            {[
              { step: 1, text: "Share your unique referral code with friends", icon: Users },
              { step: 2, text: "They sign up and place their first order", icon: Gift },
              { step: 3, text: "You earn ₹200 cashback — they get ₹100 off!", icon: TrendingUp },
            ].map(({ step, text, icon: Icon }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#fff0f6] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#ff4f8b]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff4f8b] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </span>
                  <p className="text-sm text-[#666]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers explained */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">Membership Tiers</h3>
          <div className="space-y-3">
            {[
              { tier: "Silver", points: "0-499", benefit: "Free delivery above ₹99", color: "text-[#666]" },
              { tier: "Gold", points: "500-999", benefit: "5% extra cashback + free delivery", color: "text-[#f57f17]" },
              { tier: "Platinum", points: "1000-1999", benefit: "10% cashback + priority support", color: "text-[#0d47a1]" },
              { tier: "SuperSaver", points: "2000+", benefit: "15% cashback + exclusive deals + early access", color: "text-[#c62828]" },
            ].map((t) => (
              <div key={t.tier} className={`flex items-center justify-between p-3 rounded-xl ${tier === t.tier ? "bg-[#fff0f6] border border-[#ff4f8b]/20" : "bg-[#f9f9f9]"} transition-colors`}>
                <div>
                  <p className={`text-sm font-black ${t.color}`}>{t.tier}</p>
                  <p className="text-[10px] text-[#999]">{t.points} points</p>
                </div>
                <p className="text-xs text-[#666] text-right max-w-[200px]">{t.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

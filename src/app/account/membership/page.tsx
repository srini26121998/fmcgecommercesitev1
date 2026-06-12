"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  ChevronRight,
  CheckCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  useMembershipStore,
  MEMBERSHIP_PLANS,
  MembershipPlan,
} from "@/store/membership-store";
import { useWalletStore } from "@/store/wallet-store";
import { toast } from "sonner";

const PLAN_ORDER: MembershipPlan[] = ["free", "silver", "gold", "prime"];

export default function MembershipPage() {
  const {
    plan: currentPlan,
    expiryDate,
    autoRenew,
    subscribe,
    cancel,
    toggleAutoRenew,
    isActive,
    getDaysRemaining,
  } = useMembershipStore();
  const { balance, debit } = useWalletStore();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const planData = MEMBERSHIP_PLANS[selectedPlan];
  const currentPlanData = MEMBERSHIP_PLANS[currentPlan];
  const daysRemaining = getDaysRemaining();

  const handleSubscribe = async () => {
    if (selectedPlan === currentPlan) {
      toast.info("You are already on this plan");
      return;
    }
    if (selectedPlan === "free") {
      setShowCancelModal(true);
      return;
    }
    const price = MEMBERSHIP_PLANS[selectedPlan].price;
    if (price > 0 && balance < price) {
      toast.error(`Insufficient wallet balance. Add ₹${price - balance} more.`);
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (price > 0) {
      debit(price, `${MEMBERSHIP_PLANS[selectedPlan].name} membership`);
    }
    subscribe(selectedPlan);
    toast.success(`🎉 Welcome to FMCG ${MEMBERSHIP_PLANS[selectedPlan].name}!`);
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    cancel();
    subscribe("free");
    toast.success("Membership cancelled. You'll retain benefits until expiry.");
    setShowCancelModal(false);
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-4 pt-8 pb-16 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-xs mb-6">
            <Link href="/account" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Membership</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-[#fbbf24]" />
            <div>
              <h1 className="text-xl font-black">FMCG Membership</h1>
              <p className="text-white/60 text-xs">Unlock exclusive benefits & savings</p>
            </div>
          </div>

          {/* Current Plan Badge */}
          {currentPlan !== "free" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60">Current Plan</p>
                  <p className="text-lg font-black" style={{ color: currentPlanData.color }}>
                    {currentPlanData.badge}
                  </p>
                </div>
                <div className="text-right">
                  {isActive() ? (
                    <>
                      <p className="text-xs text-white/60">Expires in</p>
                      <p className="text-2xl font-black text-[#fbbf24]">{daysRemaining}d</p>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-red-400">Expired</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-xs text-white/60">Auto-renew</span>
                <button
                  id="membership-autorenew-toggle"
                  onClick={toggleAutoRenew}
                  className="flex items-center gap-1.5"
                >
                  {autoRenew ? (
                    <ToggleRight className="w-5 h-5 text-[#0c831f]" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-white/40" />
                  )}
                  <span className={`text-xs font-bold ${autoRenew ? "text-[#4ade80]" : "text-white/40"}`}>
                    {autoRenew ? "On" : "Off"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-20 space-y-4">
        {/* Plan Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLAN_ORDER.map((planKey) => {
            const p = MEMBERSHIP_PLANS[planKey];
            const isSelected = selectedPlan === planKey;
            const isCurrent = currentPlan === planKey;
            return (
              <button
                key={planKey}
                id={`membership-plan-${planKey}`}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${isSelected
                  ? "border-[#ff4f8b] bg-white shadow-lg scale-[1.02]"
                  : "border-[#e8e8e8] bg-white hover:border-[#ff4f8b]/40"
                  }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#0c831f] text-white whitespace-nowrap">
                    CURRENT
                  </span>
                )}
                <span className="text-xs font-black" style={{ color: p.color }}>{p.badge}</span>
                <span className="text-[10px] text-[#999]">
                  {p.price === 0 ? "FREE" : `₹${p.price}/${p.billingCycle === "annual" ? "yr" : "mo"}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Benefits Card */}
        <section className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8e8e8] flex items-center gap-2">
            <Crown className="w-4 h-4" style={{ color: planData.color }} />
            <h2 className="text-sm font-black text-[#1a1a1a]">{planData.name} Benefits</h2>
            {planData.price > 0 && (
              <span className="ml-auto text-xs font-bold text-[#ff4f8b]">
                ₹{planData.price}/{planData.billingCycle === "annual" ? "year" : "month"}
              </span>
            )}
          </div>
          <ul className="divide-y divide-[#f5f5f5]">
            {planData.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="text-xl flex-shrink-0">{b.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{b.title}</p>
                  <p className="text-xs text-[#999]">{b.description}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-[#0c831f] flex-shrink-0 mt-0.5 ml-auto" />
              </li>
            ))}
          </ul>
        </section>

        {/* Wallet Notice */}
        {selectedPlan !== "free" && MEMBERSHIP_PLANS[selectedPlan].price > balance && (
          <div className="bg-[#fff3cd] border border-[#f59e0b]/30 rounded-2xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400e]">
              Insufficient wallet balance. Add ₹{MEMBERSHIP_PLANS[selectedPlan].price - balance} to your wallet first.
            </p>
          </div>
        )}

        {/* Subscribe Button */}
        <button
          id="membership-subscribe-btn"
          onClick={handleSubscribe}
          disabled={isProcessing || selectedPlan === currentPlan}
          className="w-full h-13 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: selectedPlan === "free" ? "#999" : "linear-gradient(135deg, #ff4f8b, #7c3aed)", height: "52px" }}
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : selectedPlan === currentPlan ? (
            <><CheckCircle className="w-4 h-4" /> Already on this plan</>
          ) : selectedPlan === "free" ? (
            "Downgrade to Free"
          ) : (
            <><Crown className="w-4 h-4" /> Subscribe for ₹{MEMBERSHIP_PLANS[selectedPlan].price}</>
          )}
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
              <button onClick={() => setShowCancelModal(false)}>
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>
            <h3 className="text-base font-black text-[#1a1a1a] mb-2">Cancel Membership?</h3>
            <p className="text-sm text-[#666] mb-4">
              You'll lose all premium benefits immediately. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-11 rounded-xl border-2 border-[#e8e8e8] text-sm font-bold text-[#666]"
              >
                Keep Plan
              </button>
              <button
                id="membership-confirm-cancel-btn"
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-1"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

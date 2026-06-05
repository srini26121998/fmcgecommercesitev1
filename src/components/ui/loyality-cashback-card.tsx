"use client";

import { useState } from "react";
import { Star, Gift, TrendingUp, Award, ChevronDown, Clock, ArrowUpRight, ArrowDownLeft, Plus, Minus, Loader2, WifiOff } from "lucide-react";
import { useUserLoyalty } from "@/hooks/use-user-loyalty";
import { useReferralStore } from "@/store/referral-store";
import { TIER_THRESHOLDS } from "@/store/loyalty-store";

const tierIcons: Record<string, React.ElementType> = {
  Silver: Star,
  Gold: Award,
  Platinum: TrendingUp,
  SuperSaver: Gift,
};

const tierColors: Record<string, { bg: string; text: string; icon: string; bar: string }> = {
  Silver: { bg: "bg-[#f2f2f2]", text: "text-[#666]", icon: "text-[#999]", bar: "bg-[#999]" },
  Gold: { bg: "bg-[#fff8e1]", text: "text-[#f57f17]", icon: "text-[#f57f17]", bar: "bg-[#f57f17]" },
  Platinum: { bg: "bg-[#e3f2fd]", text: "text-[#0d47a1]", icon: "text-[#0d47a1]", bar: "bg-[#0d47a1]" },
  SuperSaver: { bg: "bg-[#fce4ec]", text: "text-[#c62828]", icon: "text-[#c62828]", bar: "bg-[#c62828]" },
};

export function LoyaltyCard() {
  const {
    tier,
    points,
    nextTier,
    progressToNextTier,
    pointsToNextTier,
    transactions,
    loading,
    isApiAvailable,
  } = useUserLoyalty();

  const [showHistory, setShowHistory] = useState(false);
  const progress = progressToNextTier;
  const colors = tierColors[tier] || tierColors.Silver;
  const Icon = tierIcons[tier] || Star;
  const totalSavings = 1250;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 shadow-sm">
      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center gap-2 mb-3 py-1 px-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0]">
          <Loader2 className="w-3.5 h-3.5 text-[#0c831f] animate-spin" />
          <span className="text-[10px] font-semibold text-[#0c831f]">Syncing loyalty data…</span>
        </div>
      )}

      {/* API status indicator */}
      {!loading && isApiAvailable && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#0c831f] animate-pulse" />
          <span className="text-[9px] font-medium text-[#999]">Live</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Your Tier</p>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full ${colors.bg}`}>
            <Icon className={`w-4 h-4 ${colors.icon}`} />
            <span className={`text-sm font-black ${colors.text}`}>{tier}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#1a1a1a]">{points}</p>
          <p className="text-[10px] text-[#999]">Points</p>
        </div>
      </div>

      {nextTier && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#666] font-medium">{points} pts</span>
            <span className="text-[#666] font-medium">{pointsToNextTier} pts to {nextTier}</span>
          </div>
          <div className="w-full h-2 bg-[#f2f2f2] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${colors.bar}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e8e8e8]">
        <div className="text-center">
          <p className="text-lg font-black text-[#0c831f]">₹{totalSavings}</p>
          <p className="text-[10px] text-[#999]">Total Savings</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-black ${colors.text}`}>{tier === "SuperSaver" ? "Max" : `${Math.round(progress)}%`}</p>
          <p className="text-[10px] text-[#999]">Progress</p>
        </div>
      </div>

      {/* Point History */}
      <div className="mt-3 pt-3 border-t border-[#e8e8e8]">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full text-xs font-bold text-[#666] hover:text-[#ff4f8b] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Point History ({transactions.length})
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? "rotate-180" : ""}`} />
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-[#999] text-center py-3">No transactions yet</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-lg bg-[#fafafa] p-2.5 border border-[#e8e8e8]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      txn.type === "earned" || txn.type === "bonus" || txn.type === "referral"
                        ? "bg-[#e8f5e9] text-[#0c831f]"
                        : "bg-[#fff0f6] text-[#ff4f8b]"
                    }`}>
                      {txn.type === "earned" || txn.type === "bonus" || txn.type === "referral" ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1a1a1a]">{txn.description}</p>
                      <p className="text-[9px] text-[#999]">{txn.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${txn.points > 0 ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
                    {txn.points > 0 ? "+" : ""}{txn.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReferralCard() {
  const { referralCode, referrals, totalEarned, addReferral } = useReferralStore();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const pendingRewards = referrals.filter((r) => r.status !== "invited").reduce((sum, r) => sum + r.reward, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#fff0f6] flex items-center justify-center">
          <Gift className="w-5 h-5 text-[#ff4f8b]" />
        </div>
        <div>
          <p className="text-sm font-black text-[#1a1a1a]">Refer & Earn</p>
          <p className="text-xs text-[#666]">Invite friends, earn ₹200 each</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-11 rounded-xl bg-[#f2f2f2] border border-dashed border-[#ff4f8b] flex items-center justify-center text-sm font-black text-[#ff4f8b] tracking-wider">
          {referralCode}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="h-11 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#e8f5e9] rounded-xl p-3 text-center">
          <p className="text-lg font-black text-[#0c831f]">₹{totalEarned}</p>
          <p className="text-[10px] text-[#666]">Earned</p>
        </div>
        <div className="bg-[#fff0f6] rounded-xl p-3 text-center">
          <p className="text-lg font-black text-[#ff4f8b]">₹{pendingRewards}</p>
          <p className="text-[10px] text-[#666]">Pending</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-10 rounded-xl border border-[#e8e8e8] px-3 text-sm outline-none focus:border-[#ff4f8b] transition-colors placeholder:text-[#999]"
        />
        <button
          onClick={() => { if (email.trim()) { addReferral(email.trim()); setEmail(""); } }}
          disabled={!email.trim()}
          className="h-10 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors disabled:opacity-50"
        >
          Invite
        </button>
      </div>

      {referrals.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#e8e8e8]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] mb-2">Recent Referrals</p>
          <div className="space-y-2">
            {referrals.slice(0, 3).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#666]">{ref.referredEmail[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1a1a1a]">{ref.referredEmail}</p>
                    <p className="text-[10px] text-[#999] capitalize">{ref.status}</p>
                  </div>
                </div>
                {ref.reward > 0 && (
                  <span className="text-xs font-bold text-[#0c831f]">+₹{ref.reward}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

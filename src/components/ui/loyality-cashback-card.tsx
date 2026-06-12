"use client";

import { useState } from "react";
import { Star, Gift, TrendingUp, Award, ChevronDown, Clock, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle, Loader2 } from "lucide-react";
import { useUserLoyalty } from "@/hooks/use-user-loyalty";
import { useReferralStore, selectTotalEarned, selectPendingEarned } from "@/store/referral-store";
import { useWalletStore } from "@/store/wallet-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

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

// ── LoyaltyCard ──────────────────────────────────────────────
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

  // Dynamic total savings = sum of all cashback / refund credits in wallet
  const walletTxns = useWalletStore((s) => s.transactions);
  const totalSavings = walletTxns
    .filter((t) => t.type === "cashback" || t.type === "refund" || t.type === "gift_card")
    .reduce((sum, t) => sum + t.amount, 0);

  const [showHistory, setShowHistory] = useState(false);
  const progress = progressToNextTier;
  const colors = tierColors[tier] || tierColors.Silver;
  const Icon = tierIcons[tier] || Star;

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
          <p className="text-2xl font-black text-[#1a1a1a]">{points.toLocaleString("en-IN")}</p>
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
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e8e8e8]">
        <div className="text-center">
          <p className="text-lg font-black text-[#0c831f]">₹{totalSavings.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-[#999]">Total Savings</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-black ${colors.text}`}>
            {tier === "SuperSaver" ? "Max" : `${Math.round(progress)}%`}
          </p>
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
              transactions.map((txn, index) => (
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

// ── ReferralCard ─────────────────────────────────────────────
export function ReferralCard() {
  const { referralCode, referrals, addReferral } = useReferralStore();
  const user = useAuthStore((s) => s.user);

  // Dynamically computed from referrals array via selector helpers
  const totalEarned = selectTotalEarned(referrals);
  const pendingJoined = selectPendingEarned(referrals);

  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    // Prevent duplicate
    if (referrals.some((r) => r.referredEmail === trimmed)) {
      toast.error("This email has already been invited");
      return;
    }
    addReferral(trimmed);
    setEmail("");
    toast.success(`Invite sent to ${trimmed}!`, {
      description: "They'll get ₹100 off their first order.",
      duration: 3000,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Referral code copied!", { duration: 2000 });
    });
  };

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

      {/* Referral code */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-11 rounded-xl bg-[#f2f2f2] border border-dashed border-[#ff4f8b] flex items-center justify-center text-sm font-black text-[#ff4f8b] tracking-wider select-all">
          {referralCode}
        </div>
        <button
          onClick={handleCopy}
          className="h-11 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors flex items-center gap-1.5"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#e8f5e9] rounded-xl p-3 text-center">
          <p className="text-lg font-black text-[#0c831f]">₹{totalEarned.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-[#666]">Earned</p>
        </div>
        <div className="bg-[#fff0f6] rounded-xl p-3 text-center">
          <p className="text-lg font-black text-[#ff4f8b]">₹{pendingJoined.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-[#666]">Pending</p>
        </div>
      </div>

      {/* Invite input */}
      <div className="flex gap-2">
        <input
          id="referral-email-input"
          type="email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
          className="flex-1 h-10 rounded-xl border border-[#e8e8e8] px-3 text-sm outline-none focus:border-[#ff4f8b] transition-colors placeholder:text-[#999]"
        />
        <button
          onClick={handleInvite}
          disabled={!email.trim()}
          className="h-10 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors disabled:opacity-50"
        >
          Invite
        </button>
      </div>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#e8e8e8]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] mb-2">Recent Referrals</p>
          <div className="space-y-2">
            {referrals.slice(0, 3).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f2f2f2] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#666]">
                      {ref.referredEmail[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1a1a1a]">{ref.referredEmail}</p>
                    <p className={`text-[10px] capitalize font-medium ${
                      ref.status === "purchased" ? "text-[#0c831f]" :
                      ref.status === "joined" ? "text-[#f57f17]" : "text-[#999]"
                    }`}>
                      {ref.status === "purchased" ? "Purchased ✓" :
                       ref.status === "joined" ? "Joined" : "Invited"}
                    </p>
                  </div>
                </div>
                {ref.reward > 0 ? (
                  <span className="text-xs font-bold text-[#0c831f]">+₹{ref.reward}</span>
                ) : (
                  <span className="text-[10px] text-[#ccc]">₹0</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

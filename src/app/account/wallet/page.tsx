"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  X,
  CheckCircle,
  Loader2,
  Copy,
  ReceiptText,
  Clock,
} from "lucide-react";
import { useWalletStore, WalletTxnType } from "@/store/wallet-store";
import { toast } from "sonner";

const TXN_ICONS: Record<WalletTxnType, React.ReactNode> = {
  topup: <ArrowDownLeft className="w-4 h-4 text-[#0c831f]" />,
  spend: <ArrowUpRight className="w-4 h-4 text-[#ff4f8b]" />,
  refund: <RefreshCw className="w-4 h-4 text-[#0c831f]" />,
  gift_card: <Gift className="w-4 h-4 text-[#7c3aed]" />,
  cashback: <TrendingUp className="w-4 h-4 text-[#0c831f]" />,
};

const TXN_LABEL: Record<WalletTxnType, string> = {
  topup: "Top-Up",
  spend: "Spent",
  refund: "Refund",
  gift_card: "Gift Card",
  cashback: "Cashback",
};

const TOP_UP_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function WalletPage() {
  const { balance, transactions, credit, redeemGiftCard } = useWalletStore();
  const uniqueTransactions = Array.from(new Map(transactions.map(t => [t.id, t])).values());
  const [activeTab, setActiveTab] = useState<"all" | "cashback" | "refund" | "gift_card">("all");
  const [showTopUp, setShowTopUp] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [giftCode, setGiftCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopUp = async () => {
    const amount = selectedAmount ?? parseInt(customAmount, 10);
    if (!amount || amount < 10) {
      toast.error("Minimum top-up is ₹10");
      return;
    }
    setIsProcessing(true);
    // Simulate payment gateway
    await new Promise((r) => setTimeout(r, 1200));
    credit(amount, "Wallet top-up via UPI", "topup");
    toast.success(`₹${amount} added to your wallet! 🎉`);
    setShowTopUp(false);
    setSelectedAmount(null);
    setCustomAmount("");
    setIsProcessing(false);
  };

  const handleGiftCard = async () => {
    if (!giftCode.trim()) {
      toast.error("Enter a gift card code");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    // Demo: codes starting with GC give ₹200
    const amount = giftCode.toUpperCase().startsWith("GC") ? 200 : 0;
    if (amount === 0) {
      toast.error("Invalid or expired gift card code");
      setIsProcessing(false);
      return;
    }
    redeemGiftCard(giftCode, amount);
    toast.success(`Gift card redeemed! ₹${amount} credited to wallet 🎁`);
    setGiftCode("");
    setShowGiftCard(false);
    setIsProcessing(false);
  };

  const filteredTransactions = activeTab === "all" 
    ? uniqueTransactions 
    : uniqueTransactions.filter(t => t.type === activeTab || (activeTab === "refund" && t.type === "refund"));

  return (
    <main className="min-h-screen bg-[#f2f2f2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#ff4f8b] to-[#7c3aed] px-4 pt-8 pb-16 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-6">
            <Link href="/account" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">My Wallet</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black">FMCG Wallet</h1>
          </div>
          <p className="text-4xl font-black mt-4">₹{balance.toLocaleString("en-IN")}</p>
          <p className="text-white/70 text-sm mt-1">Available Balance</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 pb-20 space-y-4">
        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="wallet-topup-btn"
            onClick={() => setShowTopUp(true)}
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md border border-[#e8e8e8] hover:border-[#ff4f8b] hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#fff0f6] flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#ff4f8b]" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Add Money</span>
          </button>
          <button
            id="wallet-giftcard-btn"
            onClick={() => setShowGiftCard(true)}
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md border border-[#e8e8e8] hover:border-[#7c3aed] hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#f5f3ff] flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <span className="text-sm font-bold text-[#1a1a1a]">Gift Card</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#e8f5e9] border border-[#0c831f]/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-[#0c831f] mb-1">💡 How wallet works</p>
          <p className="text-xs text-[#666]">
            Use wallet balance at checkout for instant payment. Cashback and refunds are automatically credited here. No expiry on top-up balance.
          </p>
        </div>

        {/* Transaction History */}
        <section className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#e8e8e8] flex items-center justify-between">
            <h2 className="text-sm font-black text-[#1a1a1a]">Transaction History</h2>
            <button 
              onClick={async () => {
                toast.info("Refreshing transactions...");
                await new Promise(r => setTimeout(r, 1000));
                toast.success("Transactions up to date");
              }}
              className="p-1 hover:bg-[#f5f5f5] rounded-full transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-[#666]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-4 pt-3 gap-2 overflow-x-auto hide-scrollbar border-b border-[#f0f0f0]">
            {[
              { id: "all", label: "All" },
              { id: "cashback", label: "Cashback" },
              { id: "refund", label: "Refunds" },
              { id: "gift_card", label: "Gift Cards" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? "border-[#0c831f] text-[#0c831f]" 
                    : "border-transparent text-[#666] hover:text-[#1a1a1a] hover:bg-[#f9f9f9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[#f5f5f5]">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#999]">
                <ReceiptText className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((txn) => {
                const isPending = txn.status === "pending";
                const isExpired = txn.status === "expired";
                
                return (
                  <div key={txn.id} className={`flex items-center gap-3 px-4 py-4 ${isExpired ? "opacity-50" : ""}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPending ? "bg-[#f5f5f5]" : isExpired ? "bg-[#ffebee]" : "bg-[#e8f5e9]"
                    }`}>
                      {TXN_ICONS[txn.type] || <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-[#1a1a1a] truncate ${isExpired ? "line-through" : ""}`}>
                        {txn.description}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-[10px] text-[#999]">{TXN_LABEL[txn.type]}</p>
                        <span className="text-[#e8e8e8]">•</span>
                        {isPending ? (
                          <p className="text-[10px] text-[#f59e0b] font-semibold flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            Pending (Crediting tomorrow)
                          </p>
                        ) : isExpired ? (
                          <p className="text-[10px] text-[#c62828] font-semibold" title="Cashback expired after 30 days">
                            Expired/Reversed
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#0c831f] font-semibold">
                            Credited on {txn.date}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${
                        isExpired ? "text-[#999] line-through" :
                        txn.delta > 0 && !isPending ? "text-[#0c831f]" : 
                        txn.delta > 0 && isPending ? "text-[#f59e0b]" :
                        "text-[#ff4f8b]"
                      }`}>
                        {txn.delta > 0 ? "+" : ""}₹{Math.abs(txn.delta).toLocaleString("en-IN")}
                      </p>
                      {(!isPending && !isExpired) && (
                        <p className="text-[10px] text-[#999] mt-0.5">Bal: ₹{txn.balanceAfter.toLocaleString("en-IN")}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ── Top-Up Modal ── */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-[#1a1a1a]">Add Money to Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="p-1 hover:bg-[#f5f5f5] rounded-full">
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {TOP_UP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  id={`topup-${amt}`}
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedAmount === amt
                    ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                    : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]/50"
                    }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <input
              id="topup-custom"
              type="number"
              placeholder="Or enter custom amount"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className="w-full h-12 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none focus:border-[#ff4f8b] mb-4"
            />

            <button
              id="topup-confirm-btn"
              onClick={handleTopUp}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              className="w-full h-12 rounded-xl bg-[#ff4f8b] text-white font-black text-sm flex items-center justify-center gap-2 disabled:bg-[#ccc] transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isProcessing ? "Processing..." : `Add ₹${selectedAmount ?? (customAmount || 0)}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Gift Card Modal ── */}
      {showGiftCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-[#1a1a1a]">Redeem Gift Card</h3>
              <button onClick={() => setShowGiftCard(false)} className="p-1 hover:bg-[#f5f5f5] rounded-full">
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>
            <div className="bg-[#f5f3ff] rounded-xl p-3 mb-4 text-xs text-[#7c3aed] font-medium">
              🎁 Demo code: <strong>GC2024FMCG</strong> — credits ₹200 to your wallet
            </div>
            <input
              id="gift-card-input"
              type="text"
              placeholder="Enter gift card code (e.g. GC2024FMCG)"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
              className="w-full h-12 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] px-4 text-sm font-mono font-bold text-[#1a1a1a] outline-none focus:border-[#7c3aed] mb-4 tracking-widest"
            />
            <button
              id="gift-card-redeem-btn"
              onClick={handleGiftCard}
              disabled={isProcessing || !giftCode.trim()}
              className="w-full h-12 rounded-xl bg-[#7c3aed] text-white font-black text-sm flex items-center justify-center gap-2 disabled:bg-[#ccc] transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {isProcessing ? "Validating..." : "Redeem Gift Card"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

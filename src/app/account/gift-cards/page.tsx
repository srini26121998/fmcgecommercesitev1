"use client";
import Link from "next/link";
import { ChevronLeft, Gift, Plus, Copy, Ticket, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GiftCard {
  id: number;
  code: string;
  balance: string;
  expiry: string;
}

const giftCards: GiftCard[] = [
  { id: 1, code: "SAVE2024", balance: "₹500", expiry: "Dec 31, 2024" },
  { id: 2, code: "FESTIVE50", balance: "₹250", expiry: "Jun 30, 2024" },
];

export default function GiftCardsPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!", {
      duration: 2000,
      position: "top-center",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Gift Cards</h1>
          </div>
          <span className="text-xs text-[#666]">{giftCards.length} cards</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-6">

        {/* ── Total Balance Card ── */}
        <div className="bg-gradient-to-br from-[#ff4f8b] via-[#ff4f8b] to-[#e63872] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Gift Card Balance</p>
              <p className="text-3xl font-bold mt-1">₹750</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex-1 h-11 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
              <Plus className="w-4 h-4" />
              Redeem Code
            </button>
            <button className="flex-1 h-11 rounded-xl bg-white text-[#ff4f8b] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
              <Gift className="w-4 h-4" />
              Buy Gift Card
            </button>
          </div>
        </div>

        {/* ── Your Gift Cards ── */}
        <div>
          <h2 className="text-base font-bold text-[#1a1a1a] mb-3 px-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#ff4f8b] inline-block" />
            Your Gift Cards
          </h2>

          {giftCards.length > 0 ? (
            <div className="space-y-3">
              {giftCards.map((card) => (
                <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fff0f6] to-[#ffe0eb] flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-[#ff4f8b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-lg font-bold text-[#1a1a1a]">{card.balance}</span>
                        <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#0c831f] text-[10px] font-bold rounded-full">Active</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono font-semibold text-[#666] tracking-wider">{card.code}</code>
                        <button
                          onClick={() => copyCode(card.id, card.code)}
                          className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                            copiedId === card.id ? "text-[#0c831f]" : "text-[#ff4f8b] hover:text-[#e63872]"
                          }`}
                        >
                          {copiedId === card.id ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedId === card.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#999] mt-1.5">Expires {card.expiry}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#ccc]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#e8e8e8]">
              <div className="w-16 h-16 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-3">
                <Gift className="w-8 h-8 text-[#ccc]" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">No gift cards yet</h3>
              <p className="text-xs text-[#666] mb-4">Redeem a code or buy one for a friend</p>
              <button className="inline-flex h-10 px-5 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors">
                <Plus className="w-4 h-4" />
                Redeem Gift Card
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

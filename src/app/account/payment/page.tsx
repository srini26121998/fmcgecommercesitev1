"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CreditCard, Plus, Edit2, Trash2, Smartphone, CheckCircle, Shield, X, Star, Building2, Ban as Bank } from "lucide-react";
import { useSavedCardsStore, type SavedCard, type CardType, type CardCategory } from "@/store/saved-cards-store";
import { toast } from "sonner";

interface CardFormData {
  type: CardType;
  category: CardCategory;
  cardNumber: string;
  expiry: string;
  holderName: string;
  provider: string;
  isDefault: boolean;
  last4: string;
  maskedNumber: string;
}

const emptyForm: CardFormData = {
  type: "Visa",
  category: "credit",
  cardNumber: "",
  expiry: "",
  holderName: "",
  provider: "",
  isDefault: false,
  last4: "",
  maskedNumber: "",
};

const CARD_TYPE_OPTIONS: { type: CardType; icon: typeof CreditCard; color: string }[] = [
  { type: "Visa", icon: CreditCard, color: "from-blue-700 to-blue-500" },
  { type: "Mastercard", icon: CreditCard, color: "from-orange-500 to-red-500" },
  { type: "RuPay", icon: CreditCard, color: "from-emerald-600 to-emerald-400" },
  { type: "UPI", icon: Smartphone, color: "from-blue-500 to-blue-300" },
];

export default function PaymentPage() {
  const { cards, addCard, updateCard, deleteCard, setDefaultCard, maskCardNumber, fetchCards } = useSavedCardsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CardFormData>({ ...emptyForm });

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (card: SavedCard) => {
    setForm({
      type: card.type,
      category: card.category,
      cardNumber: card.maskedNumber,
      expiry: card.expiry,
      holderName: card.holderName,
      provider: card.provider,
      isDefault: card.isDefault,
      last4: card.last4,
      maskedNumber: card.maskedNumber,
    });
    setEditingId(card.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.holderName.trim() || !form.provider.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.type === "UPI") {
      if (!form.cardNumber.includes("@")) {
        toast.error("Please enter a valid UPI ID (e.g., name@upi)");
        return;
      }
    } else {
      if (!form.cardNumber.replace(/\s/g, "").length) {
        toast.error("Please enter a card number");
        return;
      }
    }

    const last4 = form.type === "UPI" ? form.cardNumber : form.cardNumber.replace(/\s/g, "").slice(-4);
    const masked = form.type === "UPI" ? form.cardNumber : maskCardNumber(form.cardNumber);

    const [month, year] = form.expiry.split("/");
    const expiryMonth = month ? parseInt(month, 10) : undefined;
    const expiryYear = year ? parseInt(`20${year}`, 10) : undefined;

    const payload = {
      token: "tok_dummy", // Assuming some dummy token
      provider: form.provider,
      type: form.type,
      last4,
      expiryMonth,
      expiryYear,
      isDefault: form.isDefault,
    };

    if (editingId) {
      updateCard(editingId, payload);
      toast.success("Payment method updated!");
    } else {
      addCard(payload);
      toast.success("Payment method added!");
    }
    resetForm();
  };

  const handleDelete = (id: number, label: string) => {
    const card = cards.find((c) => c.id === id);
    if (card?.isDefault && cards.filter((c) => c.id !== id).length > 0) {
      toast.error("Set another card as default before removing this one");
      return;
    }
    deleteCard(id);
    toast.success(`${label} removed`);
  };

  const handleSetDefault = (id: number) => {
    setDefaultCard(id);
    toast.success("Default payment method updated!");
  };

  const getCardIcon = (type: CardType) => {
    const opt = CARD_TYPE_OPTIONS.find((o) => o.type === type);
    return opt?.icon || CreditCard;
  };

  const getCardBg = (type: CardType, category: CardCategory) => {
    if (type === "UPI") return "bg-[#e3f2fd] border-[#bbdefb]";
    if (category === "credit") return "bg-gradient-to-br from-[#1a1a1a] to-[#333]";
    return "bg-gradient-to-br from-[#2d5016] to-[#4a8c2a]";
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Payment Methods</h1>
            <p className="text-xs text-[#666]">{cards.length} saved</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-4">

        {/* ── Add / Edit Card Form ── */}
        {showForm && (
          <div className="bg-white rounded-2xl border-2 border-[#ff4f8b]/30 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#1a1a1a]">
                {editingId ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button onClick={resetForm} className="p-1 hover:bg-[#f2f2f2] rounded-full transition-colors">
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            {/* Card Type Selection */}
            <div className="flex gap-2">
              {CARD_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      type: opt.type,
                      category: opt.type === "UPI" ? "upi" : f.category,
                      cardNumber: opt.type === "UPI" ? "" : f.cardNumber,
                    }));
                  }}
                  className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-bold transition-colors ${
                    form.type === opt.type
                      ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                      : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.type}
                </button>
              ))}
            </div>

            {/* Card Category (for non-UPI) */}
            {form.type !== "UPI" && (
              <div className="flex gap-2">
                {(["credit", "debit"] as CardCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-bold capitalize transition-colors ${
                      form.category === cat
                        ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                        : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]"
                    }`}
                  >
                    {cat === "credit" ? <Bank className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Card Number / UPI ID */}
            <input
              placeholder={form.type === "UPI" ? "UPI ID (e.g. name@oksbi) *" : "Card Number *"}
              value={form.cardNumber}
              onChange={(e) => setForm((f) => ({
                ...f,
                cardNumber: f.type === "UPI" ? e.target.value : e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19),
              }))}
              inputMode={form.type === "UPI" ? "email" : "numeric"}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
            />

            {form.type !== "UPI" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Expiry (MM/YY) *"
                  value={form.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
                    setForm((f) => ({ ...f, expiry: val }));
                  }}
                  className="h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
                />
                <input
                  placeholder="Provider Bank *"
                  value={form.provider}
                  onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                  className="h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
                />
              </div>
            )}

            {form.type === "UPI" && (
              <input
                placeholder="UPI Provider (e.g. Google Pay) *"
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
              />
            )}

            <input
              placeholder="Cardholder Name *"
              value={form.holderName}
              onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
            />

            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded border-[#ccc] text-[#ff4f8b] focus:ring-[#ff4f8b]"
              />
              <span className="text-sm font-semibold text-[#1a1a1a]">Set as default payment method</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold hover:bg-[#e63872] transition-colors"
              >
                {editingId ? "Update" : "Save"}
              </button>
              <button
                onClick={resetForm}
                className="h-11 px-5 rounded-xl border border-[#e8e8e8] text-sm font-semibold text-[#666] hover:bg-[#f2f2f2] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Default card indicator */}
        {cards.some((c) => c.isDefault) && !showForm && (
          <div className="flex items-center gap-2 px-1">
            <CreditCard className="w-4 h-4 text-[#0c831f]" />
            <span className="text-xs font-medium text-[#0c831f]">Default payment method</span>
          </div>
        )}

        {/* ── Payment Method Cards ── */}
        {cards.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-[#ccc]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No payment methods saved</h3>
            <p className="text-sm text-[#666] mb-6">Add a card or UPI ID for faster checkout</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        ) : (
          cards.map((card) => {
            const Icon = getCardIcon(card.type);
            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                  card.isDefault ? "border-[#0c831f] ring-1 ring-[#0c831f]/20" : "border-[#e8e8e8]"
                }`}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Card Icon */}
                  <div className={`w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getCardBg(card.type, card.category)}`}>
                    {card.type === "UPI" ? (
                      <Smartphone className="w-5 h-5 text-[#1565c0]" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-[#1a1a1a]">{card.type}</span>
                      <span className="text-[10px] font-medium text-[#666] capitalize">{card.category}</span>
                      {card.isDefault && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#e8f5e9] text-[#0c831f] text-[9px] font-bold rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666] font-mono">{card.maskedNumber}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {card.expiry && <span className="text-[10px] text-[#999]">Expires {card.expiry}</span>}
                      <span className="text-[10px] text-[#999]">{card.provider}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#e8f5e9] transition-colors group"
                        aria-label={`Set ${card.type} as default`}
                      >
                        <Star className="w-3.5 h-3.5 text-[#999] group-hover:text-[#0c831f]" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(card)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#f2f2f2] transition-colors"
                      aria-label={`Edit ${card.type}`}
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#666]" />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id, `${card.type} ending in ${card.last4}`)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#fff0f6] transition-colors"
                      aria-label={`Delete ${card.type}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#ff4f8b]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ── Security Note ── */}
        <div className="flex items-start gap-3 px-1 py-2">
          <Shield className="w-4 h-4 text-[#0c831f] mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-[#999] leading-relaxed">
            Your payment information is stored securely on your device with local encryption.
            We never share your full card details with third parties.
          </p>
        </div>
      </div>
    </main>
  );
}

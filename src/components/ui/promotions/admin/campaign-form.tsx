"use client";

import { useState } from "react";
import type { Campaign, Coupon, ABTest, AudienceTarget, CampaignChannel } from "@/types/promotions";
import { CalendarDays, Target, Users, Zap, Megaphone } from "lucide-react";

// ── CampaignForm Component ───────────────────────────────

interface CampaignFormProps {
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
  initial?: Partial<Campaign>;
}

const channelOptions: { value: CampaignChannel; label: string }[] = [
  { value: "push", label: "Push" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "in_app", label: "In-App" },
  { value: "whatsapp", label: "WhatsApp" },
];

const audienceOptions: { value: AudienceTarget; label: string }[] = [
  { value: "all_users", label: "All Users" },
  { value: "new_users", label: "New Users" },
  { value: "active_users", label: "Active Users" },
  { value: "vip", label: "VIP Members" },
  { value: "at_risk", label: "At Risk" },
  { value: "segment", label: "Segment" },
  { value: "abandoned_cart", label: "Abandoned Cart" },
];

export function CampaignForm({ onSubmit, onCancel, initial }: CampaignFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [channels, setChannels] = useState<CampaignChannel[]>(initial?.channels || []);
  const [audienceTarget, setAudienceTarget] = useState<AudienceTarget>(initial?.audienceTarget || "all_users");
  const [budget, setBudget] = useState(initial?.budget ? initial.budget.replace(/[₹,]/g, "") : "");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChannel = (ch: CampaignChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required"); return; }
    if (channels.length === 0) { setError("Select at least one channel"); return; }
    setSubmitting(true);
    setError(null);
    try {
      let formattedStartDate = startDate;
      if (formattedStartDate && !formattedStartDate.includes("T")) formattedStartDate += "T00:00:00";
      
      let formattedEndDate = endDate;
      if (formattedEndDate && !formattedEndDate.includes("T")) formattedEndDate += "T23:59:59";

      await onSubmit({
        name,
        description,
        channels,
        audienceTarget,
        audience: audienceOptions.find((a) => a.value === audienceTarget)?.label || "All Users",
        budget: budget ? `₹${parseInt(budget).toLocaleString()}` : "₹0",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: initial?.status || "draft",
      });
    } catch {
      setError("Failed to submit campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campaign Name */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Campaign Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Summer Sale 2026"
          className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Campaign objective and details..."
          rows={3}
          className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
        />
      </div>

      {/* Channels */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Channels *</label>
        <div className="flex flex-wrap gap-2">
          {channelOptions.map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => toggleChannel(ch.value)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                channels.includes(ch.value)
                  ? "border-[#0c831f] bg-[#e8f5e9] text-[#0c831f]"
                  : "border-[#e8e8e8] bg-white text-[#666] hover:border-[#d0d0d0]"
              }`}
            >
              {ch.value === "push" ? <Zap className="h-3 w-3" /> :
               ch.value === "email" ? <Megaphone className="h-3 w-3" /> :
               <Target className="h-3 w-3" />}
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Target Audience</label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
          <select
            value={audienceTarget}
            onChange={(e) => setAudienceTarget(e.target.value as AudienceTarget)}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white pl-9 pr-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          >
            {audienceOptions.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Budget (₹)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g., 50000"
          min={0}
          className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white pl-9 pr-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white pl-9 pr-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-60"
        >
          {submitting ? "Creating..." : initial ? "Update Campaign" : "Create Campaign"}
        </button>
      </div>
    </form>
  );
}

// ── CouponGenerator Component ────────────────────────────

interface CouponGeneratorProps {
  onGenerate: (data: Partial<Coupon>) => Promise<void>;
  onCancel: () => void;
}

const couponTypeOptions = [
  { value: "public", label: "Public" },
  { value: "new_user", label: "New User" },
  { value: "vip", label: "VIP" },
  { value: "loyalty", label: "Loyalty" },
  { value: "referral", label: "Referral" },
];

export function CouponGenerator({ onGenerate, onCancel }: CouponGeneratorProps) {
  const [code, setCode] = useState("");
  const [type, setType] = useState("public");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "bogo">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [totalIssued, setTotalIssued] = useState(1000);
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Coupon code is required"); return; }
    if (discountValue <= 0) { setError("Discount value must be greater than 0"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const discountLabel = discountType === "percentage" ? `${discountValue}% Off`
        : discountType === "bogo" ? "Buy 1 Get 1" : `₹${discountValue} Off`;
      let formattedStartDate = startDate;
      if (formattedStartDate && !formattedStartDate.includes("T")) formattedStartDate += "T00:00:00";
      
      let formattedEndDate = endDate;
      if (formattedEndDate && !formattedEndDate.includes("T")) formattedEndDate += "T23:59:59";

      await onGenerate({
        code: code.toUpperCase(),
        type: type as Coupon["type"],
        discountType,
        discountValue,
        discount: discountLabel,
        minOrder,
        maxDiscount: maxDiscount > 0 ? maxDiscount : undefined,
        totalIssued,
        perUserLimit,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    } catch {
      setError("Failed to generate coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Code */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Coupon Code *</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g., SAVE20"
            className="h-10 flex-1 rounded-xl border border-[#e8e8e8] bg-white px-3 font-mono text-sm font-bold text-[#1a1a1a] uppercase outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
          <button
            type="button"
            onClick={generateRandomCode}
            className="rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
          >
            Random
          </button>
        </div>
      </div>

      {/* Type & Discount Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Coupon Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          >
            {couponTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed" | "bogo")}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
            <option value="bogo">BOGO</option>
          </select>
        </div>
      </div>

      {/* Discount Value */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999]">
            {discountType === "percentage" ? "%" : "₹"}
          </span>
          <input
            type="number"
            value={discountValue || ""}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 100"}
            min={0}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white pl-8 pr-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>
      </div>

      {/* Min Order & Max Discount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Min Order (₹)</label>
          <input
            type="number"
            value={minOrder || ""}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            placeholder="0"
            min={0}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Max Discount (₹)</label>
          <input
            type="number"
            value={maxDiscount || ""}
            onChange={(e) => setMaxDiscount(Number(e.target.value))}
            placeholder="Unlimited"
            min={0}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>
      </div>

      {/* Total Issued & Per User */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Total Issued</label>
          <input
            type="number"
            value={totalIssued || ""}
            onChange={(e) => setTotalIssued(Number(e.target.value))}
            min={1}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Per User Limit</label>
          <input
            type="number"
            value={perUserLimit || ""}
            onChange={(e) => setPerUserLimit(Number(e.target.value))}
            min={1}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          />
        </div>
      </div>

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
        <button type="submit" disabled={submitting} className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-60">
          {submitting ? "Generating..." : "Generate Coupon"}
        </button>
      </div>
    </form>
  );
}

// ── ABTestBuilder Component ──────────────────────────────

interface ABTestBuilderProps {
  onSubmit: (data: Partial<ABTest>) => Promise<void>;
  onCancel: () => void;
  initial?: Partial<ABTest>;
}

export function ABTestBuilder({ onSubmit, onCancel, initial }: ABTestBuilderProps) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [variantALabel, setVariantALabel] = useState(initial?.variantA?.label || "");
  const [variantADesc, setVariantADesc] = useState(initial?.variantA?.description || "");
  const [variantBLabel, setVariantBLabel] = useState(initial?.variantB?.label || "");
  const [variantBDesc, setVariantBDesc] = useState(initial?.variantB?.description || "");
  const [audience, setAudience] = useState(initial?.audience || "50% each");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Test name is required"); return; }
    if (!variantALabel.trim() || !variantBLabel.trim()) { setError("Both variant labels are required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name,
        description,
        variantA: {
          label: variantALabel,
          description: variantADesc || undefined,
          impressions: 0,
          conversions: 0,
          revenue: "₹0",
          conversionRate: "—",
        },
        variantB: {
          label: variantBLabel,
          description: variantBDesc || undefined,
          impressions: 0,
          conversions: 0,
          revenue: "₹0",
          conversionRate: "—",
        },
        audience,
        status: "draft",
      });
    } catch {
      setError("Failed to create A/B test");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Test Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Homepage Banner CTA Test"
          className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you testing and why?"
          rows={2}
          className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
        />
      </div>

      {/* Variants */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#2563eb]">Variant A</p>
          <div className="space-y-2">
            <input
              type="text"
              value={variantALabel}
              onChange={(e) => setVariantALabel(e.target.value)}
              placeholder="e.g., Shop Now"
              className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 text-xs text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#2563eb]"
            />
            <input
              type="text"
              value={variantADesc}
              onChange={(e) => setVariantADesc(e.target.value)}
              placeholder="Description (optional)"
              className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 text-xs text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#2563eb]"
            />
          </div>
        </div>
        <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#9333ea]">Variant B</p>
          <div className="space-y-2">
            <input
              type="text"
              value={variantBLabel}
              onChange={(e) => setVariantBLabel(e.target.value)}
              placeholder="e.g., Explore Deals"
              className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 text-xs text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#9333ea]"
            />
            <input
              type="text"
              value={variantBDesc}
              onChange={(e) => setVariantBDesc(e.target.value)}
              placeholder="Description (optional)"
              className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-2.5 text-xs text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#9333ea]"
            />
          </div>
        </div>
      </div>

      {/* Audience Split */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#666]">Audience Split</label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
        >
          <option value="50% each">50% / 50%</option>
          <option value="25% each">25% / 25% (50% control)</option>
          <option value="10% each">10% / 10% (80% control)</option>
        </select>
      </div>

      {error && <p className="text-xs font-bold text-[#dc2626]">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
        <button type="submit" disabled={submitting} className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-60">
          {submitting ? "Creating..." : initial ? "Update Test" : "Create Test"}
        </button>
      </div>
    </form>
  );
}

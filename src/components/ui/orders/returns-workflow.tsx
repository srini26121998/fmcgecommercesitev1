"use client";

import { useState } from "react";
import { RotateCcw, X, CheckCircle2, Truck, AlertCircle, Camera, Package, ChevronRight, Loader2 } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { toast } from "sonner";

type ReturnReason = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

const RETURN_REASONS: ReturnReason[] = [
  { id: "defective", label: "Defective / Damaged", icon: "🔧", description: "Product arrived broken or not working" },
  { id: "wrong_item", label: "Wrong Item", icon: "📦", description: "Received a different product than ordered" },
  { id: "not_as_described", label: "Not as Described", icon: "❌", description: "Doesn't match the product listing" },
  { id: "expired", label: "Expired / Near Expiry", icon: "⏰", description: "Product is past expiration date" },
  { id: "missing", label: "Missing Items", icon: "🔍", description: "Some items were not in the package" },
  { id: "quality", label: "Quality Issue", icon: "⚠️", description: "Product quality is unsatisfactory" },
  { id: "other", label: "Other", icon: "💬", description: "Something else" },
];

interface ReturnItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ReturnsWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: ReturnItem[];
  onSubmitReturn: (data: {
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    reason: string;
    details: string;
    resolution: string;
  }) => void;
}

type Step = "select_item" | "select_reason" | "details" | "resolution" | "confirm" | "submitted";

export default function ReturnsWorkflow({ isOpen, onClose, orderId, items, onSubmitReturn }: ReturnsWorkflowProps) {
  const [step, setStep] = useState<Step>("select_item");
  const [selectedItem, setSelectedItem] = useState<ReturnItem | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [resolution, setResolution] = useState<"wallet" | "replacement">("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnId, setReturnId] = useState("");

  if (!isOpen) return null;

  function resetFlow() {
    setStep("select_item");
    setSelectedItem(null);
    setSelectedReason("");
    setDetails("");
    setResolution("wallet");
    setIsSubmitting(false);
  }

  function handleClose() {
    resetFlow();
    onClose();
  }

  function handleSubmit() {
    if (!selectedItem || !selectedReason) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const id = `RET-${Date.now().toString(36).toUpperCase()}`;
      setReturnId(id);
      onSubmitReturn({
        orderId,
        productId: String(selectedItem.id),
        productName: selectedItem.name,
        productImage: selectedItem.image,
        quantity: selectedItem.quantity,
        reason: selectedReason,
        details,
        resolution,
      });
      setStep("submitted");
      setIsSubmitting(false);
    }, 2000);
  }

  const progressSteps = ["Select Item", "Reason", "Details", "Resolution", "Confirm"];
  const stepIndex = ["select_item", "select_reason", "details", "resolution", "confirm"].indexOf(step as string);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8] sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fff0f6] flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-[#ff4f8b]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1a1a]">Return Request</h2>
              <p className="text-[10px] text-[#999]">Order {orderId}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-[#fafafa] border-b border-[#e8e8e8]">
          <div className="flex items-center gap-0">
            {progressSteps.map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 ${i <= stepIndex ? "text-[#0c831f]" : "text-[#ccc]"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    i < stepIndex ? "bg-[#0c831f] text-white" :
                    i === stepIndex ? "border-2 border-[#0c831f] text-[#0c831f]" :
                    "border-2 border-[#e8e8e8] text-[#ccc]"
                  }`}>
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span className="text-[9px] font-semibold hidden sm:inline">{label}</span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${i < stepIndex ? "bg-[#0c831f]" : "bg-[#e8e8e8]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "submitted" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#0c831f]" />
              </div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Return Submitted!</h3>
              <p className="text-sm text-[#666] mb-1">Return ID: <span className="font-bold text-[#ff4f8b]">{returnId}</span></p>
              <p className="text-xs text-[#999] max-w-sm">
                We&apos;ll review your request and get back to you within 24 hours. A pickup will be scheduled if approved.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 h-11 px-8 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold hover:bg-[#e63872] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Select Item */}
              {step === "select_item" && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#1a1a1a] mb-3">Which item do you want to return?</p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setStep("select_reason"); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        selectedItem?.id === item.id ? "border-[#ff4f8b] bg-[#fff0f6]" : "border-[#e8e8e8] hover:border-[#ff4f8b]"
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-[#f2f2f2] overflow-hidden flex-shrink-0">
                        <SafeImage src={item.image} alt={item.name} fill className="object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{item.name}</p>
                        <p className="text-xs text-[#999]">Qty: {item.quantity} · {item.price * item.quantity}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#999]" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Select Reason */}
              {step === "select_reason" && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#1a1a1a] mb-3">Why are you returning this item?</p>
                  {RETURN_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => { setSelectedReason(reason.id); setStep("details"); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        selectedReason === reason.id ? "border-[#ff4f8b] bg-[#fff0f6]" : "border-[#e8e8e8] hover:border-[#ff4f8b]"
                      }`}
                    >
                      <span className="text-lg">{reason.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1a1a1a]">{reason.label}</p>
                        <p className="text-[10px] text-[#999]">{reason.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#999]" />
                    </button>
                  ))}
                  <button onClick={() => setStep("select_item")} className="text-xs font-semibold text-[#ff4f8b] hover:underline mt-2">
                    ← Back to item selection
                  </button>
                </div>
              )}

              {/* Step 3: Details */}
              {step === "details" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] mb-1">Describe the issue</p>
                    <p className="text-xs text-[#999] mb-3">Please provide as much detail as possible to help us process your return quickly.</p>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Tell us what went wrong..."
                      rows={4}
                      className="w-full rounded-xl border border-[#e8e8e8] px-4 py-3 text-sm outline-none focus:border-[#ff4f8b] transition-colors resize-none placeholder:text-[#999]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#666] mb-2 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Add photos (optional)
                    </p>
                    <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-dashed border-[#e8e8e8] text-xs font-semibold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors">
                      <Camera className="w-4 h-4" />
                      Upload photos
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep("select_reason")} className="flex-1 h-11 rounded-xl border-2 border-[#e8e8e8] text-xs font-bold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors">
                      Back
                    </button>
                    <button
                      onClick={() => setStep("resolution")}
                      disabled={!details.trim()}
                      className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold disabled:bg-[#ccc] disabled:cursor-not-allowed hover:bg-[#e63872] transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3.5: Resolution */}
              {step === "resolution" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#1a1a1a] mb-3">How would you like this resolved?</p>
                  
                  <button
                    onClick={() => setResolution("wallet")}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                      resolution === "wallet" ? "border-[#ff4f8b] bg-[#fff0f6]" : "border-[#e8e8e8] hover:border-[#ff4f8b]"
                    }`}
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${resolution === "wallet" ? "border-[#ff4f8b]" : "border-[#ccc]"}`}>
                      {resolution === "wallet" && <div className="w-2.5 h-2.5 rounded-full bg-[#ff4f8b]" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Refund to Wallet</p>
                      <p className="text-xs text-[#666] mt-1">Get refund instantly to your wallet once pickup is complete.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setResolution("replacement")}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                      resolution === "replacement" ? "border-[#ff4f8b] bg-[#fff0f6]" : "border-[#e8e8e8] hover:border-[#ff4f8b]"
                    }`}
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${resolution === "replacement" ? "border-[#ff4f8b]" : "border-[#ccc]"}`}>
                      {resolution === "replacement" && <div className="w-2.5 h-2.5 rounded-full bg-[#ff4f8b]" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Replacement</p>
                      <p className="text-xs text-[#666] mt-1">We will send a new item when we pick up the return.</p>
                    </div>
                  </button>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep("details")} className="flex-1 h-11 rounded-xl border-2 border-[#e8e8e8] text-xs font-bold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors">
                      Back
                    </button>
                    <button
                      onClick={() => setStep("confirm")}
                      className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === "confirm" && selectedItem && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#1a1a1a]">Confirm Return Details</p>

                  <div className="bg-[#fafafa] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#e8e8e8]">
                      <div className="relative w-12 h-12 rounded-lg bg-[#f2f2f2] overflow-hidden flex-shrink-0">
                        <SafeImage src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{selectedItem.name}</p>
                        <p className="text-xs text-[#999]">Qty: {selectedItem.quantity}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] text-[#999]">Reason</p>
                        <p className="text-xs font-semibold text-[#1a1a1a]">{RETURN_REASONS.find((r) => r.id === selectedReason)?.label}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#999]">Resolution</p>
                        <p className="text-xs font-semibold text-[#1a1a1a] capitalize">{resolution}</p>
                      </div>
                    </div>

                    {details && (
                      <div className="pt-2 border-t border-[#e8e8e8]">
                        <p className="text-[10px] text-[#999]">Details</p>
                        <p className="text-xs text-[#666] mt-0.5">{details}</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#ff4f8b]/20 bg-[#fff0f6] p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#ff4f8b] mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-[#666] leading-relaxed">
                      Once submitted, our team will review your request within 24 hours. If approved, a pickup will be scheduled at your address.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep("resolution")} className="flex-1 h-11 rounded-xl border-2 border-[#e8e8e8] text-xs font-bold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold disabled:bg-[#ccc] disabled:cursor-not-allowed hover:bg-[#e63872] transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Return"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

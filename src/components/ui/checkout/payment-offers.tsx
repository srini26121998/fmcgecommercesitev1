"use client";

import { memo, useState } from "react";
import { CreditCard, Tag, CheckCircle2 } from "lucide-react";

interface PaymentOffer {
  id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  applicableMethods: string[];
}

const SAMPLE_OFFERS: PaymentOffer[] = [
  {
    id: "hdfc10",
    title: "10% Instant Discount on HDFC Credit Cards",
    description: "Save up to ₹500 on orders above ₹1500.",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 1500,
    applicableMethods: ["HDFC_CC"]
  },
  {
    id: "icici200",
    title: "Flat ₹200 off on ICICI Net Banking",
    description: "Valid on grocery orders above ₹1000.",
    discountType: "fixed",
    discountValue: 200,
    minOrderValue: 1000,
    applicableMethods: ["ICICI_NB"]
  },
  {
    id: "simpl15",
    title: "15% Cashback with Simpl",
    description: "Get 15% cashback up to ₹250 on your first Simpl transaction.",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 500,
    applicableMethods: ["SIMPL_BNPL"]
  }
];

export function PaymentOffers({ 
  orderTotal, 
  selectedMethod,
  onOfferApply
}: { 
  orderTotal: number, 
  selectedMethod: string | null,
  onOfferApply: (offer: PaymentOffer | null) => void 
}) {
  const [appliedOfferId, setAppliedOfferId] = useState<string | null>(null);

  const handleApply = (offer: PaymentOffer) => {
    if (appliedOfferId === offer.id) {
      setAppliedOfferId(null);
      onOfferApply(null);
    } else {
      setAppliedOfferId(offer.id);
      onOfferApply(offer);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8e8e8] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-[#1a1a1a]">Bank & Payment Offers</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {SAMPLE_OFFERS.map((offer) => {
          const isEligible = orderTotal >= offer.minOrderValue;
          const isSelectedMethod = selectedMethod ? offer.applicableMethods.includes(selectedMethod) : true;
          const isActive = isEligible && isSelectedMethod;
          const isApplied = appliedOfferId === offer.id;
          
          return (
            <div 
              key={offer.id} 
              className={`border rounded-lg p-3 transition-colors ${isApplied ? 'border-indigo-500 bg-indigo-50/50' : isActive ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-100 opacity-60'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <CreditCard className={`w-4 h-4 mt-0.5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <div>
                    <h4 className={`text-sm font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{offer.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{offer.description}</p>
                    {!isEligible && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">Add ₹{offer.minOrderValue - orderTotal} more to avail this offer.</p>
                    )}
                  </div>
                </div>
                
                {isActive && (
                  <button
                    onClick={() => handleApply(offer)}
                    className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${isApplied ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    {isApplied ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> APPLIED</span>
                    ) : (
                      'APPLY'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PaymentOffers);

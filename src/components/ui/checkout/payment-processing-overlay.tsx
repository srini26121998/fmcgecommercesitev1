"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface PaymentProcessingOverlayProps {
  isOpen: boolean;
  paymentMethod: string | null;
  onSuccess: () => void;
  onFailure: () => void;
}

export default function PaymentProcessingOverlay({
  isOpen,
  paymentMethod,
  onSuccess,
  onFailure,
}: PaymentProcessingOverlayProps) {
  const [status, setStatus] = useState<"processing" | "success" | "failure">("processing");

  useEffect(() => {
    if (isOpen) {
      setStatus("processing");
      // Simulate payment gateway delay (e.g. 3-4 seconds)
      const timer1 = setTimeout(() => {
        // Assume 90% success rate for simulation
        const isSuccess = Math.random() > 0.1;
        setStatus(isSuccess ? "success" : "failure");

        const timer2 = setTimeout(() => {
          if (isSuccess) {
            onSuccess();
          } else {
            onFailure();
          }
        }, 1500);
        return () => clearTimeout(timer2);
      }, 3000);

      return () => clearTimeout(timer1);
    }
  }, [isOpen, onSuccess, onFailure]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        {status === "processing" && (
          <>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#ff4f8b]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#ff4f8b] border-t-transparent animate-spin"></div>
              <Loader2 className="h-8 w-8 text-[#ff4f8b] animate-spin" />
            </div>
            <h3 className="mt-6 text-lg font-black text-[#1a1a1a]">Processing Payment</h3>
            <p className="mt-2 text-center text-sm font-medium text-[#666]">
              Please don't close this window or press back.
            </p>
            <div className="mt-4 rounded-xl bg-[#f9f9f9] px-4 py-2 border border-[#e8e8e8]">
              <p className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                Method: {paymentMethod || "Unknown"}
              </p>
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5e9] animate-bounce">
              <CheckCircle className="h-10 w-10 text-[#0c831f]" />
            </div>
            <h3 className="mt-6 text-lg font-black text-[#0c831f]">Payment Successful</h3>
            <p className="mt-2 text-center text-sm font-medium text-[#666]">
              Redirecting to order confirmation...
            </p>
          </>
        )}
        {status === "failure" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffebee] animate-shake">
              <XCircle className="h-10 w-10 text-[#c62828]" />
            </div>
            <h3 className="mt-6 text-lg font-black text-[#c62828]">Payment Failed</h3>
            <p className="mt-2 text-center text-sm font-medium text-[#666]">
              Insufficient funds or timeout. Please try again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

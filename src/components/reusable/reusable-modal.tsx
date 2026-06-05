"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ReusableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[95vw] sm:max-h-[95vh]",
};

export default function ReusableModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  footer,
  className = "",
}: ReusableModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative w-full
          ${sizeClasses[size]}
          bg-white shadow-2xl
          /* Mobile: bottom sheet style */
          rounded-t-2xl sm:rounded-2xl
          max-h-[90vh] sm:max-h-[85vh]
          animate-slide-up sm:animate-modal-in
          flex flex-col
          ${className}
        `}
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e8e8e8] px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-[#1a1a1a] truncate">{title}</h2>
            {subtitle && <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#666] truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a] transition-colors flex-shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 flex-1 overflow-y-auto min-h-0"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#ccc transparent" }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 sm:gap-3 border-t border-[#e8e8e8] bg-[#f9fafb] px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl flex-shrink-0 safe-area-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

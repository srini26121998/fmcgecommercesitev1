"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ReusableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function ReusableModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: ReusableModalProps) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizeClasses[size]} modal-responsive animate-modal-in rounded-2xl border border-[#e8e8e8] bg-white shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e8e8e8] px-5 sm:px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-[#1a1a1a]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[#666]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 sm:px-6 py-4 flex-1 modal-body min-h-0">{children}</div>
      </div>
    </div>
  );
}

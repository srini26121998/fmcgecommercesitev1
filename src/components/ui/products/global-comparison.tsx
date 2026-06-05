"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useComparisonStore } from "@/store/comparison-store";
import ComparisonDrawer from "@/components/ui/products/comparison-drawer";

export default function GlobalComparison() {
  const [showComparison, setShowComparison] = useState(false);
  const comparisonCount = useComparisonStore((s) => s.comparison.length);

  if (comparisonCount === 0) return null;

  return (
    <>
      {/* Comparison Floating Button */}
      <button
        onClick={() => setShowComparison(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-[60] min-w-[44px] min-h-[44px] h-12 px-4 rounded-full bg-[#0c831f] text-white shadow-lg flex items-center gap-2 hover:bg-[#0a6e1a] active:scale-95 transition-all duration-200"
        aria-label={`Compare ${comparisonCount} products`}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-xs font-bold">Compare ({comparisonCount})</span>
      </button>

      {/* Comparison Drawer */}
      <ComparisonDrawer
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
}

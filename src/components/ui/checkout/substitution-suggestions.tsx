"use client";

import { useState, useMemo } from "react";
import { RefreshCw, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { useProducts } from "@/hooks/use-products";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface SubstitutionSuggestion {
  originalId: string | number;
  originalName: string;
  suggestedId: string | number;
  suggestedName: string;
  suggestedPrice: number;
  saving: number;
}

interface SubstitutionSuggestionsProps {
  cartItems: CartItem[];
  onApply: (originalId: string | number, suggestedId: string | number) => void;
}

export default function SubstitutionSuggestions({ cartItems, onApply }: SubstitutionSuggestionsProps) {
  const { products } = useProducts();
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => {
    const result: SubstitutionSuggestion[] = [];
    const similarProducts = products.filter((p) => p.stock > 0);

    for (const item of cartItems) {
      const original = products.find((p) => String(p.id) === String(item.id));
      if (!original) continue;

      const cheaper = similarProducts
        .filter(
          (p) =>
            String(p.id) !== String(original.id) &&
            p.category === original.category &&
            p.price < original.price &&
            p.stock > 0 &&
            (p.rating ?? 4.5) >= (original.rating ?? 4.5) - 0.5
        )
        .sort((a, b) => a.price - b.price)
        .slice(0, 1);

      if (cheaper.length > 0) {
        result.push({
          originalId: original.id,
          originalName: original.name,
          suggestedId: cheaper[0].id,
          suggestedName: cheaper[0].name,
          suggestedPrice: cheaper[0].price,
          saving: (original.price - cheaper[0].price) * item.quantity,
        });
      }
    }

    return result;
  }, [cartItems, products]);

  const totalSavings = suggestions.reduce((acc, s) => acc + s.saving, 0);

  if (suggestions.length === 0) return null;

  function handleApply(suggestion: SubstitutionSuggestion) {
    const key = `${suggestion.originalId}-${suggestion.suggestedId}`;
    setApplied((prev) => new Set(prev).add(key));
    onApply(suggestion.originalId, suggestion.suggestedId);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
      <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-4 py-3">
        <RefreshCw className="h-4 w-4 text-[#0c831f]" />
        <h2 className="text-sm font-black text-[#1a1a1a]">Substitution Suggestions</h2>
        {totalSavings > 0 && (
          <span className="text-[10px] font-bold text-[#0c831f] bg-[#e8f5e9] px-1.5 py-0.5 rounded-full">
            Save ₹{totalSavings}
          </span>
        )}
      </div>

      <div className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-[#0c831f] hover:underline mb-3"
        >
          <TrendingDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Hide suggestions" : `Save ₹${totalSavings} with cheaper alternatives`}
        </button>

        {expanded && (
          <div className="space-y-3 animate-fade-down">
            {suggestions.map((suggestion) => {
              const key = `${suggestion.originalId}-${suggestion.suggestedId}`;
              const isApplied = applied.has(key);
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-3 transition-colors ${isApplied
                      ? "border-[#0c831f] bg-[#e8f5e9]"
                      : "border-[#e8e8e8] hover:border-[#0c831f]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#999] line-through">{suggestion.originalName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-bold text-[#1a1a1a]">{suggestion.suggestedName}</p>
                        {!isApplied && (
                          <span className="text-[9px] font-bold text-white bg-[#ff4f8b] px-1.5 py-0.5 rounded-full">
                            Save ₹{suggestion.saving}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-[#0c831f]">₹{suggestion.suggestedPrice}</span>
                        <ArrowRight className="w-3 h-3 text-[#999]" />
                        <span className="text-xs text-[#999] line-through">
                          ₹{products.find((p) => String(p.id) === String(suggestion.originalId))?.price ?? ""}
                        </span>
                      </div>
                    </div>

                    {isApplied ? (
                      <div className="flex items-center gap-1 text-[#0c831f]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs font-bold">Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(suggestion)}
                        className="flex-shrink-0 h-9 px-4 rounded-lg bg-[#0c831f] text-white text-xs font-bold hover:bg-[#0a6e1a] transition-colors"
                      >
                        Use this
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

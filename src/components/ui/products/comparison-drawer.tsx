"use client";

import { Fragment, useState, useEffect, useCallback } from "react";

import { X, BarChart3, Star, Trash2, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useComparisonStore, type ComparisonItem } from "@/store/comparison-store";
import { useEscapeKey } from "@/lib/hooks/useKeyboardNavigation";
import { SafeProductImage } from "@/components/ui/safe-image";
import { useProductCompare } from "@/hooks/use-products";

interface ComparisonDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ComparisonDrawer({
  open,
  onClose,
}: ComparisonDrawerProps) {
  const { comparison, removeFromComparison, clearComparison } =
    useComparisonStore();
  const { loadCompare, loading: apiLoading } = useProductCompare();

  // Enriched product data from the API (keyed by product id)
  const [apiData, setApiData] = useState<Record<string, any>>({});

  // Call GET /api/v1/products/compare whenever the drawer opens with items
  useEffect(() => {
    if (!open || comparison.length === 0) return;
    const ids = comparison.map((i) => String(i.id));
    loadCompare(ids).then((results) => {
      if (results && results.length > 0) {
        const map: Record<string, any> = {};
        results.forEach((p: any) => {
          const key = String(p.id || p._id);
          map[key] = p;
        });
        setApiData(map);
      }
    });
  }, [open, comparison.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper: get enriched API field for a comparison item
  const getApiField = useCallback(
    (item: ComparisonItem, field: string) => apiData[String(item.id)]?.[field],
    [apiData]
  );

  useEscapeKey(open, onClose);

  if (!open) return null;

  const features = [
    {
      label: "Price",
      render: (item: ComparisonItem) => (
        <span className="text-sm font-black text-[#1a1a1a]">₹{item.price}</span>
      ),
    },
    {
      label: "Old Price",
      render: (item: ComparisonItem) => (
        <span className="text-xs text-[#999] line-through">₹{item.oldPrice}</span>
      ),
    },
    {
      label: "Discount",
      render: (item: ComparisonItem) => {
        const discount = Math.round(
          ((item.oldPrice - item.price) / item.oldPrice) * 100
        );
        return discount > 0 ? (
          <span className="text-xs font-bold text-[#ff4f8b] bg-[#fff0f6] px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        ) : (
          <span className="text-xs text-[#ccc]">—</span>
        );
      },
    },
    {
      label: "Rating",
      render: (item: ComparisonItem) => (
        <div className="flex items-center gap-1 bg-[#0c831f] text-white text-xs font-bold px-2 py-1 rounded-lg">
          <Star className="w-3 h-3 fill-white" />
          {item.rating}
        </div>
      ),
    },
    {
      label: "Brand",
      render: (item: ComparisonItem) => {
        const brand = getApiField(item, "brand") || getApiField(item, "brandName");
        return brand
          ? <span className="text-xs font-semibold text-[#1a1a1a]">{brand}</span>
          : <span className="text-xs text-[#ccc]">—</span>;
      },
    },
    {
      label: "Weight / Volume",
      render: (item: ComparisonItem) => {
        const weight = getApiField(item, "weight") || getApiField(item, "unit") || getApiField(item, "unitValue");
        return weight
          ? <span className="text-xs font-semibold text-[#666]">{weight}</span>
          : <span className="text-xs text-[#ccc]">—</span>;
      },
    },
    {
      label: "Category",
      render: (item: ComparisonItem) => (
        <span className="text-xs font-semibold text-[#666] capitalize">
          {item.category.replace(/-/g, " ")}
        </span>
      ),
    },
    {
      label: "Stock",
      render: (item: ComparisonItem) => {
        const stockColors: Record<string, string> = {
          in_stock: "text-[#0c831f] bg-[#e8f5e9]",
          low_stock: "text-[#f59e0b] bg-[#fef3c7]",
          out_of_stock: "text-[#ff4f8b] bg-[#fff0f6]",
        };
        return (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              stockColors[item.stock] ?? ""
            }`}
          >
            {item.stock === "in_stock"
              ? "In Stock"
              : item.stock === "low_stock"
              ? "Few left"
              : "Sold Out"}
          </span>
        );
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#e8e8e8] flex-shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ff4f8b]" />
            <h2 className="text-lg font-bold text-[#1a1a1a]">Compare</h2>
            {comparison.length > 0 && (
              <span className="text-xs font-semibold text-[#ff4f8b] bg-[#ff4f8b]/10 px-2 py-0.5 rounded-full">
                {comparison.length} / 4
              </span>
            )}
            {/* API sync indicator */}
            {comparison.length > 0 && (
              apiLoading ? (
                <span className="flex items-center gap-1 text-[10px] text-[#999] font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </span>
              ) : Object.keys(apiData).length > 0 ? (
                <span className="flex items-center gap-1 text-[10px] text-[#0c831f] font-bold bg-[#e8f5e9] px-2 py-0.5 rounded-full">
                  ✓ Live data
                </span>
              ) : null
            )}
          </div>
          <div className="flex items-center gap-2">
            {comparison.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs font-semibold text-[#999] hover:text-[#ff4f8b] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#ff4f8b]/5 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#f2f2f2] rounded-full transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* API loading skeleton */}
          {apiLoading && comparison.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto py-4">
              {comparison.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-3 min-w-[140px]">
                  <div className="w-28 h-28 rounded-xl bg-[#f2f2f2] animate-pulse" />
                  <div className="h-3 w-24 rounded-full bg-[#f2f2f2] animate-pulse" />
                  <div className="h-3 w-16 rounded-full bg-[#f2f2f2] animate-pulse" />
                </div>
              ))}
            </div>
          ) : comparison.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-[#ccc]" />
              </div>
              <p className="text-sm font-semibold text-[#1a1a1a]">
                No products to compare
              </p>
              <p className="text-xs text-[#999] mt-1">
                Tap the compare icon on products to add them here
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 mt-4 h-10 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-semibold hover:bg-[#e63872] transition-colors"
                onClick={onClose}
              >
                <Plus className="w-3.5 h-3.5" />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="min-w-[600px]">
                {/* Comparison Table */}
                <div className="grid gap-x-4" style={{ gridTemplateColumns: `120px repeat(${comparison.length}, 1fr)` }}>
                  {/* Header Row (Images & Names) */}
                  <div className="invisible" /> {/* Empty cell for top-left */}
                  
                  {comparison.map((item) => (
                    <div key={item.id} className="flex flex-col items-center text-center pb-4">
                      <div className="relative w-28 h-28 rounded-xl bg-[#f2f2f2] mb-3 shadow-sm shrink-0">
                        <SafeProductImage
                          src={item.image}
                          alt={item.name}
                          className="object-cover rounded-xl"
                          loading="lazy"
                          fill
                        />
                        <button
                          onClick={() => removeFromComparison(item.id)}
                          className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-[#e8e8e8] flex items-center justify-center hover:bg-[#fff0f6] hover:border-[#ff4f8b] transition-colors"
                          aria-label={`Remove ${item.name} from comparison`}
                        >
                          <X className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-[#1a1a1a] leading-tight line-clamp-2 max-w-[140px]">
                        {item.name}
                      </p>
                    </div>
                  ))}

                  {/* Feature Rows */}
                  {features.map((feature) => (
                    <Fragment key={feature.label}>
                      {/* Row Label */}
                      <div className="flex items-center text-[11px] font-bold text-[#999] uppercase tracking-wider py-4 border-t border-[#f2f2f2]">
                        {feature.label}
                      </div>

                      {/* Row Values */}
                      {comparison.map((item) => (
                        <div key={`${item.id}-${feature.label}`} className="flex items-center justify-center py-4 border-t border-[#f2f2f2]">
                          {feature.render(item)}
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {comparison.length > 0 && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-[#e8e8e8] bg-white">
            <p className="text-xs text-center text-[#999]">
              Comparing {comparison.length} product{comparison.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

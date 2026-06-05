"use client";

import { useState } from "react";
import { ShoppingBag, RotateCcw, Plus, Check, X, ChevronRight, Clock } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { orderService } from "@/services/orders.service";

interface ReorderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ReorderFromHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderDate: string;
  items: ReorderItem[];
}

export default function ReorderFromHistory({ isOpen, onClose, orderId, orderDate, items }: ReorderFromHistoryProps) {
  const { cart, addToCart, increaseQuantity } = useCartStore();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(items.map((i) => i.id)));
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const itemTotal = items
    .filter((i) => selectedItems.has(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const toggleItem = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function handleReorder() {
    setIsAdding(true);
    const toAdd = items.filter((i) => selectedItems.has(i.id));

    try {
      const res = await orderService.reorder(orderId);

      let addedCount = 0;
      for (const item of toAdd) {
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
          for (let i = 0; i < item.quantity; i++) {
            increaseQuantity(item.id);
          }
        } else {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          });
        }
        addedCount++;
      }

      toast.success(res.message || `${addedCount} item${addedCount > 1 ? "s" : ""} added to cart! 🛒`);
      onClose();
    } catch (err: any) {
      console.warn("Reorder API failed:", err);
      // Fallback to local
      let addedCount = 0;
      for (const item of toAdd) {
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
          for (let i = 0; i < item.quantity; i++) {
            increaseQuantity(item.id);
          }
        } else {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          });
        }
        addedCount++;
      }
      toast.success(`${addedCount} item${addedCount > 1 ? "s" : ""} added to cart! 🛒`);
      onClose();
    } finally {
      setIsAdding(false);
    }
  }

  function selectAll() {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i) => i.id)));
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-[#0c831f]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1a1a]">Reorder</h2>
              <p className="text-[10px] text-[#999]">From {orderId} · {orderDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* Select all */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e8e8e8] bg-[#fafafa]">
          <button onClick={selectAll} className="flex items-center gap-2 text-xs font-semibold text-[#666] hover:text-[#ff4f8b] transition-colors">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              selectedItems.size === items.length ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc]"
            }`}>
              {selectedItems.size === items.length && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            {selectedItems.size === items.length ? "Deselect all" : "Select all"} ({items.length})
          </button>
          <span className="text-[10px] font-semibold text-[#999]">{selectedItems.size} of {items.length} selected</span>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {items.map((item) => {
            const isSelected = selectedItems.has(item.id);
            const inCart = cart.find((c) => c.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  isSelected
                    ? "border-[#ff4f8b] bg-[#fff0f6]"
                    : "border-[#e8e8e8] hover:border-[#ff4f8b] opacity-60"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc]"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="relative w-12 h-12 rounded-lg bg-[#f2f2f2] overflow-hidden flex-shrink-0">
                  <SafeImage src={item.image} alt={item.name} fill className="object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-[#1a1a1a]">₹{item.price}</span>
                    <span className="text-[10px] text-[#999]">× {item.quantity}</span>
                    {inCart && (
                      <span className="text-[9px] font-semibold text-[#0c831f] bg-[#e8f5e9] px-1.5 py-0.5 rounded-full">
                        Already in cart
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1a1a1a]">₹{item.price * item.quantity}</p>
                </div>
              </button>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-[#ccc] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#666]">No items to reorder</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#e8e8e8] bg-white rounded-b-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#999]">Subtotal ({selectedItems.size} items)</p>
              <p className="text-lg font-bold text-[#1a1a1a]">₹{itemTotal.toLocaleString("en-IN")}</p>
            </div>
            <button
              onClick={handleReorder}
              disabled={selectedItems.size === 0 || isAdding}
              className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold disabled:bg-[#ccc] disabled:cursor-not-allowed hover:bg-[#e63872] transition-colors"
            >
              {isAdding ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
          {selectedItems.size === 0 && (
            <p className="text-[10px] text-[#ff4f8b] text-center">Select at least one item to reorder</p>
          )}
        </div>
      </div>
    </>
  );
}

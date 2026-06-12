"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, ShoppingCart } from "lucide-react";
import { useUserCart } from "@/hooks/use-user-cart";
import { SafeProductImage } from "@/components/ui/safe-image";
import { toast } from "sonner";

interface BundleProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  stock: string;
  category: string;
}

interface FrequentlyBoughtTogetherProps {
  mainProduct: BundleProduct;
  suggestedProducts: BundleProduct[];
}

export default function FrequentlyBoughtTogether({ mainProduct, suggestedProducts }: FrequentlyBoughtTogetherProps) {
  const { addToCart } = useUserCart();
  const allProducts = [mainProduct, ...suggestedProducts].slice(0, 3); // Max 3 items
  
  // State to track which items are selected (default all)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(allProducts.map(p => p.id))
  );

  if (allProducts.length < 2) return null;

  const selectedProducts = allProducts.filter(p => selectedItemIds.has(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const totalMrp = selectedProducts.reduce((sum, p) => sum + p.mrp, 0);
  const totalDiscount = Math.round(((totalMrp - totalPrice) / (totalMrp || 1)) * 100);

  const toggleSelection = (id: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) return;
    
    selectedProducts.forEach(product => {
      addToCart(product.id, 1);
    });
    
    toast.success(`Added ${selectedProducts.length} item(s) to cart`);
  };

  return (
    <section className="mt-6 rounded-3xl border border-[#e8e8e8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-[#1a1a1a]">
          Frequently Bought Together
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Visual Product Row */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 w-full lg:w-auto hide-scrollbar">
          {allProducts.map((product, index) => {
            const isSelected = selectedItemIds.has(product.id);
            return (
              <div key={product.id} className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Product Image Card */}
                <Link href={`/product/${product.id}`} className={`block relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 transition-all ${isSelected ? 'border-[#ff4f8b] shadow-sm' : 'border-[#e8e8e8] opacity-60'}`}>
                  <div className="absolute inset-0 p-2 sm:p-4 bg-[#f9f9f9] rounded-[10px]">
                    <div className="relative w-full h-full">
                      <SafeProductImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-[#ff4f8b] text-white rounded-full p-1 z-10 shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </Link>
                
                {/* Plus Sign */}
                {index < allProducts.length - 1 && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center flex-shrink-0 text-[#999]">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total & Add Button Container */}
        <div className="flex-1 w-full lg:min-w-[280px] bg-[#f9f9f9] rounded-2xl p-5 border border-[#e8e8e8]">
          <div className="mb-4">
            <span className="text-[#666] text-sm">Total price:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#1a1a1a]">{totalPrice}</span>
              {totalMrp > totalPrice && (

                <>
                  <span className="text-sm text-[#999] line-through">{totalMrp}</span>
                  <span className="text-xs font-bold text-[#ff4f8b] bg-[#fff0f6] px-2 py-0.5 rounded-md">Save {totalDiscount}%</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAddAllToCart}
            disabled={selectedProducts.length === 0}
            className="w-full h-12 bg-[#ff4f8b] hover:bg-[#e63872] disabled:bg-[#ccc] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add {selectedProducts.length > 0 ? selectedProducts.length : ""} to Cart
          </button>
        </div>
      </div>

      {/* Item List Checkboxes */}
      <div className="mt-6 space-y-3">
        {allProducts.map((product, index) => {
          const isSelected = selectedItemIds.has(product.id);
          const isMain = index === 0;
          
          return (
            <div key={product.id} className="flex items-start gap-3 group">
              <div 
                className="pt-0.5 cursor-pointer"
                onClick={() => toggleSelection(product.id)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#ff4f8b] border-[#ff4f8b]' : 'border-[#ccc] group-hover:border-[#ff4f8b]'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[#1a1a1a]">
                  {isMain && <span className="text-[#666] font-normal mr-1">This item:</span>}
                  <Link href={`/product/${product.id}`} className="hover:text-[#ff4f8b] hover:underline transition-colors">
                    {product.name}
                  </Link>
                </span>
                <span className="text-[#666] ml-2">{product.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

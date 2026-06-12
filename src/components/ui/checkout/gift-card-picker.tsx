'use client';

import React, { useState } from 'react';
import { Gift, CheckCircle, XCircle } from 'lucide-react';
import { useGiftCardStore } from '@/stores/gift-card-store';
import { toast } from 'sonner';

interface GiftCardPickerProps {
  onApply: (balance: number, code: string) => void;
  onRemove: () => void;
  appliedBalance: number;
}

export function GiftCardPicker({ onApply, onRemove, appliedBalance }: GiftCardPickerProps) {
  const [manualCode, setManualCode] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { ownedGiftCards, redeemGiftCard } = useGiftCardStore();
  
  // Exclude partner cards per constraints
  const platformCards = ownedGiftCards.filter(c => c.type === 'platform' && c.status === 'Active' && c.balance > 0);

  const handleApply = async (code: string) => {
    if (!code.trim()) return;
    
    const result = await redeemGiftCard(code);
    if (result.success) {
      toast.success(result.message);
      onApply(result.balanceApplied || 0, code);
      setIsPickerOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-[#ff4f8b]" />
        <h3 className="font-bold text-[#1a1a1a]">Gift Card</h3>
      </div>
      
      {appliedBalance > 0 ? (
        <div className="flex items-center justify-between bg-[#fff0f6] p-3 rounded-xl border border-[#ff4f8b]/30">
           <div className="flex items-center gap-2">
             <CheckCircle className="w-4 h-4 text-[#ff4f8b]" />
             <span className="text-sm font-bold text-[#ff4f8b]">Gift Card Applied</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-[#1a1a1a]">-₹{appliedBalance}</span>
             <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
               <XCircle className="w-4 h-4" />
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Gift Card Code" 
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="flex-1 h-10 rounded-lg border border-[#e8e8e8] bg-[#f9f9f9] px-3 text-sm font-medium uppercase placeholder:normal-case focus:border-[#ff4f8b] focus:ring-1 focus:ring-[#ff4f8b] outline-none"
            />
            <button 
              onClick={() => handleApply(manualCode)}
              disabled={!manualCode.trim()}
              className="h-10 px-4 bg-[#1a1a1a] text-white text-sm font-bold rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          
          <button 
             onClick={() => setIsPickerOpen(!isPickerOpen)}
             className="text-sm font-bold text-[#ff4f8b] hover:underline"
          >
             {isPickerOpen ? 'Hide My Gift Cards' : 'Select from My Gift Cards'}
          </button>
          
          {isPickerOpen && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
              {platformCards.length === 0 ? (
                 <p className="text-xs text-gray-500">No active platform gift cards found.</p>
              ) : (
                platformCards.map(card => (
                  <div key={card.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-[#ff4f8b]/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-[#1a1a1a]">₹{card.balance}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{card.code}</div>
                    </div>
                    <button 
                      onClick={() => handleApply(card.code)}
                      className="px-3 py-1.5 text-xs font-bold text-[#ff4f8b] bg-[#fff0f6] rounded-md hover:bg-[#ffe0eb]"
                    >
                      Apply
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

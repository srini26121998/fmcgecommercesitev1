'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GiftCardTheme, useGiftCardStore, GiftCardPurchaseForm } from '@/stores/gift-card-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const themes: GiftCardTheme[] = ['Birthday', 'Anniversary', 'Festive', 'Generic'];

export function PlatformGiftCardForm() {
  const router = useRouter();
  const { availableThemes, platformDenominations, purchasePlatformGiftCard } = useGiftCardStore();
  
  const [selectedTheme, setSelectedTheme] = useState<GiftCardTheme>('Generic');
  const [selectedDesign, setSelectedDesign] = useState<string>(availableThemes['Generic'][0]);
  const [selectedDenomination, setSelectedDenomination] = useState<number | 'Custom'>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmailOrPhone: '',
    deliveryDate: '',
    personalMessage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle theme change
  const handleThemeChange = (theme: GiftCardTheme) => {
    setSelectedTheme(theme);
    setSelectedDesign(availableThemes[theme][0]); // Default to first design of the new theme
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const amount = selectedDenomination === 'Custom' ? Number(customAmount) : selectedDenomination;
    if (!amount || amount < 10) return false;
    if (!formData.recipientName.trim()) return false;
    if (!formData.recipientEmailOrPhone.trim()) return false;
    return true;
  };

  const handleProceedToPay = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields and ensure amount is valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = selectedDenomination === 'Custom' ? Number(customAmount) : selectedDenomination;
      const purchaseForm: GiftCardPurchaseForm = {
        ...formData,
        theme: selectedTheme,
        cardDesignUrl: selectedDesign,
        denomination: amount as number
      };

      // In a real flow, this would go to checkout first.
      // We will simulate going to a checkout summary or creating an order directly.
      // For this spec, we'll route to a special checkout page or just use the store to create it and route to confirmation.
      // "Checkout & Payment - Standard checkout flow (see Section 6) — order_type flagged as 'giftcard_purchase'."
      // Let's create the card in 'pending' state or just pass data via query params / session to checkout.
      // To simplify, we will just use the checkout page but we need to pass this specific item.
      // Let's put this in local storage and route to checkout, or just use the store if checkout reads from it.
      // Actually, since we need to integrate with standard checkout, let's just route to checkout with a query param.
      
      // We'll save the pending purchase in sessionStorage for checkout to pick up.
      sessionStorage.setItem('pendingGiftCardPurchase', JSON.stringify(purchaseForm));
      
      router.push('/checkout?order_type=giftcard_purchase');
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Selector */}
      <section>
        <h2 className="text-xl font-bold mb-4">1. Select Occasion</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {themes.map(theme => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedTheme === theme 
                  ? 'bg-[#ff4f8b] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </section>

      {/* Design Carousel */}
      <section>
        <h2 className="text-xl font-bold mb-4">2. Choose Design</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {availableThemes[selectedTheme].map((designUrl, idx) => (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDesign(designUrl)}
              className={`relative flex-shrink-0 w-64 h-40 rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${
                selectedDesign === designUrl ? 'border-[#ff4f8b]' : 'border-transparent'
              }`}
            >
              <img src={designUrl} alt="Card Design" className="w-full h-full object-cover" 
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/ff4f8b/FFFFFF?text=Gift+Card'; }} />
              {selectedDesign === designUrl && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 text-[#ff4f8b]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Denomination Selector */}
      <section>
        <h2 className="text-xl font-bold mb-4">3. Select Amount</h2>
        <div className="grid grid-cols-4 gap-3">
          {platformDenominations.map(den => (
            <button
              key={den}
              onClick={() => { setSelectedDenomination(den); setCustomAmount(''); }}
              className={`py-3 rounded-xl font-semibold transition-colors ${
                selectedDenomination === den 
                  ? 'bg-gradient-to-r from-[#ff4f8b] to-[#ff7e5f] text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ff4f8b]/50'
              }`}
            >
              ₹{den}
            </button>
          ))}
          <button
            onClick={() => setSelectedDenomination('Custom')}
            className={`py-3 rounded-xl font-semibold transition-colors ${
              selectedDenomination === 'Custom' 
                ? 'bg-gradient-to-r from-[#ff4f8b] to-[#ff7e5f] text-white shadow-md' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ff4f8b]/50'
            }`}
          >
            Custom
          </button>
        </div>
        
        <AnimatePresence>
          {selectedDenomination === 'Custom' && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <Input
                  type="number"
                  placeholder="Enter custom amount (Min ₹10)"
                  className="pl-8 h-12 text-lg rounded-xl"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Recipient Details */}
      <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-xl font-bold mb-6">4. Recipient Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
            <Input 
              name="recipientName"
              placeholder="John Doe" 
              value={formData.recipientName}
              onChange={handleInputChange}
              className="bg-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number *</label>
            <Input 
              name="recipientEmailOrPhone"
              placeholder="john@example.com or 9876543210" 
              value={formData.recipientEmailOrPhone}
              onChange={handleInputChange}
              className="bg-white h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date (Optional)</label>
            <Input 
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleInputChange}
              className="bg-white h-12 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately after purchase.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message</label>
            <Textarea 
              name="personalMessage"
              placeholder="Write a message (max 200 chars)" 
              maxLength={200}
              value={formData.personalMessage}
              onChange={handleInputChange}
              className="bg-white resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.personalMessage.length}/200</p>
          </div>
        </div>
      </section>

      <Button
        onClick={handleProceedToPay}
        disabled={!isFormValid() || isSubmitting}
        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#ff7e5f] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : `Proceed to Pay ₹${selectedDenomination === 'Custom' ? customAmount || '0' : selectedDenomination}`}
      </Button>
    </div>
  );
}

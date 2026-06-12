'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import { useGiftCardStore, OwnedGiftCard } from '@/stores/gift-card-store';
import { Gift, Copy, CheckCircle2, ExternalLink, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MyGiftCardsPage() {
  const { ownedGiftCards, syncPartnerGiftCardStatus } = useGiftCardStore();
  const [activeTab, setActiveTab] = useState<'platform' | 'partner'>('platform');
  const [selectedCard, setSelectedCard] = useState<OwnedGiftCard | null>(null);
  const [isCodeRevealed, setIsCodeRevealed] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  const platformCards = ownedGiftCards.filter(c => c.type === 'platform');
  const partnerCards = ownedGiftCards.filter(c => c.type === 'partner');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleSyncStatus = async (cardId: string) => {
    setSyncing(prev => ({ ...prev, [cardId]: true }));
    try {
      await syncPartnerGiftCardStatus(cardId);
      toast.success('Status synced successfully');
    } catch (e) {
       toast.error('Failed to sync status');
    } finally {
      setSyncing(prev => ({ ...prev, [cardId]: false }));
    }
  };

  const openCardDetail = (card: OwnedGiftCard) => {
    setSelectedCard(card);
    setIsCodeRevealed(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px] mt-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors active:scale-95"
              aria-label="Back to Account"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Gift Cards</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'platform'
                ? 'border-[#ff4f8b] text-[#ff4f8b]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Platform Cards
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'partner'
                ? 'border-[#ff4f8b] text-[#ff4f8b]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Brand Vouchers
          </button>
        </div>

        {/* Card List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'platform' && platformCards.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500">
               <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>You don't have any platform gift cards yet.</p>
             </div>
          )}
          {activeTab === 'partner' && partnerCards.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500">
               <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>You don't have any brand vouchers yet.</p>
             </div>
          )}

          {(activeTab === 'platform' ? platformCards : partnerCards).map(card => (
            <motion.div
              key={card.id}
              whileHover={{ y: -4 }}
              onClick={() => openCardDetail(card)}
              className="border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all flex flex-col"
            >
              <div className="h-32 bg-gray-100 relative">
                {card.type === 'platform' ? (
                   <img src={card.cardDesignUrl} alt="Gift Card" className="w-full h-full object-cover" 
                     onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }} />
                ) : (
                   <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50">
                      <img src={card.partnerLogoUrl} alt={card.partnerName} className="max-h-full max-w-full object-contain" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }} />
                   </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${
                  card.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {card.status}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1">
                    {card.type === 'platform' ? 'Platform Gift Card' : `${card.partnerName} Voucher`}
                  </h3>
                  <span className="font-bold text-[#ff4f8b]">₹{card.balance}</span>
                </div>
                <div className="text-xs text-gray-500 mt-auto pt-2">
                  {card.type === 'platform' && card.recipientName && (
                    <div className="mb-1">For: {card.recipientName}</div>
                  )}
                  <div>Valid till: {new Date(card.expiryDate).toLocaleDateString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCard(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
              >
                <div className="text-center mb-6">
                  {selectedCard.type === 'platform' ? (
                    <div className="h-40 rounded-xl overflow-hidden mb-4 shadow-sm">
                      <img src={selectedCard.cardDesignUrl} alt="Gift Card" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 w-24 mx-auto rounded-full overflow-hidden mb-4 shadow-sm border p-4 bg-gray-50 flex items-center justify-center">
                       <img src={selectedCard.partnerLogoUrl} alt={selectedCard.partnerName} className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-black">
                    {selectedCard.type === 'platform' ? 'Platform Gift Card' : `${selectedCard.partnerName} Voucher`}
                  </h2>
                  <div className="text-3xl font-black text-[#ff4f8b] mt-2">₹{selectedCard.balance}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                  <div className="text-sm text-gray-500 mb-2 font-medium">Voucher Code</div>
                  
                  {isCodeRevealed ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-xl font-bold tracking-widest bg-white px-4 py-2 rounded-lg border border-gray-200">
                        {selectedCard.code}
                      </span>
                      <button 
                        onClick={() => handleCopyCode(selectedCard.code)}
                        className="p-2 text-gray-500 hover:text-black transition-colors bg-white border border-gray-200 rounded-lg"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCodeRevealed(true)}
                      className="text-[#ff4f8b] font-bold text-lg hover:underline py-2"
                    >
                      Tap to reveal code
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between">
                    <span>Initial Balance:</span>
                    <span className="font-semibold text-gray-900">₹{selectedCard.initialBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <span className="font-semibold text-gray-900">{new Date(selectedCard.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      selectedCard.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {selectedCard.status}
                    </span>
                  </div>
                  {selectedCard.type === 'partner' && (
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                       <span>Last Synced:</span>
                       <div className="flex items-center gap-2">
                         <span className="text-xs">{new Date(selectedCard.lastSynced || '').toLocaleDateString()}</span>
                         <button 
                           onClick={() => handleSyncStatus(selectedCard.id)}
                           disabled={syncing[selectedCard.id]}
                           className="text-xs text-[#ff4f8b] hover:underline disabled:opacity-50"
                         >
                           {syncing[selectedCard.id] ? 'Syncing...' : 'Sync'}
                         </button>
                       </div>
                    </div>
                  )}
                </div>

                {selectedCard.type === 'platform' && selectedCard.status === 'Active' && (
                  <Button 
                    className="w-full h-12 text-lg font-bold"
                    onClick={() => {
                       toast.success('Copy the code and apply it during checkout!');
                    }}
                  >
                    Use at Checkout
                  </Button>
                )}

                {selectedCard.type === 'partner' && (
                  <Button 
                    className="w-full h-12 text-lg font-bold bg-black text-white hover:bg-gray-800"
                    onClick={() => {
                       // Deep link simulation
                       toast.success(`Opening ${selectedCard.partnerName} App/Website...`);
                    }}
                  >
                    Redeem on {selectedCard.partnerName} <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
  );
}

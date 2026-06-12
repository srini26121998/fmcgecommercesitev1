"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, Tag, ChevronDown, ShieldCheck, RotateCcw, Truck, Zap, Info, TicketPercent, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AmazonProductDetailsProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    mrp: number;
    category: string;
    stock: number;
  };
  discount: number;
  rating: number;
  reviewCount: number;
}

export default function AmazonProductDetails({ product, discount, rating, reviewCount }: AmazonProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("highlights");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [activeModal, setActiveModal] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Mock variants for the UI
  const variants = [
    { label: "150 g", price: product.price, mrp: product.mrp, unitPrice: "₹180.00 /100 g" },
    { label: "250 g", price: Math.round(product.price * 1.5), mrp: Math.round(product.mrp * 1.5), unitPrice: "₹147.20 /100 g" },
    { label: "500 g", price: Math.round(product.price * 2.8), mrp: Math.round(product.mrp * 2.8), unitPrice: "₹131.20 /100 g" },
  ];

  const offers = [
    {
      title: "Wallet Cashback",
      desc: `Get up to ₹${Math.round(product.price * 0.05).toFixed(2)} cashback added to your FMCG Wallet.`,
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      color: "from-amber-50 to-orange-50 border-amber-100",
    },
    {
      title: "Bank Offers",
      desc: `Save up to ₹${Math.round(product.price * 0.15).toFixed(2)} with select Credit & Debit Cards.`,
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
      color: "from-blue-50 to-indigo-50 border-blue-100",
    },
    {
      title: "Partner Perks",
      desc: "Get GST invoice and save up to 18% on business purchases.",
      icon: <Tag className="w-4 h-4 text-emerald-500" />,
      color: "from-emerald-50 to-teal-50 border-emerald-100",
    },
  ];

  const accordions = [
    {
      id: "highlights",
      title: "Top Highlights",
      content: (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />Brand: <span className="font-medium text-slate-900">{product.name.split(' ')[0]}</span></li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />Category: <span className="font-medium text-slate-900">{product.category}</span></li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />Item Weight: <span className="font-medium text-slate-900">150 Grams</span></li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />Quality: <span className="font-medium text-slate-900">Fresh, Authenticated</span></li>
        </ul>
      ),
    },
    {
      id: "details",
      title: "Product Details",
      content: (
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="text-slate-500 mb-1">Material Feature</p>
            <p className="font-medium text-slate-900">Vegetarian</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Item Form</p>
            <p className="font-medium text-slate-900">Solid</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Package Info</p>
            <p className="font-medium text-slate-900">Premium Jar</p>
          </div>
        </div>
      ),
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="space-y-3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Limited Time Deal
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> FMCG Fulfilled
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight"
        >
          {product.name}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 flex-wrap"
        >
          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <span className="text-xs font-bold text-amber-700">{rating}</span>
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-3 h-3 ${star <= rating ? "fill-amber-500" : "fill-transparent text-amber-200"}`} />
              ))}
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
            {reviewCount.toLocaleString()} Reviews
          </span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <Link href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            Visit {product.category} Store
          </Link>
        </motion.div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Pricing Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex items-end gap-2.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{variants[selectedVariant].price.toLocaleString()}
          </span>
          <div className="flex flex-col pb-0.5">
            <span className="text-sm text-slate-400 line-through font-medium">
              ₹{variants[selectedVariant].mrp.toLocaleString()}
            </span>
          </div>
          <div className="mb-1 bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
            {discount}% OFF
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Inclusive of all taxes. <span className="font-medium text-slate-700">({variants[selectedVariant].unitPrice})</span>
        </p>
      </motion.div>

      {/* Coupon Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
          isCouponApplied ? "border-emerald-500 bg-emerald-50/50" : "border-dashed border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30"
        }`}
      >
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isCouponApplied ? "bg-emerald-100 text-emerald-600" : "bg-white text-indigo-500 shadow-sm"}`}>
              <TicketPercent className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isCouponApplied ? "text-emerald-800" : "text-slate-900"}`}>
                Extra 5% Discount
              </h4>
              <button 
                onClick={() => setActiveModal({
                  title: "Coupon Terms",
                  content: <div className="p-4 text-sm text-slate-600 leading-relaxed">Standard coupon terms apply. Valid on select items.</div>
                })}
                className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-2"
              >
                View Terms
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCouponApplied(!isCouponApplied);
              if (!isCouponApplied) toast.success("Coupon applied successfully!");
            }}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${
              isCouponApplied 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" 
                : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
            }`}
          >
            {isCouponApplied ? "Applied!" : "Apply"}
          </button>
        </div>
      </motion.div>

      {/* Variants Selection */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">Select Size</h3>
          <span className="text-xs font-medium text-slate-500">
            Use by: <span className="text-slate-900">12 JUN 2027</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {variants.map((variant, idx) => {
            const isSelected = selectedVariant === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedVariant(idx)}
                className={`relative flex flex-col p-3 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/50" 
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-variant-check"
                    className="absolute top-2 right-2 text-indigo-600"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-indigo-100" />
                  </motion.div>
                )}
                <span className={`text-sm font-bold ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                  {variant.label}
                </span>
                <span className={`text-xs mt-1 ${isSelected ? "text-indigo-700 font-medium" : "text-slate-500"}`}>
                  ₹{variant.price}
                </span>
                <span className="text-[9px] text-slate-400 mt-auto pt-1">
                  {variant.unitPrice}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Features/Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-4 gap-2 py-4 border-y border-slate-100"
      >
        {[
          { icon: <Truck className="w-5 h-5" />, label: "Free Delivery" },
          { icon: <ShieldCheck className="w-5 h-5" />, label: "Secure Pay" },
          { icon: <RotateCcw className="w-5 h-5" />, label: "10 Days Return" },
          { icon: <CheckCircle2 className="w-5 h-5" />, label: "Top Quality" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-2 text-center group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
            </div>
            <span className="text-[9px] font-medium text-slate-600 leading-tight group-hover:text-slate-900 transition-colors">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Offers */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Tag className="w-5 h-5 text-indigo-500" />
          Special Offers
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {offers.map((offer, idx) => (
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              key={idx} 
              className={`rounded-2xl p-4 flex flex-col gap-2 bg-gradient-to-br border shadow-sm transition-all cursor-pointer ${offer.color}`}
              onClick={() => setActiveModal({
                title: offer.title,
                content: (
                  <div className="space-y-4 p-4 text-slate-700">
                    <p>{offer.desc}</p>
                    <ul className="list-disc pl-4 space-y-2 text-sm">
                      <li>Offer valid on select payment methods.</li>
                      <li>Minimum purchase value may apply.</li>
                      <li>Terms and conditions apply.</li>
                    </ul>
                  </div>
                )
              })}
            >
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                {offer.icon}
                {offer.title}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed flex-grow">{offer.desc}</p>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2">
                Know more <ChevronDown className="w-3 h-3 -rotate-90" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Accordions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
      >
        {accordions.map((acc, idx) => (
          <div key={acc.id} className={idx !== accordions.length - 1 ? "border-b border-slate-100" : ""}>
            <button
              onClick={() => toggleSection(acc.id)}
              className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-bold text-slate-900">{acc.title}</span>
              <motion.div
                animate={{ rotate: expandedSection === acc.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {expandedSection === acc.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    {acc.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* Modal */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl" showCloseButton>
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900 pr-6">
              {activeModal?.title}
            </DialogTitle>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {activeModal?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

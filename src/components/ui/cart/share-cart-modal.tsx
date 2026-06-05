"use client";

import { useState } from "react";
import { Share2, X, Check, Copy, MessageCircle, Mail, Link2, Smartphone } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useShareCartStore } from "@/store/share-cart-store";
import { toast } from "sonner";

interface ShareCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCartModal({ isOpen, onClose }: ShareCartModalProps) {
  const cart = useCartStore((s) => s.cart);
  const { shareCart } = useShareCartStore();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const itemTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  function handleGenerateLink() {
    const id = shareCart(
      cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }))
    );
    const url = `${window.location.origin}/cart/shared/${id}`;
    setShareUrl(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl || window.location.href);
    setCopied(true);
    toast.success("Cart link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const text = `Check out my FMCG cart!\n${cart.map((i) => `• ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join("\n")}\nTotal: ₹${itemTotal}\n\n${shareUrl || window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleEmail() {
    const subject = "My FMCG Commerce Cart";
    const body = `Here are the items in my cart:\n\n${cart.map((i) => `• ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join("\n")}\n\nTotal: ₹${itemTotal}\n\nView cart: ${shareUrl || window.location.href}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#ff4f8b]" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Share Cart</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cart Summary */}
          <div className="rounded-xl bg-[#f2f2f2] p-3 max-h-32 overflow-y-auto space-y-1.5">
            {cart.slice(0, 5).map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between text-xs">
                <span className="text-[#666] truncate mr-2">{item.name} x{item.quantity}</span>
                <span className="font-semibold text-[#1a1a1a]">₹{item.price * item.quantity}</span>
              </div>
            ))}
            {cart.length > 5 && (
              <p className="text-[10px] text-[#999] text-center pt-1">+{cart.length - 5} more items</p>
            )}
            <div className="flex justify-between border-t border-[#e8e8e8] pt-1.5 text-xs font-bold">
              <span className="text-[#1a1a1a]">Total</span>
              <span className="text-[#ff4f8b]">₹{itemTotal}</span>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <p className="text-xs font-semibold text-[#666] mb-2">Share via link</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl || "Click generate to create share link"}
                className="flex-1 h-10 rounded-lg border border-[#e8e8e8] px-3 text-xs text-[#666] bg-[#f9f9f9] outline-none"
              />
              <button
                onClick={shareUrl ? handleCopy : handleGenerateLink}
                className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : shareUrl ? <Copy className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied ? "Copied" : shareUrl ? "Copy" : "Generate"}
              </button>
            </div>
          </div>

          {/* Share apps */}
          <div>
            <p className="text-xs font-semibold text-[#666] mb-3">Share via</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#f2f2f2] transition-colors min-w-[60px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="text-[10px] font-medium text-[#666]">WhatsApp</span>
              </button>
              <button
                onClick={handleEmail}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#f2f2f2] transition-colors min-w-[60px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#EA4335]" />
                </div>
                <span className="text-[10px] font-medium text-[#666]">Email</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#f2f2f2] transition-colors min-w-[60px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#ff4f8b]/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#ff4f8b]" />
                </div>
                <span className="text-[10px] font-medium text-[#666]">Copy</span>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-[#999] text-center">
            Recipients can view and order these items from your shared list
          </p>
        </div>
      </div>
    </>
  );
}

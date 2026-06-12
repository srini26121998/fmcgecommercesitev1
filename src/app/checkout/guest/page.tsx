"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/ui/navbar";
import { useUserCart } from "@/hooks/use-user-cart";
import { toast } from "sonner";

type GuestStep = "identity" | "checkout_redirect";

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { cartItems } = useUserCart();
  const [step, setStep] = useState<GuestStep>("identity");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Optional account creation
  const [wantsAccount, setWantsAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const itemTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const validateIdentity = () => {
    if (!name.trim()) { toast.error("Please enter your name"); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email"); return false;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone"); return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateIdentity()) return;
    setIsProcessing(true);
    // Store guest info in sessionStorage so checkout can pre-fill
    sessionStorage.setItem("guest_checkout", JSON.stringify({ name, email, phone }));
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Proceeding to checkout as guest!");
    // Navigate to the main checkout — it will pre-fill from sessionStorage
    router.push("/checkout?mode=guest");
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2]">
      <Navbar />
      <div className="pt-[72px] sm:pt-20">
        <div className="max-w-md mx-auto px-4 py-8 space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-2 text-xs text-[#999]">
            <Link href="/cart" className="hover:text-[#ff4f8b] transition-colors">Cart</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#ff4f8b] font-bold">Guest Checkout</span>
            <ChevronRight className="w-3 h-3" />
            <span>Delivery &amp; Payment</span>
          </div>

          {/* Hero */}
          <div className="bg-gradient-to-br from-[#ff4f8b] to-[#fb923c] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5" />
              <h1 className="text-base font-black">Continue as Guest</h1>
            </div>
            <p className="text-white/80 text-xs">
              No account needed — enter your contact details to continue
            </p>
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs">{cartItems.length} items in cart</span>
              <span className="font-black text-sm">₹{itemTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Form */}
          <section className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e8e8e8]">
              <h2 className="text-sm font-black text-[#1a1a1a]">Your Details</h2>
            </div>
            <div className="p-4 space-y-3">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  id="guest-name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] text-sm font-medium text-[#1a1a1a] outline-none focus:border-[#ff4f8b] focus:bg-white transition-all placeholder:text-[#999]"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  id="guest-email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] text-sm font-medium text-[#1a1a1a] outline-none focus:border-[#ff4f8b] focus:bg-white transition-all placeholder:text-[#999]"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                <input
                  id="guest-phone"
                  type="tel"
                  placeholder="10-digit Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] text-sm font-medium text-[#1a1a1a] outline-none focus:border-[#ff4f8b] focus:bg-white transition-all placeholder:text-[#999]"
                />
              </div>

              {/* Optional account creation */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    id="guest-wants-account"
                    type="checkbox"
                    checked={wantsAccount}
                    onChange={(e) => setWantsAccount(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e8e8e8] text-[#ff4f8b] mt-0.5 cursor-pointer accent-[#ff4f8b]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Save my details for faster checkout</p>
                    <p className="text-[10px] text-[#999]">Creates a free account — track orders, earn loyalty points</p>
                  </div>
                </label>

                {wantsAccount && (
                  <div className="relative mt-3">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                    <input
                      id="guest-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min 8 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-10 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] text-sm font-medium text-[#1a1a1a] outline-none focus:border-[#ff4f8b] focus:bg-white transition-all placeholder:text-[#999]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#999]" /> : <Eye className="w-4 h-4 text-[#999]" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Continue Button */}
          <button
            id="guest-checkout-continue-btn"
            onClick={handleContinue}
            disabled={isProcessing}
            className="w-full h-13 rounded-2xl bg-[#ff4f8b] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#e63872] disabled:bg-[#ccc] transition-all"
            style={{ height: "52px" }}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><ArrowRight className="w-4 h-4" /> Continue to Delivery &amp; Payment</>
            )}
          </button>

          {/* Sign In Prompt */}
          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 text-center">
            <p className="text-xs text-[#666] mb-2">Already have an account?</p>
            <Link
              href="/auth/login?redirect=/checkout"
              id="guest-signin-link"
              className="text-sm font-black text-[#ff4f8b] hover:underline"
            >
              Sign In for a faster experience →
            </Link>
            <p className="text-[10px] text-[#999] mt-2">
              Members get wallet cashback, loyalty points &amp; saved addresses
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  ReceiptText,
  Tag,
  CheckCircle,
  Truck,
  Store,
  Calendar,
  Repeat,
  Sparkles,
  Plus,
} from "lucide-react";

import Navbar from "@/components/ui/navbar";
import { useUserCart } from "@/hooks/use-user-cart";
import { useOrderStore, generateOrderId, buildTrackingSteps } from "@/store/order-store";
import { useAddressStore, Address } from "@/store/address-store";
import { useUserAddresses } from "@/hooks/use-user-addresses";
import { toast } from "sonner";
import BillRow from "@/components/ui/a11y/bill-row";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import AutoCoupons from "@/components/ui/checkout/auto-coupons";
import EmiBnpl from "@/components/ui/checkout/emi-bnpl";
import ScheduledDelivery from "@/components/ui/checkout/scheduled-delivery";
import StorePickup from "@/components/ui/checkout/store-pickup";
import SubstitutionSuggestions from "@/components/ui/checkout/substitution-suggestions";
import { useCallback, useEffect } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { orderService } from "@/services/orders.service";

type DeliveryMode = "express" | "scheduled" | "pickup" | "subscription";

import { useValidateCoupon } from "@/hooks/use-user-promotions";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: cart, clearCart } = useUserCart();
  const addOrder = useOrderStore((state) => state.addOrder);
  const { addresses, getDefaultAddress } = useAddressStore();
  const { addAddress } = useUserAddresses(true); // Auto-fetch addresses on load
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("10 minutes");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ... (deliveryMode, subscriptionFrequency, etc. same as before)
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("express");
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("weekly");
  const [pickupStore, setPickupStore] = useState("andheri");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"full" | "emi" | "bnpl">("full");
  const [selectedEmi, setSelectedEmi] = useState<number>(3);
  const [selectedBnpl, setSelectedBnpl] = useState<string>("lazypay");

  const { validateCoupon, isValidating, result: couponResult, clearCoupon } = useValidateCoupon();
  const [couponInput, setCouponInput] = useState("");

  // Load default address on mount
  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
      return;
    }
    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      setDeliveryName(defaultAddr.name);
      setDeliveryPhone(defaultAddr.phone);
      setDeliveryAddress(defaultAddr.address);
      setDeliveryCity(defaultAddr.city);
      setDeliveryPincode(defaultAddr.pincode);
    } else {
      setSelectedAddressId("new");
    }
  }, [getDefaultAddress, cart.length, router]);

  const handleAddressSelect = (addr: Address | "new") => {
    if (addr === "new") {
      setSelectedAddressId("new");
      setDeliveryName("");
      setDeliveryPhone("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setDeliveryPincode("");
    } else {
      setSelectedAddressId(addr.id);
      setDeliveryName(addr.name);
      setDeliveryPhone(addr.phone);
      setDeliveryAddress(addr.address);
      setDeliveryCity(addr.city);
      setDeliveryPincode(addr.pincode);
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!deliveryName.trim()) newErrors.name = "Name is required";
    if (!deliveryPhone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\+?91\s?\d{10}$|^\d{10}$/.test(deliveryPhone.trim())) newErrors.phone = "Invalid phone number";
    
    if (deliveryMode !== "pickup") {
      if (!deliveryAddress.trim()) newErrors.address = "Address is required";
      if (!deliveryCity.trim()) newErrors.city = "City is required";
      if (!deliveryPincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(deliveryPincode.trim())) newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (deliveryMode === "pickup") {
      toast.error("Pickup cannot be saved as an address");
      return;
    }

    const newAddressId = `addr_${Date.now()}`;
    addAddress({
      type: addressType,
      name: deliveryName,
      phone: deliveryPhone,
      address: deliveryAddress,
      city: deliveryCity,
      pincode: deliveryPincode,
      isDefault: addresses.length === 0,
    }).then((res) => {
      if (res.success) {
        toast.success("Address saved successfully!");
        setSelectedAddressId("");
      } else {
        toast.error(res.message || "Failed to save address");
      }
    });
  };

  const itemTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );
  // ... (rest of memos same as before)
  const deliveryFee = useMemo(
    () => {
      if (deliveryMode === "pickup") return 0;
      if (deliveryMode === "subscription") return 0;
      return (itemTotal > 499 || itemTotal === 0 ? 0 : 25);
    },
    [itemTotal, deliveryMode]
  );
  const handlingFee = useMemo(() => (itemTotal > 0 ? 5 : 0), [itemTotal]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !couponResult?.data) return 0;
    
    // The backend provides the exact calculated discount based on cart total
    if (couponResult.data.discountType === "percentage") {
        return Math.round(itemTotal * (couponResult.data.discountValue / 100));
    }
    return Math.min(couponResult.data.discountValue, itemTotal);
  }, [appliedCoupon, couponResult, itemTotal]);

  const subscriptionDiscount = useMemo(() => {
    if (deliveryMode !== "subscription") return 0;
    const rates: Record<string, number> = { weekly: 0.1, biweekly: 0.12, monthly: 0.15 };
    return Math.round(itemTotal * (rates[subscriptionFrequency] || 0.1));
  }, [deliveryMode, itemTotal, subscriptionFrequency]);

  const totalDiscount = couponDiscount + subscriptionDiscount;
  const total = useMemo(
    () => Math.max(0, itemTotal + deliveryFee + handlingFee - totalDiscount),
    [itemTotal, deliveryFee, handlingFee, totalDiscount]
  );

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }

    setIsPlacingOrder(true);

    // ── Build a local fallback order immediately ──────────
    const localOrderId = generateOrderId();
    const estimatedTime =
      deliveryMode === "express"
        ? selectedSlot === "10 minutes" ? "10 mins" : "2 hrs"
        : deliveryMode === "pickup" ? "30 mins" : "1 day";
    const now = new Date();
    const deliveryDate = now.toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric",
    });
    const paymentMethodLabel = `${selectedPayment!}${paymentMode === "emi" ? ` (EMI ${selectedEmi}m)` : ""}${paymentMode === "bnpl" ? ` (${selectedBnpl})` : ""}`;
    let localStatus: "Delivered" | "Processing" | "Cancelled" | "Out for Delivery" = "Processing";
    if (deliveryMode === "express") {
      localStatus = selectedSlot === "10 minutes" ? "Out for Delivery" : "Processing";
    }
    const STORE_LABELS: Record<string, string> = {
      andheri: "Andheri West Store", bandra: "Bandra Kurla Store",
      powai: "Powai Hiranandani Store",  worli: "Worli Seaface Store",
    };
    const deliverySlotLabel =
      deliveryMode === "express" ? selectedSlot :
      deliveryMode === "scheduled" ? `${scheduledDate || "Today"} ${scheduledTime}` :
      deliveryMode === "pickup" ? `Pickup at ${STORE_LABELS[pickupStore] || pickupStore}` :
      `${subscriptionFrequency} subscription`;

    // ── Build API payload ────────────────────────────────
    let addressIdNum = 0;
    if (selectedAddressId && selectedAddressId !== "new") {
      const match = selectedAddressId.match(/\d+/);
      if (match) addressIdNum = parseInt(match[0], 10);
      else if (!isNaN(Number(selectedAddressId))) addressIdNum = Number(selectedAddressId);
    }

    const apiPayload = {
      // Required backend fields for integration
      addressId: addressIdNum,
      paymentMethod: paymentMethodLabel,
      couponCode: appliedCoupon || "",
      loyaltyPointsBurn: 0,
      notes: "Order placed via Storefront",

      // Fallback local UI properties for the mock backend fallback
      items: cart.map((item) => ({
        productId: String(item.id),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      total,
      subtotal: itemTotal,
      deliveryFee,
      handlingFee,
      discount: totalDiscount,
      deliveryAddress: {
        name: deliveryName,
        phone: deliveryPhone,
        address: deliveryAddress,
        city: deliveryCity,
        pincode: deliveryPincode,
      },
      deliverySlot: deliverySlotLabel,
      deliveryMode,
      scheduledDate: deliveryMode === "scheduled" ? scheduledDate : undefined,
      scheduledTime: deliveryMode === "scheduled" ? scheduledTime : undefined,
      pickupStore: deliveryMode === "pickup" ? pickupStore : undefined,
      subscriptionFrequency: deliveryMode === "subscription" ? subscriptionFrequency : undefined,
    };

    // ── Try real API ──
    let finalOrderId = localOrderId;
    try {
      const res = await orderService.placeOrder(apiPayload);
      if (res.success) {
        finalOrderId =
          res.orderId ||
          res.order?.orderId ||
          res.order?._id ||
          res.data?.orderId ||
          (res.data as any)?._id ||
          localOrderId;
      } else {
        throw new Error(res.message || "Failed to place order.");
      }
    } catch (apiErr: any) {
      console.error("[Checkout] Place order API failed:", apiErr);
      const errorMessage = apiErr.response?.data?.message || apiErr.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
      setIsPlacingOrder(false);
      return; // Do not fallback to local store on failure
    }


    // ── Always persist to local store (works offline too) ─
    addOrder({
      id: finalOrderId,
      date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      items: cart.map((item) => ({
        id: Number(item.id),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      total,
      status: localStatus,
      paymentMethod: paymentMethodLabel,
      deliveryAddress: {
        name: deliveryName,
        phone: deliveryPhone,
        address: deliveryAddress,
        city: deliveryCity,
        pincode: deliveryPincode,
      },
      deliverySlot: deliverySlotLabel,
      deliveryDate,
      estimatedTime,
      deliveryPartner:
        deliveryMode === "express"
          ? "Rahul (FMCG Partner)"
          : deliveryMode === "pickup" ? "Store Pickup" : "FMCG Logistics",
      trackingSteps: buildTrackingSteps(localStatus, estimatedTime),
    });

    clearCart();
    setIsPlacingOrder(false);
    toast.success("Order placed successfully! ðŸŽ‰", {
      description: `Order ${finalOrderId} • ₹${total.toLocaleString("en-IN")}`,
      duration: 4000,
    });
    router.push(`/account/orders/${encodeURIComponent(finalOrderId)}`);
  };

  // ... (handleRefresh)
  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Checkout refreshed! ✓", { duration: 1500 });
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <main className="min-h-screen bg-[#f2f2f2] pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        <div className="border-b border-[#e8e8e8] bg-white px-3 py-2.5 sm:px-4 md:px-6">
          <div className="mx-auto flex max-w-[1400px] items-center gap-1.5 text-xs text-[#999]">
            <Link href="/cart" className="hover-text-pink">
              Cart
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-[#1a1a1a]">Checkout</span>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 sm:py-6 md:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {/* Delivery Mode Selector */}
              <section className="rounded-xl border border-[#e8e8e8] bg-white relative z-20">
                <SectionHeader icon={Truck} title="Delivery Mode" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4">
                  {[
                    { id: "express" as const, icon: Clock, label: "Express Delivery", sub: "10-30 mins" },
                    { id: "scheduled" as const, icon: Calendar, label: "Scheduled", sub: "Pick date & time" },
                    { id: "pickup" as const, icon: Store, label: "Store Pickup", sub: "Free pickup" },
                    { id: "subscription" as const, icon: Repeat, label: "Subscribe", sub: "Save 10%" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDeliveryMode(mode.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        deliveryMode === mode.id
                          ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                          : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b] hover:bg-[#fff0f6]"
                      }`}
                    >
                      <mode.icon className={`w-5 h-5 ${deliveryMode === mode.id ? "text-[#ff4f8b]" : "text-[#999]"}`} />
                      <span>{mode.label}</span>
                      <span className="text-[9px] text-[#999]">{mode.sub}</span>
                    </button>
                  ))}
                </div>
                {/* Express delivery slot picker */}
                {deliveryMode === "express" && (
                  <div className="px-4 pb-4 animate-slide-down">
                    <p className="text-xs font-bold text-[#1a1a1a] mb-2">Select Delivery Slot</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "10 minutes", label: "10 Minutes", sub: "Ultra-fast express", badge: "FASTEST", emoji: "⚡" },
                        { id: "2 hours",   label: "2 Hours",    sub: "Standard express",  badge: "FREE",    emoji: "ðŸš€" },
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                            selectedSlot === slot.id
                              ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                              : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]/30 hover:bg-[#fff8fb]"
                          }`}
                        >
                          <span
                            className={`absolute -top-2 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              slot.badge === "FASTEST"
                                ? "bg-[#ff4f8b] text-white"
                                : "bg-[#e8f5e9] text-[#0c831f]"
                            }`}
                          >
                            {slot.badge}
                          </span>
                          <span className="text-xl">{slot.emoji}</span>
                          <span>{slot.label}</span>
                          <span className="text-[9px] font-normal text-[#999]">{slot.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription details */}
                {deliveryMode === "subscription" && (
                  <div className="px-4 pb-4 animate-slide-down">
                    <div className="rounded-xl border border-[#0c831f] bg-[#e8f5e9] p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#0c831f]" />
                        <span className="text-sm font-bold text-[#0c831f]">Subscription Benefits</span>
                      </div>
                      <p className="text-xs text-[#666]">Save 10% on every order • Free delivery • Flexible skip/cancel</p>
                      <CustomSelect
                        value={subscriptionFrequency}
                        onChange={setSubscriptionFrequency}
                        theme="green"
                        options={[
                          { value: "weekly", label: "Every Week — 10% off" },
                          { value: "biweekly", label: "Every 2 Weeks — 12% off" },
                          { value: "monthly", label: "Every Month — 15% off" }
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Scheduled delivery */}
                {deliveryMode === "scheduled" && (
                  <div className="px-4 pb-4 animate-slide-down">
                    <ScheduledDelivery
                      scheduledDate={scheduledDate}
                      scheduledTime={scheduledTime}
                      onDateChange={setScheduledDate}
                      onTimeChange={setScheduledTime}
                    />
                  </div>
                )}

                {/* Store Pickup */}
                {deliveryMode === "pickup" && (
                  <div className="px-4 pb-4 animate-slide-down">
                    <StorePickup
                      selectedStore={pickupStore}
                      onStoreChange={setPickupStore}
                    />
                  </div>
                )}
              </section>

              {/* Delivery Address */}
              <section className="rounded-xl border border-[#e8e8e8] bg-white relative z-10">
                <SectionHeader icon={MapPin} title="Delivery Address" />
                <div className="p-4 space-y-4">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`flex flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                            selectedAddressId === addr.id
                              ? "border-[#ff4f8b] bg-[#fff0f6]"
                              : "border-[#e8e8e8] hover:border-[#ff4f8b]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-[#ff4f8b]">{addr.type}</span>
                            {selectedAddressId === addr.id && <CheckCircle className="h-3 w-3 text-[#ff4f8b]" />}
                          </div>
                          <p className="text-sm font-bold text-[#1a1a1a]">{addr.name}</p>
                          <p className="line-clamp-2 text-xs text-[#666]">{addr.address}</p>
                          <p className="text-xs font-semibold text-[#999]">{addr.phone}</p>
                        </button>
                      ))}
                      <button
                        onClick={() => handleAddressSelect("new")}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                          selectedAddressId === "new"
                            ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                            : "border-[#e8e8e8] text-[#999] hover:border-[#ff4f8b]/30 hover:text-[#ff4f8b]"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs font-bold">Add New Address</span>
                      </button>
                    </div>
                  )}

                  {/* Address Form (only if "new" or no addresses) */}
                  {(selectedAddressId === "new" || addresses.length === 0) && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-4 border-t border-[#f0f0f0]">
                      <div>
                        <input
                          aria-label="Full Name"
                          placeholder="Full Name"
                          value={deliveryName}
                          onChange={(e) => setDeliveryName(e.target.value)}
                          className={`h-12 w-full rounded-xl border bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 placeholder:text-[#999] ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8e8e8]"}`}
                        />
                        {errors.name && <p className="mt-1.5 text-[10px] text-red-500 font-bold px-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="Phone Number"
                          type="tel"
                          placeholder="Phone Number"
                          value={deliveryPhone}
                          onChange={(e) => setDeliveryPhone(e.target.value)}
                          className={`h-12 w-full rounded-xl border bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 placeholder:text-[#999] ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8e8e8]"}`}
                        />
                        {errors.phone && <p className="mt-1.5 text-[10px] text-red-500 font-bold px-1">{errors.phone}</p>}
                      </div>
                      {deliveryMode !== "pickup" && (
                        <>
                          <div className="sm:col-span-2">
                            <input
                              aria-label="Full Address"
                              placeholder="Full Address"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className={`h-12 w-full rounded-xl border bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 placeholder:text-[#999] ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8e8e8]"}`}
                            />
                            {errors.address && <p className="mt-1.5 text-[10px] text-red-500 font-bold px-1">{errors.address}</p>}
                          </div>
                          <div>
                            <input
                              aria-label="City"
                              placeholder="City"
                              value={deliveryCity}
                              onChange={(e) => setDeliveryCity(e.target.value)}
                              className={`h-12 w-full rounded-xl border bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 placeholder:text-[#999] ${errors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8e8e8]"}`}
                            />
                            {errors.city && <p className="mt-1.5 text-[10px] text-red-500 font-bold px-1">{errors.city}</p>}
                          </div>
                          <div>
                            <input
                              aria-label="Pincode"
                              type="text"
                              inputMode="numeric"
                              placeholder="Pincode"
                              value={deliveryPincode}
                              onChange={(e) => setDeliveryPincode(e.target.value)}
                              className={`h-12 w-full rounded-xl border bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 placeholder:text-[#999] ${errors.pincode ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#e8e8e8]"}`}
                            />
                            {errors.pincode && <p className="mt-1.5 text-[10px] text-red-500 font-bold px-1">{errors.pincode}</p>}
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
                        {["Home", "Work", "Other"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setAddressType(type as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                              addressType === type
                                ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                                : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          onClick={handleSaveAddress}
                          className="w-full h-12 rounded-xl bg-black text-white font-bold text-sm transition-all hover:bg-black/80 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Save Delivery Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column — Order Summary & Payment */}
            <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
              {/* Coupon */}
              <section className="rounded-xl border border-[#e8e8e8] bg-white relative z-30">
                <SectionHeader icon={Tag} title="Apply Coupon" />
                <div className="p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 rounded-xl border border-[#e8e8e8] bg-[#f9f9f9] px-4 text-sm font-medium text-[#1a1a1a] outline-none transition-all focus:border-[#ff4f8b] focus:bg-white"
                      disabled={isValidating || !!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput("");
                          clearCoupon();
                          toast.success("Coupon removed");
                        }}
                        className="rounded-xl border border-[#e8e8e8] bg-white px-4 text-sm font-bold text-red-500 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (!couponInput) return;
                          const res = await validateCoupon({ code: couponInput, cartTotal: itemTotal });
                          if (res.success) {
                            setAppliedCoupon(couponInput);
                            toast.success(`Coupon applied!`);
                          } else {
                            toast.error(res.message || "Invalid coupon");
                          }
                        }}
                        disabled={!couponInput || isValidating}
                        className="flex items-center justify-center min-w-[80px] rounded-xl bg-[#ff4f8b] px-4 text-sm font-bold text-white transition hover:bg-[#e63872] disabled:bg-[#fccfe0] disabled:cursor-not-allowed"
                      >
                        {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <p className="mt-2 text-xs font-bold text-[#0c831f]">
                      Coupon applied successfully! You save ₹{couponDiscount}
                    </p>
                  )}
                </div>
              </section>

              {/* Bill Details */}
              <section className="rounded-xl border border-[#e8e8e8] bg-white">
                <SectionHeader icon={ReceiptText} title="Bill Details" />
                <div className="p-4 space-y-3">
                  <BillRow label="Item total" value={<>₹{itemTotal}</>} />
                  {couponDiscount > 0 && (
                    <BillRow label="Coupon discount" value={<span className="text-[#0c831f]">-₹{couponDiscount}</span>} />
                  )}
                  {subscriptionDiscount > 0 && (
                    <BillRow label="Subscription discount" value={<span className="text-[#0c831f]">-₹{subscriptionDiscount}</span>} />
                  )}
                  <BillRow
                    label="Delivery fee"
                    value={deliveryFee === 0 ? <span className="text-[#ff4f8b]">FREE</span> : <>₹{deliveryFee}</>}
                  />
                  <BillRow label="Handling fee" value={<>₹{handlingFee}</>} />
                  <div className="flex items-center justify-between border-t border-[#e8e8e8] pt-3 text-base font-black text-[#1a1a1a]">
                    <span>To pay</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="rounded-xl border border-[#e8e8e8] bg-white relative z-20">
                <SectionHeader icon={CreditCard} title="Payment Method" />
                <div className="p-4 space-y-2">
                  {[
                    { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive", icon: "ðŸ’µ" },
                    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", icon: "ðŸ’³" },
                    { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm", icon: "ðŸ“±" },
                    { id: "netbanking", label: "Net Banking", sub: "All major banks", icon: "ðŸ¦" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setPaymentMode("full");
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        selectedPayment === method.id
                          ? "border-[#ff4f8b] bg-[#fff0f6]"
                          : "border-[#e8e8e8] hover:border-[#ff4f8b]/30"
                      }`}
                    >
                      <span className="text-lg">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a1a1a]">{method.label}</p>
                        <p className="text-[10px] text-[#999]">{method.sub}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#ff4f8b]" />
                      )}
                    </button>
                  ))}

                  {/* EMI / BNPL options */}
                  {selectedPayment === "card" && (
                    <div className="pt-2 animate-slide-down">
                      <EmiBnpl
                        paymentMode={paymentMode}
                        onModeChange={setPaymentMode}
                        selectedEmi={selectedEmi}
                        onEmiChange={setSelectedEmi}
                        selectedBnpl={selectedBnpl}
                        onBnplChange={setSelectedBnpl}
                        total={total}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Place Order */}
              <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                <button
                  onClick={handlePlaceOrder}
                  className="flex h-12 w-full items-center justify-between rounded-xl bg-[#ff4f8b] px-4 text-sm font-black text-white transition hover:bg-[#e63872] disabled:cursor-not-allowed disabled:bg-[#cccccc]"
                  disabled={cart.length === 0 || isPlacingOrder}
                >
                  <span>{isPlacingOrder ? "Placing Order..." : "Place Order"}</span>
                  <span>
                    {cart.length > 0 ? (
                      isPlacingOrder ? (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        </span>
                      ) : (
                        <>₹{total}</>
                      )
                    ) : (
                      "Add items"
                    )}
                  </span>
                </button>
                {!selectedPayment && cart.length > 0 && (
                  <p className="text-[10px] text-[#ff4f8b] mt-1.5 text-center font-medium">
                    Select a payment method to continue
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
    </PullToRefresh>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-4 py-3">
      <Icon className="h-4 w-4 text-[#ff4f8b]" />
      <h2 className="text-sm font-black text-[#1a1a1a]">{title}</h2>
    </div>
  );
}

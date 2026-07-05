"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock3,
  ChevronRight,
  ChevronLeft,
  Truck,
  ReceiptText,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Bookmark,
  Trash2,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useUserCart } from "@/hooks/use-user-cart";
import { useSavedItemsStore } from "@/store/saved-items-store";
import { useShareCartStore } from "@/store/share-cart-store";
import { usePromotionsStore } from "@/store/promotions-store";
import Navbar from "@/components/ui/navbar";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import Container from "@/components/ui/layout/container";
import SwipeActions from "@/components/ui/mobile/swipe-actions";
import SaveForLater from "@/components/ui/cart/save-for-later";
import ShareCartModal from "@/components/ui/cart/share-cart-modal";
import BillRow from "@/components/ui/a11y/bill-row";
import { SafeProductImage } from "@/components/ui/safe-image";

export default function CartPage() {
  const { cartItems: cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, applyCoupon, removeCoupon, cartDetails, updateItemOptions, addBogoReward, appliedCoupon, setLocalAppliedCoupon, removeLocalAppliedCoupon } =
    useUserCart();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftOptions, setGiftOptions] = useState({ message: '', wrap: false, hidePrice: true });
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // All hooks MUST be declared before any early return (Rules of Hooks)
  // We use our new useUserCart hook to manage coupons on the backend if logged in.
  // Otherwise we manage local UI state.
  const [localCouponCode, setLocalCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { addItem } = useSavedItemsStore();
  const { shareCart } = useShareCartStore();
  
  const { validatePromotions, estimatedCashback, bogoRules } = usePromotionsStore();

  // BOGO Sync Effect
  useEffect(() => {
    if (!isHydrated || cart.length === 0) return;

    const triggerItemIds = cart.filter(i => !i.isBogoReward).map(i => String(i.id));
    const bogoItemIds = cart.filter(i => i.isBogoReward).map(i => String(i.id));

    bogoRules.forEach(rule => {
      const hasTrigger = triggerItemIds.includes(rule.triggerProductId);
      const hasReward = bogoItemIds.includes(rule.rewardProductId);

      if (hasTrigger && !hasReward && rule.isRewardInStock) {
        addBogoReward(rule.rewardProductId, rule.rewardProductMrp);
        toast.success(`BOGO offer applied! ${rule.rewardProductName} added for free.`, { duration: 3000 });
      } else if (!hasTrigger && hasReward) {
        removeFromCart(rule.rewardProductId);
        toast("BOGO offer removed as the qualifying item was removed.");
      }
    });
  }, [cart, bogoRules, addBogoReward, removeFromCart, isHydrated]);

  // ALL hooks must be declared before any early return (Rules of Hooks)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
    toast.success("Cart refreshed! ✓", { duration: 1500 });
  }, []);

  useEffect(() => {
    if (showCoupons && couponsList.length === 0) {
      setLoadingCoupons(true);
      import("@/services/cart.service").then(({ cartService }) => {
        cartService.getCoupons().then(res => {
          if (res && res.length > 0) {
            setCouponsList(res);
          } else {
            setCouponsList([]);
          }
        }).finally(() => setLoadingCoupons(false));
      });
    }
  }, [showCoupons, couponsList.length]);

  const itemTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );
  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );
  const deliveryFee = useMemo(
    () => {
      if (cartDetails?.deliveryFee !== undefined) return cartDetails.deliveryFee;
      return itemTotal > 499 || itemTotal === 0 ? 0 : 25;
    },
    [itemTotal, cartDetails]
  );
  const handlingFee = useMemo(() => (itemTotal > 0 && cartDetails?.deliveryFee === undefined ? 5 : 0), [itemTotal, cartDetails]);
  
  const discountAmount = useMemo(() => {
    if (cartDetails?.couponDiscount !== undefined) return cartDetails.couponDiscount;
    if (cartDetails?.discountAmount !== undefined) return cartDetails.discountAmount;
    if (!appliedCoupon) return 0;
    return Math.round((itemTotal * appliedCoupon.discount) / 100);
  }, [itemTotal, appliedCoupon, cartDetails]);

  const taxAmount = useMemo(() => {
    if (cartDetails?.tax !== undefined) return cartDetails.tax;
    if (itemTotal <= 0) return 0;
    const taxable = Math.max(0, itemTotal - discountAmount);
    return Number((taxable * 0.05).toFixed(2));
  }, [itemTotal, discountAmount, cartDetails]);

  const total = useMemo(
    () => {
      if (cartDetails?.total) return cartDetails.total;
      return Math.max(0, itemTotal + deliveryFee + handlingFee + taxAmount - discountAmount);
    },
    [itemTotal, deliveryFee, handlingFee, discountAmount, taxAmount, cartDetails]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validatePromotions(total, cart, null);
    }, 500); // debounce 500ms
    return () => clearTimeout(timeoutId);
  }, [total, cart, validatePromotions]);

  // Early return when not hydrated — safe because all hooks are declared above
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#f2f2f2]">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c831f]"></div>
        </div>
      </main>
    );
  }

  // Regular functions (not hooks) — safe after early return
  const handleSaveForLater = (item: typeof cart[0]) => {
    if (item) {
      addItem({
        productId: String(item.id),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
      removeFromCart(item.id);
      if (navigator.vibrate) navigator.vibrate(10);
      toast.success(`${item.name} saved for later!`, { duration: 2000 });
    }
  };

  const handleShareCart = () => {
    const id = shareCart(cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })));
    const shareUrl = `${window.location.origin}/cart/shared/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Cart link copied! Share it with friends.", {
      description: "They can view and order these items",
      duration: 3000,
    });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <main className="min-h-screen bg-[#f2f2f2] pb-36 md:pb-16">
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        <div className="bg-white border-b border-[#e8e8e8]">
          <Container>
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Link href="/" className="mt-1 p-1.5 -ml-2 hover:bg-[#f2f2f2] rounded-full transition-colors flex-shrink-0" aria-label="Go back">
                  <ChevronLeft className="w-6 h-6 text-[#1a1a1a]" />
                </Link>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0c831f]">
                    My Cart
                  </p>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-[#1a1a1a]">
                      {cart.length > 0
                        ? `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`
                        : "Your cart is empty"}
                    </h1>
                    {cart.length > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your cart?")) {
                            clearCart();
                            toast.success("Cart cleared");
                          }
                        }}
                        className="text-xs font-bold text-[#ff4f8b] hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[#e8f5e9] px-3 py-2 text-[#0c831f]">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-black">
                  Delivery in 10 minutes
                </span>
              </div>
            </div>
          </Container>
        </div>

        <Container>            <div className="py-4 sm:py-6">
            {cart.length === 0 ? (
              <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-[#e8e8e8] bg-white px-5 py-14 text-center shadow-sm" role="status">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5e9]">
                  <ShoppingBag className="h-8 w-8 text-[#0c831f]" />
                </div>
                <h2 className="mt-5 text-xl font-black text-[#1a1a1a]">
                  Nothing in your cart yet
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#666]">
                  Add fresh groceries, snacks, and daily essentials to start a
                  quick delivery order.
                </p>
                <Link
                  href="/"
                  className="mt-6 flex h-12 items-center justify-center rounded-lg bg-[#0c831f] px-6 text-sm font-black text-white transition hover:bg-[#0a6e1a]"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
                <section className="space-y-3" aria-label="Cart items and delivery">
                  <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff0f6] text-[#ff4f8b]">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1a1a1a]">
                          Delivery in 10 minutes
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-[#666]">
                          Shipment of {totalItems}{" "}
                          {totalItems === 1 ? "item" : "items"} from your
                          nearest FMCG partner store.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#e8e8e8] px-4 py-3">
                      <h2 className="text-sm font-black text-[#1a1a1a]">
                        Cart items
                      </h2>
                      <span className="text-xs font-bold text-[#666]">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="divide-y divide-[#f0f0f0]">
                      {cart.map((item, index) => (
                        <SwipeActions
                          key={`${item.id}-${index}`}
                          id={`cart-${item.id}-${index}`}
                          rightActions={[
                            {
                              icon: Trash2,
                              label: "Delete",
                              color: "text-white",
                              bgColor: "bg-[#dc2626]",
                              onClick: () => {
                                removeFromCart(item.id);
                                if (navigator.vibrate) navigator.vibrate(15);
                                toast.success(`${item.name} removed`, { duration: 1500 });
                              },
                            },
                            {
                              icon: Bookmark,
                              label: "Save",
                              color: "text-white",
                              bgColor: "bg-[#0c831f]",
                              onClick: () => handleSaveForLater(item),
                            },
                          ]}
                        >
                        <article
                          className="flex gap-3 p-3 sm:gap-4 sm:p-4"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#f2f2f2] sm:h-24 sm:w-24">
                            <SafeProductImage
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1a1a1a] sm:text-base flex items-center gap-2">
                                  {item.name}
                                  {item.isBogoReward && (
                                    <span className="text-[10px] font-black text-white bg-[#7c3aed] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                      FREE (BOGO)
                                    </span>
                                  )}
                                </h3>
                                <p className="mt-1 text-xs font-semibold text-[#999]">
                                  {item.weight || "500 g"}
                                </p>
                                <span className="mt-2 inline-flex items-center gap-1 rounded bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-black text-[#0c831f]">
                                  <Clock3 className="h-3 w-3" />
                                  10 mins
                                </span>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSaveForLater(item)}
                                  className="flex min-h-[44px] min-w-[44px] h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#999] transition hover:bg-[#e8f5e9] hover:text-[#0c831f]"
                                  aria-label={`Save ${item.name} for later`}
                                >
                                  <Bookmark className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="flex min-h-[44px] min-w-[44px] h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#999] transition hover:bg-[#fff0f6] hover:text-[#ff4f8b]"
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-end justify-between gap-3">
                              <div>
                                {item.isBogoReward ? (
                                  <div className="flex items-center gap-1">
                                    <p className="text-base font-black text-[#1a1a1a]">₹0</p>
                                    <p className="text-sm text-[#999] line-through">₹{item.bogoMrp}</p>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-base font-black text-[#1a1a1a]">
                                      &#8377;{(item.price * item.quantity).toFixed(0)}
                                    </p>
                                    <p className="text-xs text-[#999]">
                                      &#8377;{item.price} each
                                    </p>
                                  </>
                                )}
                              </div>

                              <div className="flex min-h-[44px] h-9 items-center overflow-hidden rounded-lg border-2 border-[#0c831f] bg-[#0c831f] text-white">
                                <button
                                  onClick={() => {
                                    if (item.isBogoReward) {
                                      toast("Remove the main item to remove this free offer.");
                                      return;
                                    }
                                    decreaseQuantity(item.id);
                                    if (item.quantity > 1) toast.success(`Decreased ${item.name} quantity`, { duration: 1000 });
                                  }}
                                  className="flex h-full min-w-[44px] w-9 items-center justify-center transition hover:bg-[#0a6e1a]"
                                  aria-label={`Decrease ${item.name}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="flex h-full min-w-8 items-center justify-center px-1 text-xs font-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    if (item.isBogoReward) {
                                      toast("Cannot increase quantity of free BOGO item.");
                                      return;
                                    }
                                    increaseQuantity(item.id);
                                    toast.success(`Increased ${item.name} quantity`, { duration: 1000 });
                                  }}
                                  className="flex h-full min-w-[44px] w-9 items-center justify-center transition hover:bg-[#0a6e1a]"
                                  aria-label={`Increase ${item.name}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Subscribe & Save Option */}
                            <div className="mt-2 pt-2 border-t border-[#f0f0f0]">
                              <label className="text-xs font-semibold text-[#1a1a1a] flex flex-col gap-1">
                                Purchase type:
                                <select
                                  value={item.subscription || "one-time"}
                                  onChange={(e) => {
                                    updateItemOptions(item.id, { subscription: e.target.value as any });
                                    toast.success(e.target.value === "one-time" ? "Changed to one-time purchase" : `Subscribed for ${e.target.value} delivery (10% off)`);
                                  }}
                                  className="mt-1 w-full max-w-[200px] rounded-md border border-[#e8e8e8] p-1.5 text-xs outline-none focus:border-[#0c831f]"
                                >
                                  <option value="one-time">One-time purchase</option>
                                  <option value="weekly">Subscribe & Save (Weekly - 10% off)</option>
                                  <option value="bi-weekly">Subscribe & Save (Bi-weekly - 10% off)</option>
                                  <option value="monthly">Subscribe & Save (Monthly - 10% off)</option>
                                </select>
                              </label>
                            </div>
                          </div>
                        </article>
                        </SwipeActions>
                      ))}
                    </div>
                  </div>

                  {/* Gift Options Section */}
                  <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#0c831f] rounded border-gray-300 focus:ring-[#0c831f]"
                        checked={isGiftOrder}
                        onChange={(e) => setIsGiftOrder(e.target.checked)}
                      />
                      <span className="text-sm font-bold text-[#1a1a1a]">This order contains a gift</span>
                    </label>
                    
                    {isGiftOrder && (
                      <div className="mt-4 pl-7 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-[#0c831f] rounded border-gray-300 focus:ring-[#0c831f]"
                            checked={giftOptions.hidePrice}
                            onChange={(e) => setGiftOptions({...giftOptions, hidePrice: e.target.checked})}
                          />
                          <span className="text-sm text-[#666]">Hide price on invoice</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-[#0c831f] rounded border-gray-300 focus:ring-[#0c831f]"
                            checked={giftOptions.wrap}
                            onChange={(e) => setGiftOptions({...giftOptions, wrap: e.target.checked})}
                          />
                          <span className="text-sm text-[#666]">Add gift wrap (₹50)</span>
                        </label>
                        <div className="pt-2">
                          <label className="text-xs font-semibold text-[#1a1a1a] block mb-1">Gift Message (Printed on card):</label>
                          <textarea 
                            value={giftOptions.message}
                            onChange={(e) => setGiftOptions({...giftOptions, message: e.target.value})}
                            placeholder="Happy Birthday! ..."
                            className="w-full rounded-md border border-[#e8e8e8] p-2 text-sm outline-none focus:border-[#0c831f] resize-none h-20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Address Shipping */}
                  <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1a1a]">Shipping to multiple addresses?</h3>
                        <p className="text-xs text-[#666] mt-1">Send items to different locations in one checkout.</p>
                      </div>
                      <Link href="/checkout?multiAddress=true" className="text-xs font-bold text-[#0c831f] hover:underline px-3 py-1.5 rounded-full bg-[#e8f5e9]">
                        Split Cart
                      </Link>
                    </div>
                  </div>

                  {/* Saved for Later */}
                  <SaveForLater />
                </section>

                <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
                   {(cartDetails?.couponCode || appliedCoupon) ? (
                     <div className="rounded-xl border border-[#0c831f] bg-[#e8f5e9] p-3 flex items-center justify-between">
                       <div>
                        <p className="text-xs font-bold text-[#0c831f]">
                          Coupon Applied: {cartDetails?.couponCode || appliedCoupon?.code}
                        </p>
                        <p className="text-[10px] text-[#0c831f]">
                          You saved &#8377;{discountAmount} on this order
                        </p>
                       </div>
                       <button 
                        onClick={async () => {
                          await removeCoupon();
                          removeLocalAppliedCoupon();
                          setCouponMessage(null);
                          toast.info("Coupon removed");
                        }}
                        className="text-[10px] font-black text-[#ff4f8b] uppercase"
                       >
                        Remove
                       </button>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-2 relative">
                       <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={localCouponCode}
                            onFocus={() => setShowCoupons(true)}
                            onChange={(e) => {
                              setLocalCouponCode(e.target.value);
                              setCouponMessage(null);
                            }}
                            className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm outline-none focus:border-[#ff4f8b] pr-10"
                          />
                          <Tag className="absolute right-3 top-2.5 h-4 w-4 text-[#999]" />
                        </div>
                        <button 
                          onClick={async () => {
                             if (!localCouponCode) return;
                             
                             const code = localCouponCode.toUpperCase();
                             const res = await applyCoupon(code);
                             
                             if (res && res.success === false && res.message?.includes("login")) {
                               // Fallback to local coupon logic
                               const matchedCoupon = couponsList.find(c => c.code === code);
                               
                               if (matchedCoupon) {
                                 const coupon = {
                                   discount: matchedCoupon.discountValue,
                                   type: matchedCoupon.discountType === "PERCENTAGE" ? "percent" : "fixed",
                                   minAmount: matchedCoupon.minOrder
                                 };
                                 
                                 if (itemTotal < coupon.minAmount) {
                                   setCouponMessage(`Min order ₹${coupon.minAmount} required`);
                                   toast.error(`Minimum order ₹${coupon.minAmount} needed for ${code}`);
                                   return;
                                 }
                                 setLocalAppliedCoupon({ code, discount: coupon.type === "percent" ? coupon.discount : Math.round((coupon.discount / itemTotal) * 100) });
                                 setCouponMessage("Coupon applied!");
                                 toast.success(`Coupon ${code} applied!`);
                                 setShowCoupons(false);
                               } else {
                                 setCouponMessage("Invalid code");
                                 toast.error("Invalid coupon code");
                               }
                             } else if (res && res.success) {
                               setCouponMessage("Coupon applied!");
                               toast.success(`Coupon ${code} applied successfully!`);
                               setShowCoupons(false);
                             } else if (res) {
                               setCouponMessage(res.message || "Invalid code");
                               toast.error(res.message || "Invalid coupon code");
                             }
                           }}
                          className="rounded-lg bg-[#ff4f8b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e63872]"
                        >
                          Apply
                        </button>
                       </div>

                       {/* Coupons Dropdown */}
                       {showCoupons && (
                         <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#e8e8e8] bg-white p-2 shadow-lg">
                           <div className="flex items-center justify-between px-2 pb-2 border-b border-[#e8e8e8] mb-2">
                             <h4 className="text-xs font-bold text-[#1a1a1a]">Available Coupons</h4>
                             <button onClick={() => setShowCoupons(false)} className="text-xs text-[#ff4f8b] font-bold">Close</button>
                           </div>
                           {loadingCoupons ? (
                             <div className="p-4 text-center text-xs text-[#999]">Loading coupons...</div>
                           ) : couponsList.length > 0 ? (
                             <div className="flex flex-col gap-2">
                               {couponsList.map((coupon, idx) => (
                                 <button
                                   key={idx}
                                   onClick={() => {
                                     setLocalCouponCode(coupon.code);
                                     setShowCoupons(false);
                                   }}
                                   className="flex flex-col items-start gap-1 rounded-lg border border-[#f2f2f2] p-3 text-left transition hover:border-[#ff4f8b] hover:bg-pink-50"
                                 >
                                   <div className="flex w-full items-center justify-between">
                                     <span className="font-bold text-[#1a1a1a]">{coupon.code}</span>
                                     <span className="text-[10px] font-bold text-[#0c831f] bg-[#e8f5e9] px-2 py-0.5 rounded border border-[#0c831f]">
                                       {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                     </span>
                                   </div>
                                   <span className="text-[10px] font-medium text-[#666]">
                                     {coupon.description || `Save on orders above ₹${coupon.minOrder}`}
                                   </span>
                                 </button>
                               ))}
                             </div>
                           ) : (
                             <div className="p-4 text-center text-xs text-[#999]">No coupons available</div>
                           )}
                         </div>
                       )}

                       {couponMessage && !showCoupons && (
                         <p className={`text-[10px] font-bold ${(cartDetails?.couponCode || appliedCoupon) ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
                           {couponMessage}
                         </p>
                       )}
                     </div>
                   )}

                  <div className="rounded-xl border border-[#e8e8e8] bg-white shadow-sm" role="region" aria-label="Bill details">
                    <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-4 py-3">
                      <ReceiptText className="h-4 w-4 text-[#0c831f]" />
                      <h2 className="text-sm font-black text-[#1a1a1a]">
                        Bill details
                      </h2>
                    </div>

                    <div className="space-y-3 px-4 py-3">
                      <BillRow
                        label="Item total"
                        value={
                          <>
                            &#8377;{itemTotal}
                          </>
                        }
                      />
                      {(cartDetails?.couponCode || appliedCoupon) && (
                        <BillRow
                          label="Coupon discount"
                          value={
                            <span className="text-[#0c831f]">
                              -&#8377;{discountAmount}
                            </span>
                          }
                        />
                      )}
                      <BillRow
                        label="Delivery fee"
                        value={
                          deliveryFee === 0 ? (
                            "FREE"
                          ) : (
                            <>
                              &#8377;{deliveryFee}
                            </>
                          )
                        }
                        valueClassName={
                          deliveryFee === 0 ? "text-[#ff4f8b]" : undefined
                        }
                      />
                      <BillRow
                        label="Handling fee"
                        value={
                          <>
                            &#8377;{handlingFee}
                          </>
                        }
                      />
                      {taxAmount > 0 && (
                        <BillRow
                          label="Taxes (5%)"
                          value={
                            <>
                              &#8377;{taxAmount}
                            </>
                          }
                        />
                      )}
                      {/* Backend does not currently support cashback
                      {estimatedCashback > 0 && (
                        <BillRow
                          label={
                            <span className="flex items-center gap-1 text-[#0c831f] font-bold">
                              <Tag className="w-3 h-3" />
                              Estimated Cashback
                            </span>
                          }
                          value={
                            <div className="text-right">
                              <span className="text-[#0c831f] font-bold">&#8377;{estimatedCashback}</span>
                              <p className="text-[9px] text-[#0c831f]/70">(credited after payment)</p>
                            </div>
                          }
                        />
                      )} */}
                      <div className="flex items-center justify-between border-t border-[#e8e8e8] pt-3 text-base font-black text-[#1a1a1a]">
                        <span>To pay</span>
                        <span>&#8377;{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#ff4f8b]" />
                      <p className="text-xs leading-5 text-[#666]">
                        Your order is packed by verified local partners and
                        protected by secure checkout.
                      </p>
                    </div>
                  </div>

                  {/* Share Cart */}
                  {cart.length > 0 && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0c831f] text-sm font-semibold text-[#0c831f] hover:bg-[#e8f5e9] transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Cart
                    </button>
                  )}

                  <Link
                    href="/checkout"
                    className="hidden h-12 w-full items-center justify-between rounded-xl bg-[#ff4f8b] px-4 text-sm font-black text-white transition hover:bg-[#e63872] lg:flex"
                  >
                    <span>Proceed to checkout</span>
                    <span>&#8377;{total}</span>
                  </Link>
                </aside>
              </div>
            )}
          </div>
        </Container>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-[57px] left-0 z-40 w-full border-t border-[#e8e8e8] bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:bottom-0 lg:hidden">
          <Container>
            <Link
              href="/checkout"
              className="flex h-12 w-full items-center justify-between rounded-xl bg-[#ff4f8b] px-4 text-sm font-black text-white transition hover:bg-[#e63872]"
            >
              <span>
                {totalItems} {totalItems === 1 ? "item" : "items"} | &#8377;
                {total}
              </span>
              <span className="flex items-center gap-1">
                Proceed
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </Container>
        </div>
      )}
      
      <ShareCartModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </main>
    </PullToRefresh>
  );
}







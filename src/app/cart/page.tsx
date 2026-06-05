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
import Navbar from "@/components/ui/navbar";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import Container from "@/components/ui/layout/container";
import SwipeActions from "@/components/ui/mobile/swipe-actions";
import SaveForLater from "@/components/ui/cart/save-for-later";
import ShareCartModal from "@/components/ui/cart/share-cart-modal";
import BillRow from "@/components/ui/a11y/bill-row";
import { SafeProductImage } from "@/components/ui/safe-image";

export default function CartPage() {
  const { cartItems: cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, applyCoupon, removeCoupon, cartDetails } =
    useUserCart();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // All hooks MUST be declared before any early return (Rules of Hooks)
  // We use our new useUserCart hook to manage coupons on the backend if logged in.
  // Otherwise we manage local UI state.
  const [localCouponCode, setLocalCouponCode] = useState("");
  const [localAppliedCoupon, setLocalAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { addItem } = useSavedItemsStore();
  const { shareCart } = useShareCartStore();

  // ALL hooks must be declared before any early return (Rules of Hooks)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
    toast.success("Cart refreshed! ✓", { duration: 1500 });
  }, []);

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
    if (!localAppliedCoupon) return 0;
    return Math.round((itemTotal * localAppliedCoupon.discount) / 100);
  }, [itemTotal, localAppliedCoupon, cartDetails]);

  const total = useMemo(
    () => {
      if (cartDetails?.total) return cartDetails.total;
      return Math.max(0, itemTotal + deliveryFee + handlingFee - discountAmount);
    },
    [itemTotal, deliveryFee, handlingFee, discountAmount, cartDetails]
  );

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
                                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1a1a1a] sm:text-base">
                                  {item.name}
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
                                <p className="text-base font-black text-[#1a1a1a]">
                                  &#8377;{(item.price * item.quantity).toFixed(0)}
                                </p>
                                <p className="text-xs text-[#999]">
                                  &#8377;{item.price} each
                                </p>
                              </div>

                              <div className="flex min-h-[44px] h-9 items-center overflow-hidden rounded-lg border-2 border-[#0c831f] bg-[#0c831f] text-white">
                                <button
                                  onClick={() => {
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
                          </div>
                        </article>
                        </SwipeActions>
                      ))}
                    </div>
                  </div>

                  {/* Saved for Later */}
                  <SaveForLater />
                </section>

                <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
                   {(cartDetails?.couponCode || localAppliedCoupon) ? (
                     <div className="rounded-xl border border-[#0c831f] bg-[#e8f5e9] p-3 flex items-center justify-between">
                       <div>
                        <p className="text-xs font-bold text-[#0c831f]">
                          Coupon Applied: {cartDetails?.couponCode || localAppliedCoupon?.code}
                        </p>
                        <p className="text-[10px] text-[#0c831f]">
                          You saved &#8377;{discountAmount} on this order
                        </p>
                       </div>
                       <button 
                        onClick={async () => {
                          await removeCoupon();
                          setLocalAppliedCoupon(null);
                          setCouponMessage(null);
                          toast.info("Coupon removed");
                        }}
                        className="text-[10px] font-black text-[#ff4f8b] uppercase"
                       >
                        Remove
                       </button>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-2">
                       <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={localCouponCode}
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
                               const coupons: Record<string, { discount: number; type: "percent" | "fixed"; minAmount: number }> = {
                                 "SAVE20":   { discount: 20,  type: "percent", minAmount: 0 },
                                 "FIRST50":  { discount: 50,  type: "fixed",   minAmount: 299 },
                                 "WELCOME10":{ discount: 10,  type: "percent", minAmount: 0 },
                                 "FMCG100":  { discount: 100, type: "fixed",   minAmount: 499 },
                                 "SUPER15":  { discount: 15,  type: "percent", minAmount: 199 },
                               };
                               const coupon = coupons[code];
                               if (coupon) {
                                 if (itemTotal < coupon.minAmount) {
                                   setCouponMessage(`Min order ₹${coupon.minAmount} required`);
                                   toast.error(`Minimum order ₹${coupon.minAmount} needed for ${code}`);
                                   return;
                                 }
                                 setLocalAppliedCoupon({ code, discount: coupon.type === "percent" ? coupon.discount : Math.round((coupon.discount / itemTotal) * 100) });
                                 setCouponMessage("Coupon applied!");
                                 toast.success(`Coupon ${code} applied!`);
                               } else {
                                 setCouponMessage("Invalid code");
                                 toast.error("Invalid coupon code");
                               }
                             } else if (res && res.success) {
                               setCouponMessage("Coupon applied!");
                               toast.success(`Coupon ${code} applied successfully!`);
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
                       {couponMessage && (
                         <p className={`text-[10px] font-bold ${(cartDetails?.couponCode || localAppliedCoupon) ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
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
                      {(cartDetails?.couponCode || localAppliedCoupon) && (
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







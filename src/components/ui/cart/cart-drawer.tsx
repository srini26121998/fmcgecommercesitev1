"use client";

import Image from "next/image";
import Link from "next/link";
import { SafeProductImage } from "@/components/ui/safe-image";
import {
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";

import { useUserCart } from "@/hooks/use-user-cart";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CartDrawer() {
  const { cartItems: cart, increaseQuantity, decreaseQuantity, removeFromCart, total: itemTotal } =
    useUserCart();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-[#e8e8e8] bg-white shadow-2xl sm:w-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4f8b]"></div>
      </div>
    );
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryFee = itemTotal > 499 || itemTotal === 0 ? 0 : 25;
  const handlingFee = itemTotal > 0 ? 5 : 0;
  const total = itemTotal + deliveryFee + handlingFee;

  return (
    <div className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-[#e8e8e8] bg-[#f2f2f2] shadow-2xl sm:w-96">
      <div className="border-b border-[#e8e8e8] bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff4f8b]">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#1a1a1a]">My Cart</h2>
            <p className="text-xs font-semibold text-[#666]">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#fff0f6] px-4 py-2 text-[#ff4f8b]">
        <Clock3 className="h-4 w-4" />
        <p className="text-xs font-black">Delivery in 10 minutes</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[#e8e8e8] bg-white px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f6]">
              <ShoppingBag className="h-7 w-7 text-[#ff4f8b]" />
            </div>
            <p className="mt-4 text-base font-black text-[#1a1a1a]">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-[#999]">Add items to get started</p>
            <Link
              href="/"
              className="mt-5 flex min-h-[44px] h-10 items-center justify-center rounded-lg bg-[#ff4f8b] px-4 text-xs font-black text-white hover:bg-[#e63872]"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#e8e8e8] bg-white p-3">
              <div className="flex gap-3">
                <Truck className="h-5 w-5 flex-shrink-0 text-[#0c831f]" />
                <div>
                  <p className="text-sm font-black text-[#1a1a1a]">
                    Shipment of {totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#666]">
                    Packed fresh from your nearest FMCG partner.
                  </p>
                </div>
              </div>
            </div>

            {cart.map((item, index) => (
              <article
                key={`${item.id}-${index}`}
                className="flex gap-3 rounded-xl border border-[#e8e8e8] bg-white p-3"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#f2f2f2]">
                  <SafeProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#1a1a1a]">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#999]">{item.weight || "500 g"}</p>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success(`${item.name} removed`);
                      }}
                      className="flex min-h-[44px] min-w-[44px] h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[#999] transition hover:bg-[#fff0f6] hover:text-[#ff4f8b]"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-[#1a1a1a]">
                        &#8377;{item.price * item.quantity}
                      </p>
                      <p className="text-[10px] text-[#999]">
                        &#8377;{item.price} each
                      </p>
                    </div>

                    <div className="flex min-h-[44px] h-8 items-center overflow-hidden rounded-lg border-2 border-[#ff4f8b] bg-[#ff4f8b] text-white">
                      <button
                        onClick={() => {
                          decreaseQuantity(item.id);
                          if (item.quantity > 1) toast.success(`Decreased ${item.name} quantity`);
                        }}
                        className="flex h-full min-w-[44px] w-8 items-center justify-center hover:bg-[#e63872]"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex min-w-7 items-center justify-center text-xs font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          increaseQuantity(item.id);
                          toast.success(`Increased ${item.name} quantity`);
                        }}
                        className="flex h-full min-w-[44px] w-8 items-center justify-center hover:bg-[#e63872]"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <button className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#ff4f8b] bg-white px-3 py-3 text-left hover-bg-pink-light">
              <Tag className="h-4 w-4 text-[#ff4f8b]" />
              <span className="flex-1 text-sm font-black text-[#ff4f8b]">
                Apply coupon
              </span>
              <ChevronRight className="h-4 w-4 text-[#ff4f8b]" />
            </button>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-[#e8e8e8] bg-white p-4">
          <div className="mb-3 space-y-2">
            <BillRow
              label="Item total"
              value={
                <>
                  &#8377;{itemTotal}
                </>
              }
            />
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
              valueClassName={deliveryFee === 0 ? "text-[#ff4f8b]" : ""}
            />
            <BillRow
              label="Handling fee"
              value={
                <>
                  &#8377;{handlingFee}
                </>
              }
            />
          </div>

          <Link
            href="/checkout"
            className="flex h-12 w-full items-center justify-between rounded-xl bg-[#ff4f8b] px-4 text-sm font-black text-white transition hover:bg-[#e63872]"
          >
            <span>Proceed to checkout</span>
            <span>&#8377;{total}</span>
          </Link>
        </div>
      )}
    </div>
  );
}


function BillRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#666]">{label}</span>
      <span className={`font-bold text-[#1a1a1a] ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

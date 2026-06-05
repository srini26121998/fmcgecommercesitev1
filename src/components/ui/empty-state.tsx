"use client";

import type { ReactNode } from "react";
import {
  PackageOpen,
  SearchX,
  Heart,
  ShoppingBag,
  RotateCcw,
  Filter,
} from "lucide-react";
import Link from "next/link";

export type EmptyStateVariant =
  | "default"
  | "search"
  | "wishlist"
  | "cart"
  | "orders"
  | "filtered";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

interface EmptyStateProps {
  /** Predefined variant or custom */
  variant?: EmptyStateVariant;
  /** Override the default title (optional) */
  title?: string;
  /** Override the default description (optional) */
  description?: string;
  /** Custom action buttons */
  actions?: EmptyStateAction[];
  /** Extra content below actions */
  children?: ReactNode;
}

const variantDefaults: Record<
  EmptyStateVariant,
  {
    icon: ReactNode;
    title: string;
    description: string;
    actions: EmptyStateAction[];
  }
> = {
  default: {
    icon: <PackageOpen className="w-10 h-10 text-[#ccc]" />,
    title: "Nothing here yet",
    description: "This section is currently empty. Check back later!",
    actions: [
      { label: "Browse Products", href: "/", icon: <ShoppingBag className="w-4 h-4" />, variant: "primary" },
    ],
  },
  search: {
    icon: <SearchX className="w-10 h-10 text-[#ccc]" />,
    title: "No product is available",
    description: "No product is available.",
    actions: [
      { label: "Browse all products", href: "/", variant: "primary" },
      { label: "Clear search", icon: <RotateCcw className="w-4 h-4" />, variant: "secondary" },
    ],
  },
  wishlist: {
    icon: <Heart className="w-10 h-10 text-[#ccc]" />,
    title: "Your wishlist is empty",
    description: "Save your favourite items to your wishlist and they'll show up here.",
    actions: [
      { label: "Explore products", href: "/search", variant: "primary" },
    ],
  },
  cart: {
    icon: <ShoppingBag className="w-10 h-10 text-[#ccc]" />,
    title: "Your cart is empty",
    description: "Looks like you haven't added anything yet. Browse our fresh selection!",
    actions: [
      { label: "Start shopping", href: "/", variant: "primary" },
    ],
  },
  orders: {
    icon: <PackageOpen className="w-10 h-10 text-[#ccc]" />,
    title: "No orders yet",
    description: "Place your first order and track it here.",
    actions: [
      { label: "Shop now", href: "/", variant: "primary" },
    ],
  },
  filtered: {
    icon: <Filter className="w-10 h-10 text-[#ccc]" />,
    title: "No product is available",
    description: "No product is available.",
    actions: [
      { label: "Clear all filters", icon: <RotateCcw className="w-4 h-4" />, variant: "secondary" },
    ],
  },
};

export default function EmptyState({
  variant = "default",
  title,
  description,
  actions,
  children,
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedActions = actions ?? defaults.actions;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mb-4">
        {defaults.icon}
      </div>

      <h2 className="text-xl font-black text-[#1a1a1a] mb-2">
        {resolvedTitle}
      </h2>

      <p className="text-sm text-[#999] max-w-sm mb-6 leading-relaxed">
        {resolvedDescription}
      </p>

      {resolvedActions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {resolvedActions.map((action, idx) => {
            const isPrimary = action.variant !== "secondary";
            const base =
              "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 min-w-[44px]";
            const cls = isPrimary
              ? `${base} bg-[#ff4f8b] text-white hover:bg-[#e63872]`
              : `${base} border-2 border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b]`;

            const content = (
              <>
                {action.icon}
                {action.label}
              </>
            );

            if (action.href) {
              return (
                <Link key={idx} href={action.href} className={cls}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={idx} onClick={action.onClick} className={cls}>
                {content}
              </button>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}

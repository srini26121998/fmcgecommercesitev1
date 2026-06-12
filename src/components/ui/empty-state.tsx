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
import { motion } from "framer-motion";

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
    icon: <PackageOpen className="w-12 h-12 text-pink" />,
    title: "Nothing here yet",
    description: "This section is currently empty. Check back later!",
    actions: [
      { label: "Browse Products", href: "/", icon: <ShoppingBag className="w-4 h-4" />, variant: "primary" },
    ],
  },
  search: {
    icon: <SearchX className="w-12 h-12 text-pink" />,
    title: "No product is available",
    description: "We couldn't find anything matching your search. Try adjusting your keywords.",
    actions: [
      { label: "Browse all products", href: "/", variant: "primary" },
      { label: "Clear search", icon: <RotateCcw className="w-4 h-4" />, variant: "secondary" },
    ],
  },
  wishlist: {
    icon: <Heart className="w-12 h-12 text-pink" />,
    title: "Your wishlist is empty",
    description: "Save your favourite items to your wishlist and they'll show up here.",
    actions: [
      { label: "Explore products", href: "/search", variant: "primary" },
    ],
  },
  cart: {
    icon: <ShoppingBag className="w-12 h-12 text-pink" />,
    title: "Your cart is empty",
    description: "Looks like you haven't added anything yet. Browse our fresh selection!",
    actions: [
      { label: "Start shopping", href: "/", variant: "primary" },
    ],
  },
  orders: {
    icon: <PackageOpen className="w-12 h-12 text-pink" />,
    title: "No orders yet",
    description: "Place your first order and track it here.",
    actions: [
      { label: "Shop now", href: "/", variant: "primary" },
    ],
  },
  filtered: {
    icon: <Filter className="w-12 h-12 text-pink" />,
    title: "No product matches filters",
    description: "Try removing some filters to see more results.",
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-pink/10 rounded-full blur-xl transform scale-150 animate-pulse"></div>
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-pink/5 to-pink/20 border border-pink/10 flex items-center justify-center shadow-inner"
        >
          {defaults.icon}
        </motion.div>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-3 tracking-tight"
      >
        {resolvedTitle}
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[15px] text-gray-500 max-w-sm mb-8 leading-relaxed font-medium"
      >
        {resolvedDescription}
      </motion.p>

      {resolvedActions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          {resolvedActions.map((action, idx) => {
            const isPrimary = action.variant !== "secondary";
            const base =
              "inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-8 rounded-xl text-[15px] font-bold transition-all duration-300 shadow-sm";
            const cls = isPrimary
              ? `${base} bg-gradient-to-r from-pink to-rose-500 text-white hover:shadow-lg hover:shadow-pink/25 hover:-translate-y-0.5`
              : `${base} bg-white border border-gray-200 text-gray-700 hover:border-pink hover:text-pink hover:bg-pink/5 hover:-translate-y-0.5`;

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
        </motion.div>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

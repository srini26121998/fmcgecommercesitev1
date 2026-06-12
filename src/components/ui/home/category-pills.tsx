"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, Variants } from "framer-motion";

export default function CategoryPills() {
  const { data: apiCategories, isLoading } = useCategories();

  const displayCategories = (apiCategories || []).map(c => ({
    label: c.name,
    emoji: c.image || "📦",
    slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-')
  }));

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <nav
      className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10"
      aria-label="Product categories"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <motion.ul 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar py-4 px-1"
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <motion.li variants={itemVariant} key={idx} className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px]">
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-sm" />
                <Skeleton className="h-3 w-16 mt-1" />
              </motion.li>
            ))
          ) : (
            displayCategories.map((item, idx) => (
              <motion.li variants={itemVariant} key={`${item.label}-${idx}`}>
                <Link
                  href={`/category/${item.slug}`}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-2 min-w-[80px] sm:min-w-[100px] px-2 py-3 rounded-2xl bg-gray-50/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] hover:bg-pink-50/50 hover:-translate-y-1.5 border border-gray-100 hover:border-pink-200 transition-all duration-300 group outline-none"
                  aria-label={`Browse ${item.label} category`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.emoji.startsWith("http") || item.emoji.startsWith("/") ? (
                      <img src={item.emoji} alt={item.label} className="w-6 h-6 sm:w-8 sm:h-8 object-contain z-10" />
                    ) : (
                      <span className="text-2xl sm:text-3xl z-10" aria-hidden="true">{item.emoji}</span>
                    )}
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-gray-700 group-hover:text-pink-600 whitespace-nowrap text-center leading-tight transition-colors">
                    {item.label}
                  </span>
                </Link>
              </motion.li>
            ))
          )}
        </motion.ul>
      </div>
    </nav>
  );
}

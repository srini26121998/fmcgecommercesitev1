"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useOrderStore } from "@/store/order-store";
import { SafeProductImage } from "@/components/ui/safe-image";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface QuadItem {
  id: string | number;
  name: string;
  image: string;
  href?: string;
}

interface QuadCardProps {
  title: string;
  items: QuadItem[];
  fallbackUrl?: string;
  linkText?: string;
  delay?: number;
}

function QuadCard({ title, items, fallbackUrl = "/search", linkText = "See more", delay = 0 }: QuadCardProps) {
  // Pad with placeholders if < 4 items
  const displayItems = [...items];
  while (displayItems.length < 4) {
    displayItems.push({
      id: `placeholder-${displayItems.length}`,
      name: "More items",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
    });
  }
  const topFour = displayItems.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-xl p-5 md:p-6 flex flex-col justify-between h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl border border-white/50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <h3 className="font-black text-xl text-gray-900 mb-5 line-clamp-1 tracking-tight z-10 relative">{title}</h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 flex-grow z-10 relative">
        {topFour.map((item, idx) => (
          <motion.div key={item.id + "-" + idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={item.href || `/product/${item.id}`}
              className="flex flex-col group outline-none"
            >
              <div className="aspect-square relative bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-sm group-hover:border-pink-200 group-hover:bg-pink-50/30 transition-all duration-300">
                <SafeProductImage
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 150px, 150px"
                  className="object-contain p-3 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-700 mt-2.5 line-clamp-1 group-hover:text-pink-600 transition-colors px-1">
                {item.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      <Link
        href={fallbackUrl}
        className="text-pink-600 hover:text-pink-700 text-sm font-black mt-auto inline-flex items-center gap-1 group/link w-fit bg-pink-50 px-4 py-2 rounded-full transition-colors z-10 relative"
      >
        {linkText}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.span>
      </Link>
    </motion.div>
  );
}

function AmazonQuadGrids() {
  const recentItems = useRecentlyViewedStore((s) => s.items);
  const orders = useOrderStore((s) => s.orders);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const orderedItems = orders.flatMap(o => o.items);

  // Mocks for static cards
  const topCategories = [
    { id: "cat1", name: "Groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop", href: "/category/groceries" },
    { id: "cat2", name: "Snacks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop", href: "/category/snacks" },
    { id: "cat3", name: "Beverages", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop", href: "/category/beverages" },
    { id: "cat4", name: "Health", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop", href: "/category/health" }
  ];

  const essentials = [
    { id: 110, name: "Sunflower Oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop" },
    { id: 111, name: "Basmati Rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop" },
    { id: 112, name: "Whole Wheat Atta", image: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=200&h=200&fit=crop" },
    { id: 113, name: "Toor Dal", image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=200&h=200&fit=crop" }
  ];

  if (!mounted) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 mt-[-30px] md:mt-[-60px] z-10 relative mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
        <QuadCard
          title="Pick up where you left off"
          items={recentItems.map(i => ({ id: i.id, name: i.name, image: i.image }))}
          fallbackUrl="/account/recently-viewed"
          delay={0.1}
        />
        <QuadCard
          title="Buy Again"
          items={orderedItems.map(i => ({ id: i.id, name: i.name, image: i.image }))}
          fallbackUrl="/account/buy-again"
          linkText="Shop your essentials"
          delay={0.2}
        />
        <QuadCard
          title="Top Categories for You"
          items={topCategories}
          fallbackUrl="/category/all"
          linkText="Shop all categories"
          delay={0.3}
        />
        <QuadCard
          title="Daily Essentials"
          items={essentials}
          fallbackUrl="/category/groceries"
          linkText="See more essentials"
          delay={0.4}
        />
      </div>
    </div>
  );
}

export default memo(AmazonQuadGrids);

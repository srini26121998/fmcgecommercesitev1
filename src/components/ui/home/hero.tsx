"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const displayPromotions = [
    {
      id: "fallback-1",
      name: "Up to 50% OFF",
      description: "On daily essentials & groceries",
      type: "flash_sale",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
      colors: ["#dc2626", "#ea580c"],
    },
    {
      id: "fallback-2",
      name: "Farm Fresh Veggies",
      description: "Delivered in 10 minutes",
      type: "new_arrivals",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
      colors: ["#059669", "#10b981"],
    },
    {
      id: "fallback-3",
      name: "Snacks & Beverages",
      description: "Stock up for the weekend",
      type: "weekend_special",
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
      colors: ["#7c3aed", "#a855f7"],
    },
  ];

  const [mainPromo, promo2, promo3] = displayPromotions;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <section
      ref={containerRef}
      className="w-full bg-slate-50 relative overflow-hidden"
      aria-label="Featured promotions"
      itemScope
      itemType="https://schema.org/OfferCatalog"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/40 via-purple-50/10 to-transparent"
        />
      </div>

      <meta itemProp="name" content="FMCG Commerce Featured Deals" />

      <motion.div
        style={{ y: y1, opacity }}
        className="mx-auto max-w-[1400px] px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24 relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8"
        >
          {/* Primary Banner (Spans 8 columns on large screens) */}
          <motion.div variants={itemVariants} className="lg:col-span-8 group perspective-1000">
            <Link href={`/offers/${mainPromo.id}`} aria-label={`${mainPromo.name} — ${mainPromo.description}`} className="block outline-none h-full">
              <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] h-full min-h-[400px] md:min-h-[500px] flex items-center shadow-xl hover:shadow-2xl transition-all duration-500 bg-black isolate transform-gpu">
                {/* Image Background */}
                <motion.div
                  className="absolute inset-0 z-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${mainPromo.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-overlay"
                    style={{ background: `linear-gradient(45deg, ${mainPromo.colors[0]}, ${mainPromo.colors[1]})` }}
                  />
                </motion.div>

                {/* Content */}
                <div className="relative z-10 w-full p-8 md:p-12 lg:p-16 flex flex-col items-start justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 shadow-inner"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-bold text-white tracking-widest uppercase">
                      {mainPromo.type.replace("_", " ")}
                    </span>
                  </motion.div>

                  <div className="max-w-xl">
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-4"
                    >
                      {mainPromo.name.split(" ").map((word, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="inline-block mr-[0.25em]"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="text-lg md:text-2xl text-gray-200 font-medium mb-10 max-w-md"
                    >
                      {mainPromo.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className="group/btn relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative text-lg flex items-center gap-2">
                          Shop Now
                          <motion.svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{ x: 5 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </motion.svg>
                        </span>
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary Banners (Spans 4 columns) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 lg:gap-8 h-full">
            {/* Promo 2 */}
            <motion.div variants={itemVariants} className="h-full">
              <Link href={`/offers/${promo2.id}`} className="block h-full group">
                <div className="relative overflow-hidden rounded-3xl h-full min-h-[200px] lg:min-h-[240px] flex items-end p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 isolate">
                  <motion.div
                    className="absolute inset-0 z-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${promo2.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-color"
                      style={{ background: promo2.colors[0] }}
                    />
                  </motion.div>

                  <div className="relative z-10 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 mb-3 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                      {promo2.type.replace("_", " ")}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">
                      {promo2.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 font-medium flex items-center justify-between">
                      {promo2.description}
                      <motion.span
                        className="bg-white text-black p-2 rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </motion.span>
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Promo 3 */}
            <motion.div variants={itemVariants} className="h-full">
              <Link href={`/offers/${promo3.id}`} className="block h-full group">
                <div className="relative overflow-hidden rounded-3xl h-full min-h-[200px] lg:min-h-[240px] flex items-end p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 isolate">
                  <motion.div
                    className="absolute inset-0 z-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${promo3.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-color"
                      style={{ background: promo3.colors[0] }}
                    />
                  </motion.div>

                  <div className="relative z-10 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                    <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 mb-3 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                      {promo3.type.replace("_", " ")}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">
                      {promo3.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 font-medium flex items-center justify-between">
                      {promo3.description}
                      <motion.span
                        className="bg-white text-black p-2 rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </motion.span>
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}


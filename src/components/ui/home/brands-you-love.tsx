"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const brands = [
  {
    id: "amul",
    name: "Amul",
    color: "bg-blue-600",
    tagline: "The Taste of India",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop",
  },
  {
    id: "coca-cola",
    name: "Coca Cola",
    color: "bg-red-600",
    tagline: "Real Magic",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop",
  },
  {
    id: "lays",
    name: "Lay's",
    color: "bg-yellow-500",
    tagline: "Betcha can't eat just one",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
  },
  {
    id: "maggi",
    name: "Maggi",
    color: "bg-orange-500",
    tagline: "2-Minute Noodles",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop",
  },
  {
    id: "cadbury",
    name: "Cadbury",
    color: "bg-purple-600",
    tagline: "Kuch Meetha Ho Jaye",
    image: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=400&h=400&fit=crop",
  },
  {
    id: "surf-excel",
    name: "Surf Excel",
    color: "bg-cyan-600",
    tagline: "Daag Achhe Hain",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop",
  },
  {
    id: "parle",
    name: "Parle",
    color: "bg-amber-600",
    tagline: "Bharat Ka Apna Biscuit",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
  },
  {
    id: "haldirams",
    name: "Haldiram's",
    color: "bg-rose-600",
    tagline: "Taste of Tradition",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop",
  },
];

export default function BrandsYouLove() {
  return (
    <section className="py-16 pb-24 md:pb-32 bg-white overflow-hidden border-t border-b border-gray-100 relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-start justify-start mb-8 text-left space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold mb-2 border border-red-100 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Top Brands
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-md md:text-xl lg:text-2xl font-black text-gray-900 tracking-tight"
          >
            Brands You <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Love</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium max-w-lg text-sm md:text-base"
          >
            Shop from your favorite brands with guaranteed authenticity.
          </motion.p>
        </div>

        {/* Infinite Marquee */}
        <div className="relative flex overflow-hidden -mx-4 md:mx-0">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

          <motion.div
            className="flex whitespace-nowrap gap-6 py-6 px-4"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35,
                ease: "linear",
              },
            }}
          >
            {/* Duplicated for infinite scroll effect */}
            {[...brands, ...brands].map((brand, index) => (
              <motion.div
                key={`${brand.id}-${index}`}
                whileHover={{ scale: 1.05, y: -10, rotate: index % 2 === 0 ? 2 : -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0"
              >
                <Link
                  href={`/search?brand=${brand.id}`}
                  className="group flex flex-col items-center justify-center w-40 h-48 md:w-48 md:h-56 rounded-[2rem] shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] overflow-hidden relative"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 160px, 192px"
                  />

                  {/* Color overlay to maintain brand identity */}
                  <div className={`absolute inset-0 opacity-40 mix-blend-multiply ${brand.color} transition-opacity duration-500 group-hover:opacity-20`}></div>

                  {/* Dark gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  <div className="relative z-10 flex flex-col items-center p-4 h-full justify-end w-full text-white text-center pb-6">
                    <span className="text-xl md:text-2xl font-black mb-1 tracking-tight group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
                      {brand.name}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90 group-hover:opacity-100 whitespace-normal line-clamp-2 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 drop-shadow-sm text-gray-200 group-hover:text-white">
                      {brand.tagline}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";

const categories = [
  {
    id: "fruits-veggies",
    name: "Fruits & Veggies",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop",
    color: "bg-green-100",
  },
  {
    id: "dairy-bakery",
    name: "Dairy & Bakery",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop",
    color: "bg-yellow-100",
  },
  {
    id: "snacks-munchies",
    name: "Snacks & Munchies",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=400&auto=format&fit=crop",
    color: "bg-orange-100",
  },
  {
    id: "beverages",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
    color: "bg-blue-100",
  },
  {
    id: "personal-care",
    name: "Personal Care",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
    color: "bg-pink-100",
  },
  {
    id: "home-care",
    name: "Home Care",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=400&auto=format&fit=crop",
    color: "bg-purple-100",
  },
  {
    id: "meat-seafood",
    name: "Meat & Seafood",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=400&auto=format&fit=crop",
    color: "bg-red-100",
  },
  {
    id: "sweet-tooth",
    name: "Sweet Tooth",
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop",
    color: "bg-rose-100",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function ShopByCategory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-md md:text-xl lg:text-2xl font-black text-gray-900 tracking-tight"
        >
          Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Category</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Link href="/category" className="group flex items-center gap-1 text-sm md:text-base font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100">
            See All
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              &rarr;
            </motion.span>
          </Link>
        </motion.div>
      </div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 lg:gap-8"
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={itemVariants} className="relative">
            <Link href={`/category/${category.id}`} className="group flex flex-col items-center text-center space-y-3 w-full outline-none">
              <motion.div
                whileHover={{ scale: 1.08, y: -8, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-[2rem] p-1.5 transition-shadow duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ${category.color} shadow-sm z-10`}
              >
                {/* Animated decorative ring on hover */}
                <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-emerald-400/50 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />

                <div className="w-full h-full relative overflow-hidden rounded-[1.65rem] bg-white shadow-inner">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-3"
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 128px"
                  />
                  {/* Subtle overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>

              <div className="relative overflow-hidden w-full px-1">
                <span className="text-[10px] md:text-xs lg:text-sm font-bold text-gray-700 leading-tight block transform transition-transform duration-300 group-hover:-translate-y-full">
                  {category.name}
                </span>
                <span className="text-[10px] md:text-xs lg:text-sm font-black text-emerald-600 leading-tight block absolute inset-x-0 px-1 top-full transform transition-transform duration-300 group-hover:-translate-y-full">
                  {category.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

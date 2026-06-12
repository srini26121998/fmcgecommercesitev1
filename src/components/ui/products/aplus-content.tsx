"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { SafeProductImage } from "@/components/ui/safe-image";

interface AplusContentProps {
  productName: string;
  category: string;
}

export default function AplusContent({ productName, category }: AplusContentProps) {
  return (
    <section className="mt-6 rounded-3xl border border-[#e8e8e8] bg-white overflow-hidden shadow-sm">
      {/* Brand Story / Hero Image */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-[#f9f9f9]">
        <SafeProductImage
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=600&q=80"
          alt={`${productName} Brand Story`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center p-8 md:p-16">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              Premium Quality, <br/><span className="text-[#ff4f8b]">Everyday Value.</span>
            </h2>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-md">
              Discover the true taste of freshness with our carefully sourced {category.toLowerCase()} essentials. From farm to your doorstep in minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8 md:p-12">
        {/* Rich Feature Blocks */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16">
          <div>
            <h3 className="text-2xl font-black text-[#1a1a1a] mb-4">Sourced with Care</h3>
            <p className="text-[#666] leading-relaxed mb-6">
              Our {productName} is selected through a rigorous 5-step quality check process. We work directly with trusted suppliers to ensure that only the best products make it to our shelves and into your home. Experience the difference in every use.
            </p>
            <ul className="space-y-3">
              {[
                "100% Quality Assured",
                "Hygienically Packed",
                "Freshness Guaranteed",
                "No Artificial Additives"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-[#1a1a1a]">
                  <CheckCircle2 className="w-5 h-5 text-[#0c831f]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[250px] rounded-2xl overflow-hidden shadow-sm">
            <SafeProductImage
              src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=600&h=400&q=80"
              alt="Quality Check"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-8">
          <h3 className="text-2xl font-black text-[#1a1a1a] mb-6 text-center">Why Choose Us?</h3>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="p-4 text-left border border-[#e8e8e8] font-bold text-[#1a1a1a] rounded-tl-xl w-1/3">Features</th>
                  <th className="p-4 text-center border border-[#e8e8e8] font-black text-[#0c831f] w-1/3 bg-[#e8f5e9]">Our {productName}</th>
                  <th className="p-4 text-center border border-[#e8e8e8] font-bold text-[#666] rounded-tr-xl w-1/3">Regular Alternatives</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Delivery Speed", us: "10 Minutes", them: "2-3 Days" },
                  { feature: "Quality Checks", us: "5-Step Process", them: "Basic Checks" },
                  { feature: "Packaging", us: "Eco-friendly, Tamper-proof", them: "Standard Plastic" },
                  { feature: "Return Policy", us: "Instant No-Questions-Asked", them: "Complex Process" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="p-4 border border-[#e8e8e8] text-sm font-semibold text-[#1a1a1a]">{row.feature}</td>
                    <td className="p-4 border border-[#e8e8e8] text-center font-bold text-[#0c831f] bg-[#f0fdf4]">
                      <div className="flex items-center justify-center gap-2">
                        {row.us === "Yes" ? <CheckCircle2 className="w-4 h-4" /> : row.us}
                      </div>
                    </td>
                    <td className="p-4 border border-[#e8e8e8] text-center text-sm text-[#666]">
                      <div className="flex items-center justify-center gap-2">
                         {row.them === "No" ? <XCircle className="w-4 h-4 text-[#dc2626]" /> : row.them}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

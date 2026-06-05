"use client";

import Link from "next/link";

export default function Hero() {
  const displayPromotions = [
    {
      id: "fallback-1",
      name: "Up to 50% OFF",
      description: "On daily essentials & groceries",
      type: "flash_sale",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
      colors: ["rgba(220, 38, 38, 0.9)", "rgba(249, 115, 22, 0.85)"]
    },
    {
      id: "fallback-2",
      name: "Farm Fresh Veggies",
      description: "Delivered in 10 minutes",
      type: "new_arrivals",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
      colors: ["rgba(5, 150, 105, 0.92)", "rgba(16, 185, 129, 0.85)"]
    },
    {
      id: "fallback-3",
      name: "Snacks & Beverages",
      description: "Stock up for the weekend",
      type: "weekend_special",
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
      colors: ["rgba(139, 92, 246, 0.92)", "rgba(168, 85, 247, 0.85)"]
    }
  ];

  const [mainPromo, promo2, promo3] = displayPromotions;

  return (
    <section
      className="w-full bg-white"
      aria-label="Featured promotions"
      itemScope
      itemType="https://schema.org/OfferCatalog"
    >
      <meta itemProp="name" content="FMCG Commerce Featured Deals" />
      <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        {/* Hero / primary banner - Flash Sale */}
        <Link
          href={`/offers/${mainPromo.id}`}
          aria-label={`${mainPromo.name} — ${mainPromo.description}`}
          className="relative block overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 transition hover:opacity-95"
          style={{
            backgroundImage: `linear-gradient(to right, ${mainPromo.colors[0]}, ${mainPromo.colors[1]}), url('${mainPromo.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="hidden" itemProp="description">
            {mainPromo.name} — {mainPromo.description}
          </span>
          <div className="relative z-10 max-w-lg">
            <span className="mb-3 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
              {mainPromo.type.replace("_", " ")}
            </span>
            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl drop-shadow-sm">
              {mainPromo.name}
            </h1>
            <p className="mt-2 mb-4 text-sm text-white/90 sm:text-base">
              {mainPromo.description}
            </p>
            <span className="inline-flex h-8 sm:h-9 items-center rounded-lg bg-white px-4 text-xs sm:text-sm font-black text-[#dc2626] transition hover:bg-white/95 sm:px-5 shadow-sm cursor-pointer">
              Shop Now
            </span>
          </div>
        </Link>

        {/* Secondary banners */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Fresh Arrivals - Veggies */}
          <Link
            href={`/offers/${promo2.id}`}
            aria-label={`${promo2.name} — ${promo2.description}`}
            className="relative overflow-hidden rounded-xl p-4 transition hover:opacity-95 sm:p-6"
            style={{
              backgroundImage: `linear-gradient(to right, ${promo2.colors[0]}, ${promo2.colors[1]}), url('${promo2.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10">
              <span className="mb-2 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                {promo2.type.replace("_", " ")}
              </span>
              <h3 className="text-base font-black text-white sm:text-lg drop-shadow-sm line-clamp-1">
                {promo2.name}
              </h3>
              <p className="mt-1 text-xs text-white/90 sm:text-sm line-clamp-1">
                {promo2.description}
              </p>
            </div>
          </Link>

          {/* Weekend Special - Snacks */}
          <Link
            href={`/offers/${promo3.id}`}
            aria-label={`${promo3.name} — ${promo3.description}`}
            className="relative overflow-hidden rounded-xl p-4 transition hover:opacity-95 sm:p-6"
            style={{
              backgroundImage: `linear-gradient(to right, ${promo3.colors[0]}, ${promo3.colors[1]}), url('${promo3.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10">
              <span className="mb-2 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                {promo3.type.replace("_", " ")}
              </span>
              <h3 className="text-base font-black text-white sm:text-lg drop-shadow-sm line-clamp-1">
                {promo3.name}
              </h3>
              <p className="mt-1 text-xs text-white/90 sm:text-sm line-clamp-1">
                {promo3.description}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { env } from "@/lib/env";
import { safeJsonLd } from "@/lib/utils";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import Navbar from "@/components/ui/navbar";
import Hero from "@/components/ui/home/hero";
import CategoryPills from "@/components/ui/home/category-pills";
import PromoBanner from "@/components/ui/home/promo-banner";
import FlashSaleSection from "@/components/ui/home/flash-sale-section";
import FeaturedProducts from "@/components/ui/home/featured-products";
import RecommendationSection from "@/components/ui/products/recommendation-section";
import RecentlyViewed from "@/components/ui/home/recently-viewed";
import ReorderReminders from "@/components/ui/home/reorder-reminders";
import NearbyTrends from "@/components/ui/home/nearby-trends";
import ProductGrid from "@/components/ui/products/product-grid";
import ProductView360 from "@/components/ui/home/product-view-360";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import Footer from "@/components/ui/footer";

const DEMO_360_PRODUCT = {
  id: 1,
  name: "Fortune Sunflower Oil 1L",
  image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
  category: "Groceries",
};

export default function HomeClient() {
  const [show360, setShow360] = useState(false);
  const handleRefresh = useCallback(async () => {
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Homepage refreshed! ✨", { duration: 1500 });
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <main
        className="bg-[#f2f2f2] min-h-screen md:pb-0 page-with-bottom-nav"
        itemScope
        itemType="https://schema.org/WebSite"
      >
        {/* Structured Data: Organization + LocalBusiness + SearchAction + FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([
              {
                "@context": "https://schema.org",
                "@type": ["Organization", "LocalBusiness"],
                name: "FMCG Commerce",
                url: env.siteUrl,
                logo: `${env.siteUrl}/logo.png`,
                description:
                  "Ultra-fast grocery delivery in India. Fresh products delivered in under 10 minutes.",
                areaServed: "India",
                priceRange: "₹10–₹5,000",
                currenciesAccepted: "INR",
                paymentAccepted: ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
                openingHours: "Mo-Su 06:00-23:00",
                sameAs: [
                  "https://facebook.com/fmcgcommerce",
                  "https://twitter.com/fmcgcommerce",
                  "https://instagram.com/fmcgcommerce",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How fast is the delivery?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We deliver fresh groceries in under 10 minutes across all serviceable areas.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is delivery free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, delivery is free on all orders above ₹199. A small delivery fee applies for orders below ₹199.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What payment methods do you accept?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, and Cash on Delivery.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I return a product?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, we offer easy returns and replacements for damaged or unsatisfactory products.",
                    },
                  },
                ],
              },
            ]),
          }}
        />

        {/* WebSite SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: env.siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${env.siteUrl}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* BreadcrumbList */}
        <nav aria-label="Breadcrumb" className="sr-only">
          <ol itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <meta itemProp="position" content="1" />
              <a itemProp="item" href="/">
                <span itemProp="name">Home</span>
              </a>
            </li>
          </ol>
        </nav>

        <Navbar />

        {/* Offset for fixed navbar */}
        <div className="pt-[72px] sm:pt-20">
          <Hero />
          <CategoryPills />
          <PromoBanner />
          <FlashSaleSection />
          <FeaturedProducts />
          <RecentlyViewed />
          <ReorderReminders />
          <NearbyTrends />
          <RecommendationSection />
          <ProductGrid />
        </div>

        <Footer />
        <BottomNav />

        {/* 360° View — demo trigger */}
        <div className="fixed bottom-24 md:bottom-4 right-4 z-30">
          <button
            onClick={() => setShow360(true)}
            className="min-w-[44px] min-h-[44px] h-12 w-12 rounded-full bg-gradient-to-br from-[#ff4f8b] to-[#e63872] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Open 360° product view"
          >
            <span className="text-[10px] font-black leading-tight text-center">
              360°
            </span>
          </button>
        </div>

        <ProductView360
          isOpen={show360}
          onClose={() => setShow360(false)}
          product={DEMO_360_PRODUCT}
        />
      </main>
    </PullToRefresh>
  );
}

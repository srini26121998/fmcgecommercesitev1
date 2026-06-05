import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { safeJsonLd } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { categoriesService } from "@/services/categories.service";
import { productService } from "@/services/products.service";
import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import CategoryClient from "@/components/ui/category/category-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let categoryLabel = slug;
  try {
    const res = await categoriesService.getCategories();
    const cat = res.categories.find(c => c.slug === slug || c.id === slug);
    if (cat) {
      categoryLabel = cat.name;
    } else {
      notFound();
    }
  } catch (e) {
    notFound();
  }
  
  return {
    title: `Buy ${categoryLabel} Online | FMCG Commerce — Ultra-fast Delivery`,
    description: `Shop fresh ${categoryLabel.toLowerCase()} online at FMCG Commerce. Wide selection of ${categoryLabel.toLowerCase()} with 10-minute delivery. Free delivery above ₹199. Best prices guaranteed.`,
    keywords: [`${categoryLabel.toLowerCase()} online`, `buy ${categoryLabel.toLowerCase()}`, `${categoryLabel.toLowerCase()} delivery`, `fresh ${categoryLabel.toLowerCase()}`, `FMCG ${categoryLabel.toLowerCase()}`, `grocery ${categoryLabel.toLowerCase()} India`],
    robots: { index: true, follow: true },
    alternates: { canonical: `${env.siteUrl}/category/${slug}` },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `${env.siteUrl}/category/${slug}`,
      title: `Buy ${categoryLabel} Online | FMCG Commerce`,
      description: `Shop fresh ${categoryLabel.toLowerCase()} online with 10-minute delivery. Best prices & free delivery above ₹199.`,
      siteName: "FMCG Commerce",
    },
    twitter: {
      card: "summary",
      title: `Buy ${categoryLabel} Online | FMCG Commerce`,
      description: `Fresh ${categoryLabel.toLowerCase()} delivered in 10 minutes. Order now!`,
      creator: "@fmcgcommerce",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  let categoryName = slug;
  let categoryEmoji = "📦";
  let items: any[] = [];

  try {
    // 1. Fetch category metadata from API
    const catRes = await categoriesService.getCategories();
    const cat = catRes.categories.find(c => c.slug === slug || c.id === slug);
    
    if (cat) {
      categoryName = cat.name;
      categoryEmoji = cat.image || "📦";
    } else {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching category metadata from API:", error);
    notFound();
  }

  // 2. Fetch products for this category
  try {
    const prodRes = await productService.getProducts({ category: categoryName }, { pageSize: 50 });
    items = prodRes.products;
  } catch (error) {
    console.error("Error fetching products from API:", error);
    items = [];
  }

  return (
    <main className="bg-[#f2f2f2] min-h-screen pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryName} | FMCG Commerce`,
            description: `Shop fresh ${categoryName.toLowerCase()} online with 10-minute delivery.`,
            url: `${env.siteUrl}/category/${slug}`,
            numberOfItems: items.length,
          }),
        }}
      />
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        {/* Page header */}
        <div className="bg-white border-b border-[#e8e8e8] sticky top-[72px] sm:top-20 z-10">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] w-8 h-8 rounded-full bg-[#f2f2f2] hover:bg-[#ffe6f0] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#1a1a1a]" />
            </Link>
            <div className="flex items-center gap-2">
              {categoryEmoji.startsWith("http") || categoryEmoji.startsWith("/") ? (
                <img src={categoryEmoji} alt={categoryName} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-2xl leading-none">{categoryEmoji}</span>
              )}
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#1a1a1a] font-royal leading-tight">
                  {categoryName}
                </h1>
                <p className="text-[11px] text-[#999]">{items.length} products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid with sorting & pagination */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <CategoryClient
            items={items}
            categoryEmoji={categoryEmoji}
            categoryLabel={categoryName}
          />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

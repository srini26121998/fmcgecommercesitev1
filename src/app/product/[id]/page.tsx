import { productService } from "@/services/products.service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import { SafeProductImage } from "@/components/ui/safe-image";
import { Star, Clock, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import CarouselRow from "@/components/ui/products/carousel-row";
import ProductDetailActions from "@/components/ui/products/product-detail-actions";
import ProductDetailWishlist from "@/components/ui/products/product-detail-wishlist";
import ReviewsQA from "@/components/ui/products/reviews-qa";
import RecentlyViewedTracker from "@/components/ui/products/recently-viewed-tracker";
import PriceAlertButton from "@/components/ui/products/price-alert-button";
import StickyAddToCart from "@/components/ui/products/sticky-add-to-cart";
import CommunityListsSection from "@/components/ui/products/community-lists-section";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productService.getProductById(id);
  if (!product) return { title: "Product Not Found | FMCG Commerce" };
  
  const discount = Math.round(
    ((product.mrp - product.price) / (product.mrp || 1)) * 100
  );
  
  const productImage = product.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80";
  
  return {
    title: `${product.name} — ₹${product.price} | FMCG Commerce`,
    description: `Buy ${product.name} at ₹${product.price} (${discount}% off). ${product.category} product with 10-minute delivery in India. Fresh quality assured. Free delivery above ₹199.`,
    keywords: [product.name, `${product.category} product`, `buy ${product.name} online`, `${product.name} price`, `FMCG ${product.name}`, `grocery delivery ${product.name}`],
    robots: { index: true, follow: true },
    alternates: { canonical: `${env.siteUrl}/product/${id}` },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `${env.siteUrl}/product/${id}`,
      title: `${product.name} — ₹${product.price} | FMCG Commerce`,
      description: `Buy ${product.name} at ₹${product.price} (${discount}% off). 10-minute delivery. Free delivery above ₹199.`,
      siteName: "FMCG Commerce",
      images: [{ url: productImage, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Just ₹${product.price} | FMCG Commerce`,
      description: `${product.name} with ${discount}% off. 10-min delivery. Fresh guaranteed.`,
      images: [productImage],
      creator: "@fmcgcommerce",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    notFound();
  }

  const discount = Math.round(
    ((product.mrp - product.price) / (product.mrp || 1)) * 100
  );
  
  const productImage = product.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80";
  const productRating = 4.5; // Default for API products as they don't have ratings yet

  const relatedResult = await productService.getProducts({ category: product.category }, { page: 1, pageSize: 19 });
  const relatedProducts = relatedResult.products
    .filter((item) => item.id !== product.id)
    .slice(0, 18);

  // split related products into 3 fixed rows (6 items per row) so each row scrolls independently
  const relatedRows = (() => {
    const rows = [] as typeof relatedProducts[];
    const perRow = 6;
    for (let i = 0; i < 3; i++) {
      rows.push(relatedProducts.slice(i * perRow, (i + 1) * perRow));
    }
    return rows;
  })();

  const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');

  const featureHighlights = [
    {
      title: "Fresh stock, fast delivery",
      description: "Verified daily and delivered in 10 mins, just like top quick commerce apps.",
      icon: Clock,
      tone: "bg-[#fff0f6] text-[#ff4f8b] border-[#ff4f8b]",
    },
    {
      title: "Quality promise",
      description: "Handpicked products with freshness checks and easy replacement.",
      icon: ShieldCheck,
      tone: "bg-[#f0fdf4] text-[#0c831f] border-[#0c831f]",
    },
    {
      title: "Smart value",
      description: "Instant savings and combo-style offers for your everyday essentials.",
      icon: Star,
      tone: "bg-[#fdf2f8] text-[#9f1239] border-[#ff4f8b]",
    },
  ];

  const mockReviews = [
    { id: 1, name: "Priya Sharma", date: "2 days ago", rating: 5, comment: "Absolutely fresh! The quality exceeded my expectations. Will definitely order again.", likes: 12, verified: true },
    { id: 2, name: "Amit Patel", date: "1 week ago", rating: 4, comment: "Great product for the price. Delivery was super fast as always.", likes: 8, verified: true },
    { id: 3, name: "Sneha Reddy", date: "2 weeks ago", rating: 5, comment: "Love the quality! FMCG Commerce never disappoints. Highly recommended.", likes: 15, verified: true },
    { id: 4, name: "Rahul Verma", date: "3 weeks ago", rating: 4, comment: "Good quality and timely delivery. Would appreciate better packaging though.", likes: 6, verified: false },
  ];

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-20 md:pb-0">
      <Navbar />
      <RecentlyViewedTracker product={{ ...product, image: productImage, oldPrice: product.mrp, rating: productRating, stock: product.stock > 0 ? "in_stock" : "out_of_stock" } as any} />

      <div className="pt-[72px] sm:pt-20">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#e8e8e8] px-3 sm:px-4 md:px-6 py-2.5">
          <div className="max-w-[1400px] mx-auto flex items-center gap-1.5 text-xs text-[#999]">
            <Link href="/" className="hover:text-[#ff4f8b] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/category/${categorySlug}`} className="hover:text-[#ff4f8b] transition-colors">{product.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1a1a1a] font-semibold truncate">{product.name}</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

              {/* Image */}
              <div className="relative bg-[#f9f9f9] aspect-square md:aspect-auto md:min-h-[400px] flex items-center justify-center p-6 sm:p-10">
                {discount > 0 && (
                  <span className="absolute top-4 left-4 text-xs font-black text-white bg-[#ff4f8b] px-2 py-1 rounded-lg z-10">
                    {discount}% OFF
                  </span>
                )}
                 <div className="relative w-full max-w-xs sm:max-w-sm h-80">
                     <SafeProductImage
                     src={productImage}
                     alt={product.name}
                     fill
                     className="w-full object-contain"
                     sizes="(max-width: 640px) 320px, 400px"
                   />
                </div>
              </div>

              {/* Details */}
              <div className="p-4 sm:p-6 md:p-8 border-t md:border-t-0 md:border-l border-[#e8e8e8]">

                {/* Category + rating */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#0c831f] bg-[#e8f5e9] px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 bg-[#0c831f] text-white text-xs font-bold px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-white" />
                    {productRating}
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight">
                  {product.name}
                </h1>

                {/* Delivery badge */}
                <div className="flex items-center gap-2 mt-3 mb-4">
                  <div className="flex items-center gap-1.5 bg-[#fff0f6] border border-[#ff4f8b] rounded-lg px-3 py-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#ff4f8b]" />
                    <span className="text-xs font-bold text-[#1a1a1a]">Delivery in 10 mins</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-2xl sm:text-3xl font-black text-[#1a1a1a]">
                    ₹{product.price}
                  </p>
                  <p className="text-base text-[#999] line-through">
                    ₹{product.mrp}
                  </p>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-[#ff4f8b]">
                      {discount}% off
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#666] leading-relaxed mb-6">
                  {product.name} is a premium quality {product.category.toLowerCase()} item carefully sourced to ensure maximum freshness and value. Delivered straight to your door in 10 minutes, making it perfect for your everyday grocery needs.
                </p>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { icon: Clock, label: "10 min delivery" },
                    { icon: ShieldCheck, label: "Quality assured" },
                    { icon: RotateCcw, label: "Easy returns" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center justify-center gap-1 bg-[#f9f9f9] rounded-lg p-2 text-center">
                      <Icon className="w-4 h-4 text-[#0c831f]" />
                      <span className="text-[10px] font-semibold text-[#666]">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Add to cart + wishlist */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProductDetailActions product={{ id: product.id, name: product.name, price: product.price, image: productImage, stock: product.stock > 0 ? "in_stock" : "out_of_stock" } as any} />
                  </div>
                  <ProductDetailWishlist product={{ ...product, image: productImage, oldPrice: product.mrp, rating: productRating } as any} />
                </div>

                {/* Price alert */}
                <div className="mt-3">
                  <PriceAlertButton product={{ ...product, image: productImage, oldPrice: product.mrp, rating: productRating } as any} />
                </div>

              </div>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-4">
            <div className="grid gap-3 md:grid-cols-3">
              {featureHighlights.map(({ title, description, icon: Icon, tone }) => (
                <div
                  key={title}
                  className={`rounded-3xl border px-4 py-4 sm:px-5 sm:py-5 ${tone} border-opacity-50 shadow-sm`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-xl text-black shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-black text-[#1a1a1a]">{title}</h3>
                  </div>
                  <p className="text-xs leading-5 text-[#444]">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <ReviewsQA productRating={productRating} />
            </div>

            <div className="mt-6">
              <CommunityListsSection />
            </div>

            <section className="mt-6 rounded-3xl border border-[#e8e8e8] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#0c831f]">
                    Related products
                  </p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#1a1a1a]">
                    More items from {product.category}
                  </h2>
                  <p className="mt-2 text-sm text-[#666] max-w-2xl">
                    Discover similar groceries and fresh essentials that pair well with this product.
                  </p>
                </div>
                <Link
                  href={`/category/${categorySlug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#ff4f8b] bg-[#fff0f6] px-4 text-sm font-black text-[#ff4f8b] transition hover:bg-[#ff4f8b] hover:text-white"
                >
                  View all {product.category}
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {relatedRows.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.length > 0 ? (
                      <CarouselRow items={row.map(p => ({
                        ...p,
                        oldPrice: p.mrp,
                        rating: 4.5,
                        image: p.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80",
                        stock: p.stock > 0 ? "in_stock" : "out_of_stock"
                      } as any))} />
                    ) : (
                      <div className="rounded-3xl border border-dashed border-[#e8e8e8] bg-[#f9f9f9] p-8 text-center text-sm font-semibold text-[#666]">
                        No related products available yet. Explore other categories for more great finds.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
       <StickyAddToCart product={{ id: product.id, name: product.name, price: product.price, image: productImage, stock: product.stock > 0 ? "in_stock" : "out_of_stock" } as any} />
    </main>
  );
}

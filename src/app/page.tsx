import { Metadata } from "next";
import Navbar from "@/components/ui/navbar";
import Hero from "@/components/ui/home/hero";
import CategoryPills from "@/components/ui/home/category-pills";
import PromoBanner from "@/components/ui/home/promo-banner";
import RecommendationSection from "@/components/ui/products/recommendation-section";
import ProductGrid from "@/components/ui/products/product-grid";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import Footer from "@/components/ui/footer";
import HomeClient from "@/components/ui/home/home-client";

import { env } from "@/lib/env";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FMCG Commerce — Online Grocery Delivery in 10 Minutes",
  description:
    "Order fresh groceries, vegetables, fruits, snacks, dairy & beverages online at FMCG Commerce. 10-minute delivery, free delivery above ₹199, AI-powered deals.",
  keywords: [
    "online grocery India",
    "10 minute delivery grocery",
    "free grocery delivery above ₹199",
    "fresh vegetables online",
    "fruits delivery",
    "snacks online India",
    "dairy products online",
    "beverages delivery",
    "daily essentials",
    "instant grocery app",
    "AI grocery recommendations",
    "cashback on groceries",
    "FMCG shopping",
    "online supermarket India",
  ],
  authors: [{ name: "FMCG Commerce" }],
  creator: "FMCG Commerce",
  publisher: "FMCG Commerce",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: env.siteUrl },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: env.siteUrl,
    title: "FMCG Commerce — Groceries & Daily Essentials in 10 Minutes",
    description:
      "Order online fresh groceries, vegetables, fruits, snacks, dairy & beverages delivered in 10 minutes. Free delivery above ₹199.",
    siteName: "FMCG Commerce",
    images: [
      {
        url: `${env.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "FMCG Commerce — Online Grocery Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FMCG Commerce — Groceries Delivered in 10 Minutes",
    description:
      "Fresh groceries, vegetables, fruits, snacks, dairy & beverages at best prices. Free delivery above ₹199.",
    images: [`${env.siteUrl}/og-image.png`],
    creator: "@fmcgcommerce",
  },
  metadataBase: new URL(env.siteUrl),
};

export default function Home() {
  return (
    <HomeClient />
  );
}

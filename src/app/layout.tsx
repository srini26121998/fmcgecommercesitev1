import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ui/error-boundary";
import LayoutClient from "./layout-client";
import SkipLink from "@/components/ui/a11y/skip-link";
import GroceryAssistant from "@/components/ui/grocery-assistant/grocery-assistant";
import { GlobalLoader } from "@/components/ui/global-loader";
import { env } from "@/lib/env";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FMCG Commerce — Ultra-fast Grocery Delivery",
  description: "Premium AI-powered grocery commerce delivering fresh groceries, vegetables, fruits, snacks, dairy, and beverages across India in under 10 minutes. Best prices, free delivery on orders above ₹199.",
  keywords: ["grocery delivery", "online groceries", "fresh vegetables", "fruits online", "snacks delivery", "dairy products", "beverages", "instant delivery", "10 minute delivery", "FMCG", "ecommerce groceries", "Blinkit alternative", "BigBasket alternative", "online shopping India", "daily essentials", "organic groceries"],
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
  alternates: {
    canonical: env.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: env.siteUrl,
    title: "FMCG Commerce — Ultra-fast Grocery Delivery in India",
    description: "Premium AI-powered grocery delivery in 10 minutes. Fresh groceries, vegetables, fruits, snacks, dairy & beverages at the best prices.",
    siteName: "FMCG Commerce",
    images: [
      {
        url: `${env.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "FMCG Commerce — Ultra-fast Grocery Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FMCG Commerce — Ultra-fast Grocery Delivery",
    description: "Fresh groceries, fruits, snacks & more delivered in 10 minutes. Free delivery on orders above ₹199.",
    images: [`${env.siteUrl}/og-image.png`],
    creator: "@fmcgcommerce",
  },
  metadataBase: new URL(env.siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} font-sans`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f2f2f2] relative" suppressHydrationWarning>
        <SkipLink />
        <LayoutClient>
          <ErrorBoundary>
            <main id="main-content" tabIndex={-1} className="relative z-10">
              {children}
            </main>
          </ErrorBoundary>
        </LayoutClient>
        <GroceryAssistant />
        <GlobalLoader />
        <Toaster position="top-right" className="z-50" />
      </body>
    </html>
  );
}

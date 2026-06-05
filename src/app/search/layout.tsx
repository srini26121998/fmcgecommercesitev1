import { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Search Groceries & Daily Essentials | FMCG Commerce",
  description:
    "Search and shop from 10,000+ groceries, fresh vegetables, fruits, snacks, dairy & beverages at FMCG Commerce. Fastest grocery delivery in under 10 minutes.",
  keywords: [
    "search groceries",
    "search vegetables",
    "fruits online India",
    "snacks online search",
    "grocery search engine",
    "find dairy products",
    "beverages delivery search",
    "instant grocery search India",
    "FMCG product search",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${env.siteUrl}/search` },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${env.siteUrl}/search`,
    title: "Search Groceries & Daily Essentials | FMCG Commerce",
    description:
      "Search 10,000+ groceries, vegetables, fruits, snacks, dairy & beverages and get 10-minute delivery.",
    siteName: "FMCG Commerce",
  },
  twitter: {
    card: "summary",
    title: "Search Groceries | FMCG Commerce",
    description: "Search fresh groceries and daily essentials delivered in 10 minutes.",
    creator: "@fmcgcommerce",
  },
  metadataBase: new URL(env.siteUrl),
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Deals & Offers | FMCG Commerce — Up to 50% Off",
  description:
    "Exclusive deals, flash sales & combo offers at FMCG Commerce. Save up to 50% on groceries, vegetables, fruits, snacks & daily essentials. Shop the latest deals today.",
  keywords: [
    "grocery deals India",
    "flash sale groceries",
    "discount on groceries",
    "combo offers",
    "deal of the day groceries",
    "upto 50% off groceries",
    "online shopping offers",
    "grocery coupons",
    "instant delivery offers",
    "FMCG discounts",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${env.siteUrl}/offers` },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${env.siteUrl}/offers`,
    title: "Deals & Offers | Save Up to 50% | FMCG Commerce",
    description:
      "Flash sales, deal of the day and combo offers. Shop groceries at minimum prices with free delivery above ₹199.",
    siteName: "FMCG Commerce",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grocery Deals & Offers | FMCG Commerce",
    description:
      "Up to 50% off on groceries. Flash sales, daily deals & combo offers.",
    creator: "@fmcgcommerce",
  },
  metadataBase: new URL(env.siteUrl),
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

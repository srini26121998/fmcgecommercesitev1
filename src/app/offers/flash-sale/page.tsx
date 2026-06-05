import type { Metadata } from "next";
import FlashSaleClient from "./client-page";

export const metadata: Metadata = {
  title: "Flash Sale — Up to 50% OFF | FMCG Commerce",
  description: "Biggest savings on daily essentials and groceries. Shop now and save up to 50% off during our limited-time Flash Sale!",
};

export default function FlashSalePage() {
  return <FlashSaleClient />;
}

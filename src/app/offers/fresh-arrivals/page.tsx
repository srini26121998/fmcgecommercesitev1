import type { Metadata } from "next";
import FreshArrivalsClient from "./client-page";

export const metadata: Metadata = {
  title: "Fresh Arrivals — Farm Fresh Veggies & Fruits | FMCG Commerce",
  description: "Check out our newest arrivals! Farm fresh vegetables, seasonal fruits, and newly stocked essentials delivered in 10 minutes.",
};

export default function FreshArrivalsPage() {
  return <FreshArrivalsClient />;
}

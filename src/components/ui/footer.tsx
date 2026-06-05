"use client";

import Link from "next/link";
import { ChevronUp, Apple, Smartphone, ShieldCheck, CreditCard, Banknote } from "lucide-react";

const footerSections = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About FMCG", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press & Media", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Our Technology", href: "/technology" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Help Center", href: "/account/help" },
      { label: "Track Your Order", href: "/account/orders" },
      { label: "Returns & Refunds", href: "/account/help" },
      { label: "Shipping Info", href: "/account/help" },
      { label: "Contact Us", href: "/account/help" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/account/orders" },
      { label: "Delivery Addresses", href: "/account/addresses" },
      { label: "Payment Methods", href: "/account/payment" },
      { label: "Gift Cards", href: "/account/gift-cards" },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell on FMCG", href: "/admin/vendors" },
      { label: "Affiliate Program", href: "/affiliate" },
      { label: "Advertise Your Products", href: "/advertise" },
      { label: "Become a Delivery Partner", href: "/partner/delivery" },
      { label: "Bulk Orders", href: "/bulk-orders" },
    ],
  },
  {
    title: "Shop by Category",
    links: [
      { label: "Groceries", href: "/category/groceries" },
      { label: "Fruits & Vegetables", href: "/category/fruits" },
      { label: "Dairy & Beverages", href: "/category/dairy" },
      { label: "Snacks & Health", href: "/category/snacks" },
      { label: "Offers & Deals", href: "/offers" },
    ],
  },
  {
    title: "Payment Methods",
    links: [
      { label: "UPI (GPay, PhonePe)", href: "/account/payment" },
      { label: "Credit & Debit Cards", href: "/account/payment" },
      { label: "Net Banking", href: "/account/payment" },
      { label: "Cash on Delivery", href: "/account/payment" },
      { label: "Wallet", href: "/account/payment" },
    ],
  },
];

const paymentMethods = [
  { name: "Visa", icon: CreditCard },
  { name: "MC", icon: CreditCard },
  { name: "UPI", icon: Smartphone },
  { name: "COD", icon: Banknote },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#e8e8e8] bg-white mt-8">
      {/* ── Back to Top ── */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#f8f9fa] hover:bg-[#f0f1f3] transition-all duration-200 py-3 flex items-center justify-center gap-2 text-sm font-bold text-[#666] border-b border-[#e8e8e8] btn-press"
      >
        <ChevronUp className="w-4 h-4" />
        Back to top
      </button>

      {/* ── Main Footer Content ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#666] hover:text-[#ff4f8b] transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[#e8e8e8]" />

      {/* ── Middle bar: Logo + Payment + App Download ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="min-w-[44px] min-h-[44px] w-9 h-9 rounded-lg bg-[#ff4f8b] flex items-center justify-center group-hover:bg-[#e63872] transition-colors">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <div>
              <span className="font-black text-[#1a1a1a] text-lg leading-none block">FMCG</span>
              <span className="text-[10px] text-[#999] font-medium">Ultra-fast delivery</span>
            </div>
          </Link>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#999] font-medium">We accept</span>
            <div className="flex items-center gap-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="h-8 px-3 rounded-lg bg-[#f2f2f2] border border-[#e8e8e8] flex items-center gap-1.5 text-[10px] font-bold text-[#666]"
                >
                  <pm.icon className="w-3.5 h-3.5" />
                  {pm.name}
                </div>
              ))}
            </div>
          </div>

          {/* App Download */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#999] font-medium">Download App</span>
            <div className="flex gap-2">
              <div className="min-h-[44px] h-9 px-4 rounded-xl bg-[#f2f2f2] border border-[#e8e8e8] flex items-center gap-2 text-xs font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all duration-200 btn-press cursor-pointer">
                <Apple className="w-4 h-4" />
                App Store
              </div>
              <div className="min-h-[44px] h-9 px-4 rounded-xl bg-[#f2f2f2] border border-[#e8e8e8] flex items-center gap-2 text-xs font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all duration-200 btn-press cursor-pointer">
                <Smartphone className="w-4 h-4" />
                Google Play
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Badges ── */}
      <div className="border-t border-[#e8e8e8] bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <ShieldCheck className="w-4 h-4 text-[#0c831f]" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <span className="w-1 h-1 rounded-full bg-[#e8e8e8]" />
              10-min Delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <span className="w-1 h-1 rounded-full bg-[#e8e8e8]" />
              100% Fresh Guarantee
            </div>
            <div className="flex items-center gap-2 text-xs text-[#666]">
              <span className="w-1 h-1 rounded-full bg-[#e8e8e8]" />
              Easy Returns
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright Bar ── */}
      <div className="border-t border-[#e8e8e8] bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#999]">
              <span>&copy; 2026 FMCG Commerce. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-[#ff4f8b] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#ff4f8b] transition-colors">Terms of Service</Link>
              <Link href="/sitemap" className="hover:text-[#ff4f8b] transition-colors">Sitemap</Link>
            </div>
            {/* <div className="flex items-center gap-3 text-xs text-[#999]">
              <span>Made with ❤️ in India</span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

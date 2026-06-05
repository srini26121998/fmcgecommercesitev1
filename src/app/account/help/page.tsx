"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Phone, Mail, ChevronDown, Search, HelpCircle, BookOpen, ExternalLink, FileText } from "lucide-react";

const faqs = [
  { question: "How to track my order?", answer: "Go to 'Your Orders' section and tap on the order you want to track. You'll see real-time updates on the delivery status." },
  { question: "What is the delivery time?", answer: "We deliver within 10-15 minutes for orders placed in serviceable areas. Delivery times may vary based on distance and traffic conditions." },
  { question: "How to cancel an order?", answer: "Orders can be cancelled before they are dispatched. Go to 'Your Orders', find the order, and tap 'Cancel'. Once dispatched, cancellation may not be possible." },
  { question: "What payment methods are accepted?", answer: "We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery." },
  { question: "How to request a refund?", answer: "Refunds are processed within 5-7 business days. For prepaid orders, refunds go back to the original payment method. For COD, we'll initiate a bank transfer." },
  { question: "Can I change my delivery address?", answer: "Yes, you can change the delivery address before the order is dispatched. Go to the order details and tap 'Change Address'." },
];

const helpTopics = [
  { name: "Order Issues", desc: "Cancellations, refunds, tracking", icon: FileText, color: "text-[#1565c0]", bg: "bg-[#e3f2fd]" },
  { name: "Payment & Billing", desc: "Payment failures, invoices, receipts", icon: BookOpen, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
  { name: "Account & Settings", desc: "Login, profile, security", icon: HelpCircle, color: "text-[#7b1fa2]", bg: "bg-[#f3e5f5]" },
  { name: "Delivery & Pickup", desc: "Timings, address changes, tracking", icon: ExternalLink, color: "text-[#e65100]", bg: "bg-[#fff3e0]" },
];

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Help & Support</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-6">

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#e8e8e8] text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#ff4f8b] focus:ring-2 focus:ring-[#ff4f8b]/10 transition-all"
          />
        </div>

        {/* ── Quick Help Topics ── */}
        <div className="grid grid-cols-2 gap-3">
          {helpTopics.map((topic) => (
            <button
              key={topic.name}
              className="bg-white rounded-2xl border border-[#e8e8e8] p-4 text-left hover:shadow-md hover:border-[#ff4f8b]/20 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${topic.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <topic.icon className={`w-5 h-5 ${topic.color}`} />
              </div>
              <h3 className="font-semibold text-sm text-[#1a1a1a] group-hover:text-[#ff4f8b] transition-colors">{topic.name}</h3>
              <p className="text-xs text-[#666] mt-0.5">{topic.desc}</p>
            </button>
          ))}
        </div>

        {/* ── Contact Us ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8e8e8]">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Contact Us</h3>
          </div>
          <div className="divide-y divide-[#e8e8e8]">
            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#0c831f]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-[#1a1a1a]">Chat with Us</p>
                <p className="text-xs text-[#666]">Available 24/7 • Get instant help</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#0c831f] animate-pulse" />
            </button>
            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#fff0f6] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#ff4f8b]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-[#1a1a1a]">Call Us</p>
                <p className="text-xs text-[#666]">+91 1800 123 456 • Toll-free</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#ccc] flex-shrink-0" />
            </button>
            <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#e3f2fd] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#1565c0]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-[#1a1a1a]">Email Us</p>
                <p className="text-xs text-[#666]">support@fmcg.com • 24hr response</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#ccc] flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* ── FAQs ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8e8e8]">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-[#e8e8e8]">
            {(searchQuery ? filteredFaqs : faqs).map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <span className="font-semibold text-sm text-[#1a1a1a] flex-1 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#999] flex-shrink-0 transition-transform duration-200 ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-[#666] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {searchQuery && filteredFaqs.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[#666]">No results found for &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-[#999] mt-1">Try different keywords or contact us</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

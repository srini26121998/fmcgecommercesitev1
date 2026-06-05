import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | FMCG Commerce",
  description: "The page you are looking for does not exist or has been removed.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#ff4f8b] flex items-center justify-center mb-4">
            <span className="text-4xl font-black text-white">F</span>
          </div>
        </div>
        <h1 className="text-6xl font-black text-[#1a1a1a] mb-2">404</h1>
        <p className="text-xl font-bold text-[#666] mb-2">Page not found</p>
        <p className="text-sm text-[#999] mb-8">
          This page doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0c831f] px-6 text-sm font-black text-white hover:bg-[#0a6e1a] transition-colors w-full sm:w-auto"
          >
            Go Home
          </Link>
          <Link
            href="/category/groceries"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white px-6 text-sm font-black text-[#1a1a1a] hover:bg-[#f6f7f6] transition-colors w-full sm:w-auto"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  );
}

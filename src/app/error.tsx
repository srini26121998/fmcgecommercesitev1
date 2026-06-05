"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[App Error Boundary] Caught error:", error.message);
    if (error.stack) {
      console.error("[App Error Boundary] Stack trace:", error.stack);
    }
    console.error("[App Error Boundary] Digest:", error.digest);
    console.error("[App Error Boundary] Path where error occurred:", window?.location?.href);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#ff4f8b] flex items-center justify-center mb-4">
            <span className="text-4xl font-black text-white">!</span>
          </div>
        </div>
        <h1 className="text-5xl font-black text-[#1a1a1a] mb-2">Oops!</h1>
        <p className="text-xl font-bold text-[#666] mb-2">Something went wrong</p>
        <p className="text-sm text-[#999] mb-8 leading-relaxed">
          We encountered an unexpected issue. Don&apos;t worry — your cart is safe.
          Try refreshing or head back home.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0c831f] px-6 text-sm font-black text-white hover:bg-[#0a6e1a] transition-colors w-full sm:w-auto"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white px-6 text-sm font-black text-[#1a1a1a] hover:bg-[#f6f7f6] transition-colors w-full sm:w-auto"
          >
            Go Home
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-xs font-bold text-[#999] hover:text-[#666]">
              Error details (dev only)
            </summary>
            <pre className="mt-2 rounded-xl bg-[#1a1a1a] p-4 text-xs text-[#f6f7f6] overflow-auto max-h-48 leading-relaxed">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}

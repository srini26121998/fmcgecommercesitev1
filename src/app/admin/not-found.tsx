import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f2] p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff0f6]">
            <Search className="h-10 w-10 text-[#ff4f8b]" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-[#1a1a1a]">404</h1>
        <h2 className="mt-2 text-xl font-bold text-[#1a1a1a]">Page not found</h2>
        <p className="mt-3 text-sm leading-6 text-[#666]">
          The admin page you&apos;re looking for doesn&apos;t exist or is still being built.
          Check the sidebar for available sections.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl bg-[#ff4f8b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#e63872]"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-5 py-3 text-sm font-black text-[#1a1a1a] transition hover:bg-[#f8f9fa]"
          >
            <ArrowLeft className="h-4 w-4" />
            Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}


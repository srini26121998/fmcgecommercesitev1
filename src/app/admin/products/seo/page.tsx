"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import SEOEditor from "@/components/ui/products/admin/seo-editor";
import { useProductSEO } from "@/hooks/use-products";
import { RefreshCw } from "lucide-react";

export default function SEOPage() {
  const { seoItems, loading, error, fetchSEO, updateSEO } = useProductSEO();
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchSEO(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">SEO Management</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Manage meta titles, descriptions, slugs, and Open Graph data for product pages. {seoItems.length} products with SEO data.
              </p>
            </div>
            <button
              onClick={() => fetchSEO()}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <SEOEditor
          items={seoItems}
          onUpdate={updateSEO}
          onSearch={handleSearch}
          searchValue={search}
          isLoading={loading}
        />
      </div>
    </DashboardLayout>
  );
}


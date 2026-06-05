"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import MediaUploader from "@/components/ui/products/admin/media-uploader";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import { useProductMedia, useProducts } from "@/hooks/use-products";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function MediaPage() {
  const {
    mediaItems,
    loading,
    uploading,
    error,
    fetchMedia,
    uploadMedia,
    deleteMedia,
    setPrimaryMedia,
  } = useProductMedia();

  // Fetch all products so we can render a product selector in the upload panel
  const { products } = useProducts({}, 200);

  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchMedia(value);
  };

  // Called by MediaUploader when user clicks "Upload N files"
  const handleUpload = async (
    productId: string,
    files: File[],
    meta: { alt: string; sortOrder: number; isPrimary: boolean }
  ): Promise<boolean> => {
    const success = await uploadMedia(productId, files, meta);
    if (success) {
      toast.success(`${files.length} file${files.length !== 1 ? "s" : ""} uploaded successfully`);
    } else {
      toast.error("Upload failed ₹ please try again");
    }
    return success;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Product Media</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Upload and manage product images, videos, and documents.{" "}
                {mediaItems.length} media file{mediaItems.length !== 1 ? "s" : ""} across all products.
              </p>
            </div>
            <button
              id="media-refresh-btn"
              onClick={() => fetchMedia(search || undefined)}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </section>

        <ReusableSearchBar value={search} onChange={handleSearch} placeholder="Search by product name₹" />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* MediaUploader now receives the product list and real upload handler */}
        <MediaUploader
          items={mediaItems}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          onDelete={async (id) => {
            const success = await deleteMedia(id);
            if (success) toast.success("Media deleted");
            else toast.error("Failed to delete media");
          }}
          onSetPrimary={async (id) => {
            const success = await setPrimaryMedia(id);
            if (success) toast.success("Primary image updated");
            else toast.error("Failed to update primary image");
          }}
          onUpload={handleUpload}
          isLoading={loading}
          uploading={uploading}
        />
      </div>
    </DashboardLayout>
  );
}

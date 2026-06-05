"use client";

import { useState, useCallback } from "react";
import { ImagePlus, Video, Trash2, Star, Upload, Eye, X, Loader2, ChevronDown } from "lucide-react";

interface MediaItem {
  id: string;
  productId: string;
  productName: string;
  type: "image" | "video" | "document";
  url: string;
  alt: string;
  isPrimary: boolean;
  uploadedAt: string;
  product?: {
    id: string;
    sku: string;
    barcode: string;
    title: string;
    description: string;
    brand: string;
    price: number;
    mrp: number;
    costPrice: number;
    taxRate: number;
    unit: string;
    weight: string;
    status: string;
    tags: string;
    warehouse: string;
    supplier: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ProductOption {
  id: string;
  name: string;
}

interface MediaUploaderProps {
  items: MediaItem[];
  products?: ProductOption[];            // List of products for the upload selector
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  /** Called with (productId, files, meta). Caller is responsible for API call. */
  onUpload?: (productId: string, files: File[], meta: { alt: string; sortOrder: number; isPrimary: boolean }) => Promise<boolean>;
  isLoading?: boolean;
  uploading?: boolean;
  maxFiles?: number;
}

export default function MediaUploader({
  items,
  products = [],
  onDelete,
  onSetPrimary,
  onUpload,
  isLoading = false,
  uploading = false,
  maxFiles = 10,
}: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Upload form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPrimaryUpload, setIsPrimaryUpload] = useState(false);

  const getImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/600x400/f9fafb/666666?text=No+Image";
    const cleanUrl = url.replace(/ /g, "%20");
    if (cleanUrl.startsWith("http") || cleanUrl.startsWith("data:")) return cleanUrl;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ecommerce-backend-1-zdlm.onrender.com";
    return `${baseUrl}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setPendingFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*,.pdf";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length > 0) setPendingFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!onUpload || pendingFiles.length === 0 || !selectedProductId) return;
    const success = await onUpload(selectedProductId, pendingFiles, {
      alt,
      sortOrder,
      isPrimary: isPrimaryUpload,
    });
    if (success) {
      setPendingFiles([]);
      setAlt("");
      setSortOrder(0);
      setIsPrimaryUpload(false);
    }
  };

  const images = items.filter((m) => m.type === "image");
  const others = items.filter((m) => m.type !== "image");
  const canUpload = items.length < maxFiles;

  return (
    <div className="space-y-5">

      {/* ── Upload Panel ── */}
      {canUpload && (
        <div className="rounded-xl border border-[#e8e8e8] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#0c831f]" />
            <p className="text-sm font-bold text-[#1a1a1a]">Upload New Media</p>
            <span className="ml-auto text-[10px] text-[#999]">{items.length}/{maxFiles} files used</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Product selector */}
            {products.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">
                  Select Product <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="media-product-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-[#e8e8e8] bg-white px-3 pr-9 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={handleFileSelect}
              className={`group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragOver
                  ? "border-[#0c831f] bg-[#e8f5e9]"
                  : "border-[#d0d0d0] hover:border-[#0c831f]/50 hover:bg-[#f9fafb]"
              } ${isLoading || uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5e9] transition-transform group-hover:scale-110">
                <Upload className="h-5 w-5 text-[#0c831f]" />
              </div>
              <p className="mt-2 text-sm font-bold text-[#1a1a1a]">
                {dragOver ? "Drop files here" : "Click or drag & drop files"}
              </p>
              <p className="mt-1 text-xs text-[#999]">
                JPG, PNG, WebP, MP4, PDF · Max 10 MB each
              </p>
            </div>

            {/* Pending files list */}
            {pendingFiles.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#666]">Files to upload ({pendingFiles.length})</p>
                {pendingFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2">
                    <span className="flex-1 truncate text-xs font-medium text-[#333]">{file.name}</span>
                    <span className="text-[10px] text-[#999]">{(file.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePendingFile(i); }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[#999] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload metadata (shown when files are staged) */}
            {pendingFiles.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Alt text */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-[#666]">Alt Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Front view of product"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#bbb] focus:border-[#0c831f]"
                  />
                </div>
                {/* Sort order */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#666]">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                  />
                </div>
                {/* isPrimary checkbox */}
                <div className="sm:col-span-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e8e8e8] px-3 py-2 hover:border-[#0c831f]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPrimaryUpload}
                      onChange={(e) => setIsPrimaryUpload(e.target.checked)}
                      className="h-4 w-4 rounded border-[#e8e8e8] text-[#0c831f] focus:ring-[#0c831f]"
                    />
                    <span className="text-xs font-bold text-[#1a1a1a]">Set as primary image</span>
                    <span className="text-[10px] text-[#999]">(will replace current primary)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit button */}
            {pendingFiles.length > 0 && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFiles([])}
                  disabled={uploading}
                  className="rounded-xl border border-[#e8e8e8] px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  id="media-upload-submit-btn"
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={uploading || !selectedProductId || isLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a6a18] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Image Grid ── */}
      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-[#666]">Images ({images.length})</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-[#e8e8e8] bg-white transition-all hover:shadow-md flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-[#f9fafb] border-b border-[#e8e8e8]">
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.alt || "Product Image"}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f9fafb/666666?text=No+Image";
                    }}
                  />
                  {item.isPrimary && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#0c831f] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-2 transition-all group-hover:bg-black/20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(getImageUrl(item.url)); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-[#666] opacity-0 shadow-sm transition-all hover:text-[#0c831f] group-hover:opacity-100"
                      title="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {!item.isPrimary && onSetPrimary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetPrimary(item.id); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-[#666] opacity-0 shadow-sm transition-all hover:text-amber-500 group-hover:opacity-100"
                        title="Set as primary"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-[#dc2626] opacity-0 shadow-sm transition-all hover:bg-[#fef2f2] group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 p-3 text-[11px] text-[#444] space-y-1.5 bg-[#fafafa]">
                  {item.product ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[#1a1a1a] text-xs truncate" title={item.product.title}>{item.product.title}</h4>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.product.status === 'ACTIVE' ? 'bg-[#e8f5e9] text-[#0c831f]' : 'bg-[#fef2f2] text-red-600'}`}>
                          {item.product.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                        <p><span className="text-[#888]">SKU:</span> {item.product.sku}</p>
                        <p className="truncate"><span className="text-[#888]">Barcode:</span> {item.product.barcode}</p>
                        <p><span className="text-[#888]">Brand:</span> <span className="font-medium text-[#1a1a1a]">{item.product.brand}</span></p>
                        <p><span className="text-[#888]">Price:</span> ₹{item.product.price} <span className="line-through text-[#999] text-[9px]">₹{item.product.mrp}</span></p>
                        <p><span className="text-[#888]">Cost:</span> ₹{item.product.costPrice}</p>
                        <p><span className="text-[#888]">Tax:</span> {item.product.taxRate}%</p>
                        <p><span className="text-[#888]">Weight:</span> {item.product.weight} {item.product.unit}</p>
                        <p className="truncate" title={item.product.warehouse}><span className="text-[#888]">Warehouse:</span> {item.product.warehouse}</p>
                        <p className="truncate col-span-2" title={item.product.supplier}><span className="text-[#888]">Supplier:</span> {item.product.supplier}</p>
                      </div>
                      
                      {item.product.description && (
                        <p className="mt-1.5 line-clamp-2 text-[#666] leading-snug border-t border-[#f0f0f0] pt-1.5" title={item.product.description}>
                          {item.product.description}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center flex-1">
                      <p className="truncate font-medium text-[#666]">
                        {item.alt || item.productName}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-2 border-t border-[#f0f0f0] flex items-center justify-between text-[10px] text-[#999]">
                    <span className="truncate flex-1 pr-2" title={item.alt || 'No alt text'}>Alt: {item.alt || 'N/A'}</span>
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Other Files ── */}
      {others.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-[#666]">Videos & Documents ({others.length})</p>
          <div className="space-y-2">
            {others.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white p-3 transition-all hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f7f6]">
                  {item.type === "video" ? (
                    <Video className="h-5 w-5 text-[#666]" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-[#666]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#1a1a1a]">{item.alt || item.productName}</p>
                  <p className="text-[10px] text-[#999]">{item.type.toUpperCase()} · {item.uploadedAt}</p>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] opacity-0 transition-all hover:bg-[#fef2f2] hover:text-[#dc2626] group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !isLoading && (
        <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-8 text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-[#ccc]" />
          <p className="mt-3 text-sm font-medium text-[#999]">No media files yet</p>
          <p className="text-xs text-[#bbb]">Upload images or videos for your products above</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

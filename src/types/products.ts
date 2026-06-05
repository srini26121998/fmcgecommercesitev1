// ── Product Types ─────────────────────────────────────────

import { z } from "zod";

export type ProductStatus = "active" | "inactive" | "draft" | "archived";
export type ProductCategory = "Groceries" | "Fruits" | "Vegetables" | "Dairy" | "Beverages" | "Snacks" | "Health" | "Personal Care" | "Home Care" | "Baby Care";

// ── Zod Schemas ────────────────────────────────────────────

export const ProductVariantSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "Variant SKU is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  stock: z.number().int().nonnegative(),
  weight: z.string().min(1),
  isDefault: z.boolean().default(false),
});

export const ProductMediaSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  type: z.enum(["image", "video", "document"]),
  url: z.string().url("Invalid media URL"),
  alt: z.string().default(""),
  isPrimary: z.boolean().default(false),
  uploadedAt: z.string(),
});

export const ProductSEOSchema = z.object({
  productId: z.string().min(1),
  metaTitle: z.string().max(70, "Meta title should be under 70 chars").default(""),
  metaDescription: z.string().max(160, "Meta description should be under 160 chars").default(""),
  metaKeywords: z.array(z.string()).default([]),
  slug: z.string().min(1),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogImage: z.string().default(""),
});

export const ProductHistoryEntrySchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  action: z.enum(["created", "updated", "price_changed", "stock_updated", "status_changed", "deleted"]),
  field: z.string().optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  performedBy: z.string().min(1),
  timestamp: z.string(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  costPrice: z.number().nonnegative().default(0),
  mrp: z.number().nonnegative().default(0),
  taxRate: z.number().min(0).max(100).default(5),
  unit: z.string().default("piece"),
  weight: z.string().default(""),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  isFeatured: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  status: z.enum(["active", "inactive", "draft", "archived"]).default("draft"),
  image: z.string().optional().default(""),
  rating: z.number().optional().default(4.5),
  oldPrice: z.number().optional().default(0),
  description: z.string().default(""),
  shortDescription: z.string().max(300).default(""),
  tags: z.array(z.string()).default([]),
  warehouse: z.string().default(""),
  supplier: z.string().default(""),
  variants: z.array(ProductVariantSchema).default([]),
  media: z.array(ProductMediaSchema).default([]),
  seo: ProductSEOSchema.optional(),
  history: z.array(ProductHistoryEntrySchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProductFormSchema = ProductSchema.omit({
  id: true,
  history: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  media: true,
  variants: true,
  tags: true,
  seo: true,
});

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1),
  description: z.string().default(""),
  parentId: z.string().nullable().default(null),
  image: z.string().default(""),
  isActive: z.boolean().default(true),
  productCount: z.number().int().nonnegative().default(0),
  sortOrder: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BulkUploadRecordSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  rows: z.number().int().nonnegative(),
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  status: z.enum(["completed", "processing", "failed"]),
  uploadedBy: z.string().min(1),
  uploadedAt: z.string(),
  errors: z.array(z.string()).optional(),
});

// ── Inferred Types ─────────────────────────────────────────

export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductMedia = z.infer<typeof ProductMediaSchema>;
export type ProductSEO = z.infer<typeof ProductSEOSchema>;
export type ProductHistoryEntry = z.infer<typeof ProductHistoryEntrySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type BulkUploadRecord = z.infer<typeof BulkUploadRecordSchema>;
export type ProductFormData = z.infer<typeof ProductFormSchema>;

// ── Table Types ───────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  hideOnMobile?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "danger" | "success" | "warning";
  show?: (item: T) => boolean;
}

export interface TableBulkAction {
  label: string;
  icon: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "danger" | "success";
}

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

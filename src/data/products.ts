import { resolveProductImage } from "@/lib/image-utils";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** All product categories available in the system. */
export const PRODUCT_CATEGORIES = [
  "Groceries",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Beverages",
  "Snacks",
  "Health",
  "Personal Care",
  "Home Care",
  "Baby Care"
] as const;

/** Valid product category string type. */
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  readonly id: number;
  readonly name: string;
  readonly category: ProductCategory;
  readonly price: number;
  readonly oldPrice: number;
  readonly rating: number;
  readonly image: string;
  readonly stock: StockStatus;
  readonly weight?: string;
  /** Whether this product is featured on the homepage */
  readonly isFeatured?: boolean;
  /** Whether this product is part of a flash sale */
  readonly isFlashSale?: boolean;
  /** Explicit discount percentage override (0-100) */
  readonly discountPercent?: number;
  /** Clip coupon value (e.g., "50" for ₹50 off) */
  readonly clipCoupon?: number;
  /** Volume pricing tiers (e.g., [{ qty: 3, price: 250 }]) */
  readonly volumePricing?: { qty: number; price: number }[];
}

// Live products list (mock data is removed, so it is empty by default)
export const products: readonly Product[] = [];

/** Rebuild bridge (no-op since mock data has been removed) */
export function refreshProductBridge(): void {}

/**
 * Get a product with guaranteed visible image
 * If the original image fails to load, uses a working fallback
 */
export function getProductWithVisibleImage(product: Product): Product {
  return {
    ...product,
    image: resolveProductImage(product.image),
  };
}

/**
 * Get all products with guaranteed visible images
 * Ensures every product has an accessible image URL
 */
export function getProductsWithVisibleImages(): (Product & { originalImage?: string })[] {
  return products.map((product) => ({
    ...product,
    originalImage: product.image,
    image: resolveProductImage(product.image),
  }));
}

/**
 * Find product by ID and return with guaranteed visible image
 */
export function getProductById(id: number): (Product & { originalImage?: string }) | undefined {
  const product = products.find((p) => p.id === id);
  if (!product) return undefined;
  return {
    ...product,
    originalImage: product.image,
    image: resolveProductImage(product.image),
  };
}

/**
 * Get products by category with visible images
 */
export function getProductsByCategory(category: ProductCategory): (Product & { originalImage?: string })[] {
  return products
    .filter((p) => p.category === category)
    .map((product) => ({
      ...product,
      originalImage: product.image,
      image: resolveProductImage(product.image),
    }));
}

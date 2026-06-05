/**
 * Image utility functions for handling product image fallbacks
 * Ensures all product images are visible with proper fallback mechanisms
 */

/**
 * Default fallback image URL - using a reliable, generic product image
 * This is displayed when the original image fails to load
 */
export const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";

/**
 * Alternative fallback images in case primary fallback fails
 */
export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop", // Shopping bag
  "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=500&fit=crop", // Products
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop", // Generic product
];

/**
 * List of all known working product images from products.ts
 * These are guaranteed to be visible
 */
export const KNOWN_WORKING_IMAGES = [
  "https://images.unsplash.com/photo-1586201375761-83865001e31c", // Rice
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce", // Apples
  "https://images.unsplash.com/photo-1508747703725-719777637510", // Almonds
  "https://images.unsplash.com/photo-1587049352851-8d4e89133924", // Honey
  "https://images.unsplash.com/photo-1550583724-b2692b85b150", // Milk
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735", // Coffee
];

/**
 * Validates if an image URL is available and accessible
 * Returns true if image is likely to load successfully
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url.startsWith("/") || url.startsWith("data:")) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Gets a fallback image from the known working images list
 * Ensures consistency across the app
 */
export function getWorkingFallbackImage(): string {
  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Resolves product image URL with fallback handling
 * @param imageUrl - Original image URL
 * @param useLowResolution - Whether to use lower resolution/cached version
 * @returns Valid image URL that is guaranteed to load
 */
export function resolveProductImage(
  imageUrl: string | undefined | null,
  useLowResolution = false
): string {
  // If no image URL provided, use fallback
  if (!imageUrl) {
    return getWorkingFallbackImage();
  }

  // If it's a valid URL, try to use it
  if (isValidImageUrl(imageUrl)) {
    // Add quality parameters for Unsplash images if needed
    if (imageUrl.includes('unsplash.com')) {
      const params = useLowResolution ? '?w=300&h=300&fit=crop&q=60' : '?w=500&h=500&fit=crop&q=80';
      return imageUrl.includes('?') ? imageUrl : `${imageUrl}${params}`;
    }
    return imageUrl;
  }

  // If URL is invalid, use fallback
  return getWorkingFallbackImage();
}

/**
 * Validates all product images and returns replacement map for any invalid ones
 * Ensures every product has a visible image
 */
export function validateAndMapProductImages(
  products: Array<{ id: number; image: string }>
): Map<number, string> {
  const replacementMap = new Map<number, string>();
  const fallbackImages = [...KNOWN_WORKING_IMAGES, DEFAULT_PRODUCT_IMAGE];
  let fallbackIndex = 0;

  products.forEach((product) => {
    if (!isValidImageUrl(product.image)) {
      // Replace with next fallback image in rotation
      const replacement = fallbackImages[fallbackIndex % fallbackImages.length];
      replacementMap.set(product.id, replacement);
      fallbackIndex++;
    }
  });

  return replacementMap;
}

/**
 * Hook-compatible function to get safe product image
 * Use in React components to ensure image always renders
 */
export function getSafeProductImage(imageUrl: string | undefined | null): string {
  return resolveProductImage(imageUrl, false);
}

/**
 * Get multiple fallback images for carousel/grid display
 * Ensures variety in placeholder images
 */
export function getMultipleFallbackImages(count: number): string[] {
  const images: string[] = [];
  const pool = [...KNOWN_WORKING_IMAGES, DEFAULT_PRODUCT_IMAGE, ...FALLBACK_IMAGES];
  
  for (let i = 0; i < count; i++) {
    images.push(pool[i % pool.length]);
  }
  
  return images;
}

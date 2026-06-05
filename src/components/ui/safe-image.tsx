"use client";

import Image from "next/image";
import { memo, useState, useCallback } from "react";
import { resolveProductImage } from "@/lib/image-utils";

interface SafeProductImageProps {
  src: string | undefined | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  onError?: () => void;
}

/**
 * Safe Product Image Component
 * Automatically handles image loading errors with fallback images
 * Ensures all product images are visible
 */
export const SafeProductImage = memo(function SafeProductImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
  loading,
  onError,
}: SafeProductImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(() => resolveProductImage(src));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
    // Try to use a different fallback
    const fallbackImg = resolveProductImage(null);
    if (fallbackImg !== imageSrc) {
      setImageSrc(fallbackImg);
    }
    onError?.();
  }, [imageSrc, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
        className={className}
        priority={priority}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          objectFit: "cover",
        }}
      />
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-[#f2f2f2] animate-pulse" />
      )}
    </>
  );
});

/**
 * Simple Safe Image component for non-product images
 */
export const SafeImage = memo(function SafeImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
  loading,
}: Omit<SafeProductImageProps, "onError">) {
  const [imageSrc, setImageSrc] = useState(src || "");
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f2f2f2' width='400' height='400'/%3E%3C/svg%3E";

  const handleError = useCallback(() => {
    setImageSrc(fallbackImage);
  }, []);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
      className={className}
      priority={priority}
      loading={loading}
      onError={handleError}
    />
  );
});

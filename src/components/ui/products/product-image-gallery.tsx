"use client";

import { useState, useRef, MouseEvent } from "react";
import { Share, Play } from "lucide-react";
import { SafeProductImage } from "@/components/ui/safe-image";
import { ProductMedia } from "@/types/products";

interface ProductImageGalleryProps {
  media?: ProductMedia[];
  productName: string;
  discount: number;
  fallbackImage: string;
}

export default function ProductImageGallery({ media, productName, discount, fallbackImage }: ProductImageGalleryProps) {
  // If no media, create a mock one with fallback
  const allMedia = media && media.length > 0 ? media : [{
    id: "default-img",
    productId: "0",
    type: "image",
    url: fallbackImage,
    alt: productName,
    isPrimary: true,
    uploadedAt: new Date().toISOString()
  } as ProductMedia];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = allMedia[activeIndex];

  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || activeMedia.type === "video") return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    
    // Mouse position relative to the image container
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Percentage for background position
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    // Lens constraints
    const lensWidth = 150; // Size of the lens
    const lensHeight = 150;
    
    let lx = x - lensWidth / 2;
    let ly = y - lensHeight / 2;
    
    // Keep lens inside the container
    if (lx < 0) lx = 0;
    if (ly < 0) ly = 0;
    if (lx > width - lensWidth) lx = width - lensWidth;
    if (ly > height - lensHeight) ly = height - lensHeight;

    setLensPos({ x: lx, y: ly });
    setZoomPosition({ x: bgX, y: bgY });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full relative">
      {/* Thumbnails */}
      <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0 px-2 md:px-0 py-2 max-h-[400px] md:max-h-[500px]">
        {allMedia.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-xl border-2 overflow-hidden shrink-0 w-16 h-16 md:w-20 md:h-20 transition-all ${
              activeIndex === idx ? "border-[#ff4f8b] shadow-md" : "border-transparent hover:border-gray-300"
            }`}
          >
            {m.type === 'video' ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                <SafeProductImage
                   src={m.url.replace('.mp4', '.jpg')} // Fallback image for video
                   alt={`Video thumbnail ${idx}`}
                   fill
                   className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white opacity-80" />
                </div>
              </div>
            ) : (
              <SafeProductImage
                src={m.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Display */}
      <div className="order-1 md:order-2 flex-1 relative bg-white rounded-2xl flex items-center justify-center group border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 bg-white backdrop-blur-md border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all text-gray-700"
          aria-label="Share"
        >
          <Share className="w-5 h-5" />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 text-[10px] sm:text-xs font-black text-white bg-[#ff4f8b] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-sm tracking-wide">
            {discount}% OFF
          </span>
        )}

        {/* Main Content Area */}
        <div 
          className={`relative w-full aspect-square md:aspect-auto md:h-full flex items-center justify-center ${activeMedia.type === 'image' ? 'cursor-crosshair' : ''}`}
          ref={imageRef}
          onMouseEnter={() => activeMedia.type === 'image' && setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {activeMedia.type === "video" ? (
             <video 
               src={activeMedia.url} 
               controls 
               autoPlay 
               className="w-full max-h-[500px] object-contain rounded-xl"
             />
          ) : (
            <>
              {/* Normal Image */}
              <div className={`relative w-full h-full mx-auto transition-transform duration-500 flex items-center justify-center`}>
                <SafeProductImage
                  src={activeMedia.url}
                  alt={productName}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 800px"
                  priority
                />
                
                {/* Lens Overlay */}
                {isZooming && (
                  <div 
                    className="hidden md:block absolute border border-blue-400 bg-blue-100/30 pointer-events-none"
                    style={{
                      width: '150px',
                      height: '150px',
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`
                    }}
                  >
                     <div className="w-full h-full relative" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="none" stroke="rgba(0,0,255,0.1)" stroke-width="1"/></svg>')` }}></div>
                  </div>
                )}
              </div>

              {/* Side Zoomed Box */}
              {isZooming && (
                <div 
                  className="hidden md:block absolute z-[100] bg-white border border-[#e8e8e8] shadow-2xl rounded-2xl overflow-hidden pointer-events-none"
                  style={{
                    left: '100%',
                    top: 0,
                    width: '500px',
                    height: '500px',
                    marginLeft: '20px',
                    backgroundImage: `url(${activeMedia.url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '250%', 
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
              
              {/* Mobile Inner Zoom */}
              {isZooming && (
                <div 
                  className="md:hidden absolute inset-0 z-10 bg-white pointer-events-none"
                  style={{
                    backgroundImage: `url(${activeMedia.url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%', 
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

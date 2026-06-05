"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RotateCw, Maximize2, Minimize2 } from "lucide-react";
import { SafeProductImage } from "@/components/ui/safe-image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductView360Props {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    image: string;
    category: string;
  } | null;
}

const FRAMES = 24;
const ROTATION_DEGREES = 360;

export default function ProductView360({ isOpen, onClose, product }: ProductView360Props) {
  const [frame, setFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startAutoRotate = useCallback(() => {
    stopAutoRotate();
    autoRotateRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES);
    }, 80);
  }, []);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAutoRotating) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
    return stopAutoRotate;
  }, [isOpen, isAutoRotating, startAutoRotate, stopAutoRotate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true);
    setStartX(e.clientX);
    stopAutoRotate();
    setIsAutoRotating(false);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 5) {
      const step = Math.round(diff / 8);
      setFrame((f) => ((f - step) % FRAMES + FRAMES) % FRAMES);
      setStartX(e.clientX);
    }
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  const tiltAngle = ((frame / FRAMES) * ROTATION_DEGREES) % 360;

  if (!product || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={`relative bg-white rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? "w-screen h-screen rounded-none" : "w-[90vw] max-w-md mx-auto"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2 min-w-0">
                <RotateCw className="w-4 h-4 text-[#ff4f8b] flex-shrink-0" />
                <h3 className="text-sm font-bold text-[#1a1a1a] truncate">{product.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreen((f) => !f)}
                  className="min-w-[44px] min-h-[44px] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#666]" /> : <Maximize2 className="w-4 h-4 text-[#666]" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors"
                  aria-label="Close 360 view"
                >
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>
            </div>

            {/* 360 Viewport */}
            <div
              ref={containerRef}
              className="relative bg-[#f2f2f2] select-none"
              style={{
                height: isFullscreen ? "calc(100vh - 56px)" : "min(50vh, 400px)",
                touchAction: "none",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: "800px" }}
              >
                <div
                  className="relative w-3/4 h-3/4 transition-transform duration-75"
                  style={{
                    transform: `rotateY(${tiltAngle}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front face */}
                  <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-lg">
                    <SafeProductImage
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 75vw, 300px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Back face */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-lg"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <SafeProductImage
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 75vw, 300px"
                      className="object-cover scale-x-[-1]"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Drag hint */}
              {isAutoRotating && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 text-[10px] font-semibold text-[#666] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none">
                  <RotateCw className="w-3 h-3 text-[#ff4f8b]" />
                  Drag to rotate · Auto-rotating
                </div>
              )}

              {/* Frame indicator */}
              <div className="absolute bottom-4 right-4 bg-white/90 text-[10px] font-mono font-bold text-[#666] px-2 py-1 rounded shadow-sm pointer-events-none">
                {Math.round(tiltAngle)}°
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-[#e8e8e8]">
              <button
                type="button"
                onClick={() => {
                  setFrame((f) => ((f - 2) % FRAMES + FRAMES) % FRAMES);
                  setIsAutoRotating(false);
                  stopAutoRotate();
                }}
                className="min-w-[44px] min-h-[44px] w-9 h-9 flex items-center justify-center rounded-full border border-[#e8e8e8] hover:bg-[#f2f2f2] transition-colors"
                aria-label="Rotate left"
              >
                <RotateCw className="w-4 h-4 text-[#666] rotate-[-30deg]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAutoRotating) {
                    stopAutoRotate();
                    setIsAutoRotating(false);
                  } else {
                    startAutoRotate();
                    setIsAutoRotating(true);
                  }
                }}
                className={`min-w-[44px] min-h-[44px] h-9 px-4 flex items-center justify-center gap-1.5 rounded-full font-bold text-xs transition-colors ${
                  isAutoRotating ? "bg-[#0c831f] text-white" : "bg-[#f2f2f2] text-[#666]"
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? "animate-spin" : ""}`} />
                {isAutoRotating ? "Auto" : "Manual"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrame((f) => (f + 2) % FRAMES);
                  setIsAutoRotating(false);
                  stopAutoRotate();
                }}
                className="min-w-[44px] min-h-[44px] w-9 h-9 flex items-center justify-center rounded-full border border-[#e8e8e8] hover:bg-[#f2f2f2] transition-colors"
                aria-label="Rotate right"
              >
                <RotateCw className="w-4 h-4 text-[#666] rotate-[30deg]" />
              </button>
            </div>

            {/* Category tag */}
            <div className="px-4 pb-3">
              <span className="text-[10px] font-semibold text-[#999] bg-[#f2f2f2] px-2 py-0.5 rounded">
                {product.category}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchCardCanvasProps {
  onScratchComplete: () => Promise<{ type: string; value: string; isWin: boolean }>;
}

export default function ScratchCardCanvas({ onScratchComplete }: ScratchCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reward, setReward] = useState<{ type: string; value: string; isWin: boolean } | null>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    setCtx(context);

    // Initial setup: Draw premium shiny foil
    const width = canvas.width;
    const height = canvas.height;
    
    // Create shiny gradient
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#e2e8f0");
    gradient.addColorStop(0.3, "#f1f5f9");
    gradient.addColorStop(0.5, "#cbd5e1");
    gradient.addColorStop(0.7, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    
    // Add holographic pattern effect
    context.fillStyle = "rgba(255, 255, 255, 0.4)";
    for(let i=0; i<width; i+=4) {
      for(let j=0; j<height; j+=4) {
        if (Math.random() > 0.5) {
          context.fillRect(i, j, 2, 2);
        }
      }
    }

    // Add Text
    context.fillStyle = "#64748b";
    context.font = "bold 24px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("SCRATCH TO REVEAL", width / 2, height / 2);
    
    // Add decorative dots around text
    context.font = "14px Inter, system-ui, sans-serif";
    context.fillText("✨ ✨ ✨", width / 2, height / 2 - 30);
    context.fillText("✨ ✨ ✨", width / 2, height / 2 + 30);

    context.globalCompositeOperation = "destination-out";
  }, []);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const calculateScratchedArea = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return 0;

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    
    // Check every 16th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) transparentPixels++;
    }
    
    return (transparentPixels / (pixels.length / 16)) * 100;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed || isLoading) return;
    setIsScratching(true);
    scratch(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || isRevealed || isLoading) return;
    scratch(e);
  };

  const handlePointerUp = async () => {
    if (!isScratching) return;
    setIsScratching(false);
    if (isRevealed || isLoading) return;

    const percent = calculateScratchedArea();
    if (percent >= 40) { // Lowered threshold for better UX
      setIsLoading(true);
      try {
        const result = await onScratchComplete();
        setReward(result);
        revealFullCanvas();
        setIsRevealed(true);
        if (result.isWin) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981']
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!ctx || !canvasRef.current) return;
    
    const { x, y } = getPointerPos(e);
    
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2); // Slightly larger brush
    
    // Create soft brush effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  const revealFullCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    canvas.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    canvas.style.opacity = "0";
    canvas.style.transform = "scale(1.05)";
    setTimeout(() => {
      canvas.style.display = "none";
    }, 600);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', preventDefault);
      canvas.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      whileHover={{ scale: isRevealed ? 1 : 1.02, rotateX: isRevealed ? 0 : 2, rotateY: isRevealed ? 0 : -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative w-full max-w-[320px] aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl select-none bg-white border-[6px] border-white ring-1 ring-slate-900/5 group"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Background (Reward) Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-white to-orange-50 flex flex-col items-center justify-center p-6 text-center">
        <AnimatePresence>
          {reward ? (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
              className="flex flex-col items-center w-full"
            >
              {reward.isWin ? (
                <>
                  <div className="relative mb-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-rose-400/20 blur-xl rounded-full"
                    />
                    <Trophy className="w-14 h-14 text-amber-500 drop-shadow-md relative z-10" />
                  </div>
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-black bg-gradient-to-br from-rose-500 to-orange-500 bg-clip-text text-transparent"
                  >
                    {reward.value}
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2"
                  >
                    {reward.type}
                  </motion.p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl grayscale">😔</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-700">Better Luck</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Next Time</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center"
            >
               <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
               <div className="w-16 h-2 bg-slate-200 rounded-full mb-2" />
               <div className="w-10 h-2 bg-slate-200 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Foil Layer */}
      <canvas
        ref={canvasRef}
        width={320}
        height={213} // aspect ratio 3:2
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none transition-transform duration-300 origin-center"
        style={{ zIndex: 10 }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
          >
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin drop-shadow-lg" />
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-sm font-bold text-rose-600 mt-3 drop-shadow-sm"
            >
              Revealing...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


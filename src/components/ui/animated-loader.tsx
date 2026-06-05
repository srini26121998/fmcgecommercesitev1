import React from 'react';

interface AnimatedLoaderProps {
  fullScreen?: boolean;
  text?: string;
  variant?: 'spinner' | 'dots' | 'cart';
}

export function AnimatedLoader({ 
  fullScreen = false, 
  text = "Loading data...",
  variant = 'spinner' 
}: AnimatedLoaderProps) {
  
  const renderSpinner = () => (
    <div className="relative flex h-16 w-16 items-center justify-center">
      {/* Outer spinning dashed ring */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#0c831f]/30 animate-[spin_3s_linear_infinite]" />
      
      {/* Inner spinning gradient ring */}
      <div className="absolute inset-2 rounded-full border-4 border-[#ff4f8b]/20 border-t-[#ff4f8b] animate-[spin_1.5s_ease-in-out_infinite]" />
      
      {/* Center pulsing dot */}
      <div className="absolute h-4 w-4 rounded-full bg-gradient-to-tr from-[#0c831f] to-[#ff4f8b] animate-pulse shadow-[0_0_15px_rgba(255,79,139,0.5)]" />
    </div>
  );

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {renderSpinner()}
      {text && (
        <p className="animate-pulse bg-gradient-to-r from-[#0c831f] to-[#ff4f8b] bg-clip-text text-sm font-bold text-transparent tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      {loaderContent}
    </div>
  );
}

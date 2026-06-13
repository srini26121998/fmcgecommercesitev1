"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface ReusableSearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onClear?: () => void;
}

export default function ReusableSearchBar({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  onClear,
}: ReusableSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onClear?.();
  };

  return (
    <div className="relative group mb-4 w-full">
      <div className="relative flex items-center w-full h-[48px] bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-focus-within:border-[#0c831f] group-focus-within:ring-4 group-focus-within:ring-[#0c831f]/10 hover:border-gray-300 hover:shadow-md">
        <div className="pl-4 pr-3 flex items-center justify-center text-gray-400 group-focus-within:text-[#0c831f] transition-colors duration-300">
          <Search className="h-[18px] w-[18px]" />
        </div>
        
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full h-full bg-transparent text-[15px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none transition-all"
        />
        
        {localValue && (
          <button
            onClick={handleClear}
            className="pr-4 pl-2 flex items-center justify-center h-full transition-colors duration-200 focus:outline-none group/clear"
            aria-label="Clear search"
          >
            <div className="bg-gray-100 group-hover/clear:bg-gray-200 rounded-full p-1.5 transition-colors">
              <X className="h-3.5 w-3.5 text-gray-500 group-hover/clear:text-gray-700" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

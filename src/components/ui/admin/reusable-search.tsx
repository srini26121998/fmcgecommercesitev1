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
    <div className="relative group mb-4">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0c831f]" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border-2  bg-white pl-12 pr-12 text-base font-medium text-[#1a1a1a]  outline-none transition-all placeholder:text-gray-400 "
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

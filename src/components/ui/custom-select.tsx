"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  theme?: "pink" | "green";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  theme = "pink"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const borderColor = theme === "pink" ? "focus:border-[#ff4f8b] focus:ring-[#ff4f8b]/10 hover:border-[#ff4f8b]/50 border-[#e8e8e8]" : "focus:border-[#0c831f] focus:ring-[#0c831f]/10 hover:border-[#0c831f]/50 border-[#0c831f]/30";
  const iconColor = theme === "pink" ? "text-[#666]" : "text-[#0c831f]";
  const selectedBg = theme === "pink" ? "bg-[#fff0f6] text-[#ff4f8b]" : "bg-[#e8f5e9] text-[#0c831f]";
  const hoverBg = theme === "pink" ? "hover:bg-[#fff0f6]" : "hover:bg-[#e8f5e9]";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 rounded-xl border bg-white px-4 flex items-center justify-between text-sm font-medium outline-none transition-all focus:ring-4 ${borderColor} ${isOpen ? "ring-4" : ""}`}
      >
        <span className={selectedOption ? "text-[#1a1a1a]" : "text-[#999]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${iconColor}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-[#e8e8e8] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between ${
                  isSelected ? selectedBg : `text-[#1a1a1a] ${hoverBg}`
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

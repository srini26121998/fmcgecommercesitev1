import type { ReactNode } from "react";

interface BillRowProps {
  label: string | ReactNode;
  value: ReactNode;
  valueClassName?: string;
}

export default function BillRow({ label, value, valueClassName = "" }: BillRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#666]">{label}</span>
      <span className={`font-bold text-[#1a1a1a] ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  growth: string;
  subtitle?: string;
}

export default function KpiCard({ title, value, growth, subtitle }: KpiCardProps) {
  const isPositive = growth.startsWith("+");

  return (
    <div className="rounded-xl bg-white border border-[#e8e8e8] p-4 shadow-sm hover:shadow-md transition-all duration-250 hover:-translate-y-0.5">
      <p className="text-[10px] font-bold text-[#999] uppercase tracking-wide">
        {title}
      </p>
      
      <h3 className="text-xl sm:text-xl font-bold text-[#1a1a1a] mt-1">
        {value}
      </h3>
      
      <p className={`text-[10px] sm:text-xs font-black mt-1.5 ${isPositive ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
        {growth} vs last month
      </p>
      
      {subtitle && (
        <p className="text-[10px] text-[#666] mt-1">{subtitle}</p>
      )}
    </div>
  );
}


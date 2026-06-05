import { Mic, Search } from "lucide-react";
import Link from "next/link";

export default function SearchBar() {
  return (
    <div className="w-full bg-white border-b border-[#e8e8e8] py-3 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <Link href="/search">
          <div className="h-11 sm:h-12 rounded-lg bg-[#f2f2f2] border border-[#e8e8e8] flex items-center px-4 gap-3 hover-border-pink transition-colors cursor-pointer">
            <Search className="text-[#999] w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm text-[#999] truncate">
              Search for groceries, snacks, beverages...
            </span>
            <Mic className="text-[#ff4f8b] w-4 h-4 flex-shrink-0 cursor-pointer" />
          </div>
        </Link>
      </div>
    </div>
  );
}

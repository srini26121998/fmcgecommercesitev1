"use client";

import { useState } from "react";
import { Users, Heart, ChevronRight, Bookmark, BookmarkCheck, Star, TrendingUp } from "lucide-react";
import { useCommunityListsStore, type CommunityList } from "@/store/community-lists-store";
import { useUserCart } from "@/hooks/use-user-cart";
import { toast } from "sonner";

export default function CommunityListsSection() {
  const { featured, followed, isFollowed, toggleFollow } = useCommunityListsStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(featured.map((l) => l.category)));
  const filtered = activeCategory
    ? featured.filter((l) => l.category === activeCategory)
    : featured;

  return (
    <section className="rounded-3xl border border-[#e8e8e8] bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-[#ff4f8b]" />
          <p className="text-xs font-black uppercase tracking-wide text-[#ff4f8b]">
            Community
          </p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1a1a1a]">
          Curated Lists by Shoppers
        </h2>
        <p className="text-sm text-[#666] mt-1">
          Discover top picks &amp; recommendations from the FMCG community
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 hide-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
            activeCategory === null
              ? "bg-[#ff4f8b] text-white"
              : "bg-[#f2f2f2] text-[#666] hover:bg-[#e8e8e8]"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-[#ff4f8b] text-white"
                : "bg-[#f2f2f2] text-[#666] hover:bg-[#e8e8e8]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Community lists grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((list) => (
          <CommunityListCard
            key={list.id}
            list={list}
            isFollowed={isFollowed(list.id)}
            onToggleFollow={() => {
              toggleFollow(list.id);
              toast.success(
                isFollowed(list.id)
                  ? "Unfollowed list"
                  : "Following this list! 🎉"
              );
            }}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-5 pt-4 border-t border-[#e8e8e8] flex items-center justify-between text-xs text-[#999]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <strong className="text-[#1a1a1a]">
              {featured.reduce((s, l) => s + l.followers, 0).toLocaleString()}
            </strong>{" "}
            total followers
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <strong className="text-[#1a1a1a]">{featured.length}</strong> lists
          </span>
        </div>
        {followed.length > 0 && (
          <span className="text-[#ff4f8b] font-semibold">
            Following {followed.length} list{followed.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </section>
  );
}

function CommunityListCard({
  list,
  isFollowed,
  onToggleFollow,
}: {
  list: CommunityList;
  isFollowed: boolean;
  onToggleFollow: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { addToCart } = useUserCart();
  const displayItems = expanded ? list.items : list.items.slice(0, 2);

  return (
    <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow group">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="w-3.5 h-3.5 text-[#ff4f8b]" />
              <span className="text-[10px] font-medium text-[#ff4f8b] uppercase tracking-wider">
                {list.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1a1a1a] leading-tight">
              {list.title}
            </h3>
            <p className="text-xs text-[#666] mt-0.5 line-clamp-1">
              {list.description}
            </p>
          </div>
          <button
            onClick={onToggleFollow}
            className={`flex-shrink-0 flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
              isFollowed
                ? "bg-[#ff4f8b] text-white"
                : "bg-[#fff0f6] text-[#ff4f8b] hover:bg-[#ff4f8b] hover:text-white"
            }`}
          >
            {isFollowed ? (
              <BookmarkCheck className="w-3 h-3" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
            {isFollowed ? "Following" : "Follow"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-full bg-[#ff4f8b] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">
              {list.authorAvatar}
            </span>
          </div>
          <span className="text-[10px] text-[#666]">by {list.author}</span>
          <span className="text-[10px] text-[#666]">•</span>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#ff4f8b]" />
            <span className="text-[10px] font-semibold text-[#ff4f8b]">
              {list.followers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-[#f9f9f9] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#f2f2f2] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-lg">🛒</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                {item.name}
              </p>
              <p className="text-xs text-[#ff4f8b] font-bold">₹{item.price}</p>
            </div>
            <button
              onClick={async () => {
                await addToCart(item.id, 1);
                toast.success(`${item.name} added to cart 🛒`);
              }}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#fff0f6] flex items-center justify-center hover:bg-[#ff4f8b] hover:text-white transition-colors text-[#ff4f8b]"
              aria-label={`Add ${item.name} to cart`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Expand / collapse */}
      {list.items.length > 2 && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-[#999] hover:text-[#ff4f8b] transition-colors rounded-lg hover:bg-[#fff0f6]"
          >
            {expanded
              ? "Show less"
              : `+${list.items.length - 2} more items`}
            <ChevronRight
              className={`w-3 h-3 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

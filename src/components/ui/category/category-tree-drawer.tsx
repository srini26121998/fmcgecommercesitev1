"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronRight, ChevronDown } from "lucide-react";
import { useCategoryTree } from "@/hooks/use-categories";
import type { ApiCategoryTree } from "@/types/api-categories";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryNode({ node, depth = 0, closeDrawer }: { node: ApiCategoryTree, depth?: number, closeDrawer: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center justify-between py-3 px-4 hover:bg-[#fafafa] cursor-pointer ${depth === 0 ? 'border-b border-[#f2f2f2] font-semibold text-[#1a1a1a]' : 'text-sm text-[#444]'}`}
        style={{ paddingLeft: `${(depth * 1) + 1}rem` }}
      >
        <Link 
          href={`/category/${node.slug}`} 
          className="flex-1 flex items-center gap-3 hover:text-[#ff4f8b] transition-colors"
          onClick={closeDrawer}
        >
          {node.image && <img src={node.image} alt={node.name} className="w-6 h-6 object-contain" />}
          <span>{node.name}</span>
        </Link>
        
        {hasChildren && (
          <button 
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            aria-label="Toggle subcategories"
          >
            {isOpen ? <ChevronDown className="w-4 h-4 text-[#666]" /> : <ChevronRight className="w-4 h-4 text-[#666]" />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="flex flex-col bg-[#fafafa]">
          {node.children!.map((child) => (
            <CategoryNode key={child.id || child._id || child.slug} node={child} depth={depth + 1} closeDrawer={closeDrawer} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeDrawer() {
  const { data: tree, isLoading } = useCategoryTree();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          className="flex items-center justify-center sm:justify-start gap-2 h-11 px-0 sm:px-4 rounded-xl sm:bg-gradient-to-r sm:from-[#ff4f8b] sm:to-[#e63872] sm:text-white sm:hover:shadow-lg sm:hover:shadow-pink-500/25 transition-all duration-300 font-bold tracking-wide w-11 sm:w-auto hover:bg-[#f2f2f2] sm:hover:bg-transparent"
          aria-label="Open categories menu"
        >
          <Menu className="w-5 h-5 sm:text-white text-[#1a1a1a]" />
          <span className="hidden sm:inline">Categories</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col bg-white">
        <SheetHeader className="px-6 py-4 border-b border-[#f2f2f2] bg-[#f8f9fa]">
          <SheetTitle className="text-xl font-black text-[#1a1a1a]">Shop by Category</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-2">
          {isLoading ? (
            <div className="flex flex-col gap-4 p-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : tree && tree.length > 0 ? (
            <div className="flex flex-col">
              {tree.map((node) => (
                <CategoryNode key={node.id || node._id || node.slug} node={node} closeDrawer={() => setOpen(false)} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#666]">
              No categories available.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

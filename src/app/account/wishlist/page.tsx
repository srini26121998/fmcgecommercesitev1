"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Trash2,
  MoveRight,
  Lock,
  Globe,
  Users,
  ChevronRight,
  Edit3,
  X,
  CheckCircle,
  ShoppingCart,
  Share2,
  Copy,
} from "lucide-react";
import {
  useMultiWishlistStore,
  WishlistList,
  ListPrivacy,
} from "@/store/multi-wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

const PRIVACY_ICONS: Record<ListPrivacy, React.ReactNode> = {
  private: <Lock className="w-3 h-3" />,
  shared: <Users className="w-3 h-3" />,
  public: <Globe className="w-3 h-3" />,
};

const PRIVACY_LABELS: Record<ListPrivacy, string> = {
  private: "Private",
  shared: "Shared",
  public: "Public",
};

const PRIVACY_COLORS: Record<ListPrivacy, string> = {
  private: "#64748b",
  shared: "#eab308",
  public: "#10b981",
};

export default function WishlistsPage() {
  const {
    lists,
    activeListId,
    createList,
    deleteList,
    renameList,
    setPrivacy,
    removeItem,
    moveItem,
    setActiveList,
  } = useMultiWishlistStore();
  const { addToCart: cartAdd } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListPrivacy, setNewListPrivacy] = useState<ListPrivacy>("private");

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [moveItemData, setMoveItemData] = useState<{ fromListId: string; itemId: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeList = lists.find((l) => l.id === activeListId) ?? lists[0];

  const handleCreateList = () => {
    if (!newListName.trim()) { toast.error("Enter a list name"); return; }
    createList(newListName.trim(), newListPrivacy);
    toast.success(`List "${newListName.trim()}" created! ✨`);
    setNewListName("");
    setNewListPrivacy("private");
    setShowCreateModal(false);
  };

  const handleAddToCart = (item: WishlistList["items"][number]) => {
    cartAdd({
      id: String(item.id),
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart! 🛒`);
  };

  const handleShare = (list: WishlistList) => {
    const url = `${window.location.origin}/wishlists/${list.shareToken}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Share link copied!"));
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 pt-8 pb-14 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl -mb-10" />
        <div className="max-w-[800px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-6 font-medium">
            <Link href="/account" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">My Lists</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">My Wishlists</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-white text-indigo-600 rounded-full px-4 py-2 text-sm font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 -mt-8 pb-20 space-y-6 relative z-20">
        {/* List Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveList(list.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${activeListId === list.id
                ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 ring-offset-slate-50"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200"
                }`}
            >
              {list.name}
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${activeListId === list.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {list.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Active List Header & Content */}
        <AnimatePresence mode="wait">
          {activeList && (
            <motion.section 
              key={activeList.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                {editingListId === activeList.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameList(activeList.id, editingName);
                          setEditingListId(null);
                          toast.success("List renamed!");
                        }
                        if (e.key === "Escape") setEditingListId(null);
                      }}
                      className="flex-1 h-9 rounded-xl border-2 border-indigo-500 bg-white px-3 text-sm font-bold text-slate-900 outline-none shadow-sm"
                    />
                    <button
                      onClick={() => { renameList(activeList.id, editingName); setEditingListId(null); toast.success("Renamed!"); }}
                      className="p-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-slate-900 flex-1 tracking-tight">{activeList.name}</h2>
                    <button
                      onClick={() => { setEditingListId(activeList.id); setEditingName(activeList.name); }}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Privacy selector */}
                <div className="relative">
                  <select
                    value={activeList.privacy}
                    onChange={(e) => setPrivacy(activeList.id, e.target.value as ListPrivacy)}
                    className="appearance-none text-xs font-bold border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 bg-white outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                    style={{ color: PRIVACY_COLORS[activeList.privacy] }}
                  >
                    {(["private", "shared", "public"] as ListPrivacy[]).map((p) => (
                      <option key={p} value={p} className="text-slate-800">{PRIVACY_LABELS[p]}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {PRIVACY_ICONS[activeList.privacy]}
                  </div>
                </div>

                {activeList.privacy !== "private" && (
                  <button
                    onClick={() => handleShare(activeList)}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                    title="Share list"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                {lists.length > 1 && (
                  <button
                    onClick={() => { deleteList(activeList.id); toast.success("List deleted"); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                    title="Delete list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activeList.items.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4 text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-slate-700 mb-1">This list is empty</p>
                    <p className="text-sm">Tap the ♡ on any product to add it here</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {activeList.items.map((item) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-4 px-5 py-4 group"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ShoppingCart className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.id}`} className="hover:text-indigo-600 transition-colors">
                            <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{item.name}</p>
                          </Link>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                            {item.mrp && item.mrp > item.price && (
                              <span className="text-xs line-through text-slate-400">₹{item.mrp}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-400">
                            Added {new Date(item.addedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-sm"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          {lists.length > 1 && (
                            <button
                              onClick={() => setMoveItemData({ fromListId: activeList.id, itemId: item.id })}
                              className="p-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                              title="Move to another list"
                            >
                              <MoveRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { removeItem(activeList.id, item.id); toast.success("Removed from list"); }}
                            className="p-2.5 border border-slate-200 text-slate-400 bg-white rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {activeList.items.length > 0 && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => {
                      activeList.items.forEach(handleAddToCart);
                      toast.success(`All ${activeList.items.length} items added to cart! 🛒`);
                    }}
                    className="w-full h-12 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ── Create List Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">New Wishlist</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="List name (e.g. Diwali Shopping)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all mb-4"
              />
              <div className="flex gap-2 mb-6">
                {(["private", "shared", "public"] as ListPrivacy[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewListPrivacy(p)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 transition-all ${newListPrivacy === p
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {PRIVACY_ICONS[p]}
                    <span className="text-xs font-bold">{PRIVACY_LABELS[p]}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateList}
                className="w-full h-12 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors active:scale-[0.98]"
              >
                Create List
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Move Item Modal ── */}
      <AnimatePresence>
        {moveItemData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMoveItemData(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Move to List</h3>
                <button onClick={() => setMoveItemData(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {lists
                  .filter((l) => l.id !== moveItemData.fromListId)
                  .map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        moveItem(moveItemData.fromListId, l.id, moveItemData.itemId);
                        toast.success(`Moved to "${l.name}"`);
                        setMoveItemData(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Heart className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">{l.name}</span>
                        <span className="block text-xs font-medium text-slate-500 mt-0.5">{l.items.length} items</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400" />
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

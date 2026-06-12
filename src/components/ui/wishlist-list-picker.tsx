"use client";

import { useState } from "react";
import { Heart, Plus, X, CheckCircle, Lock, Users, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMultiWishlistStore,
  WishlistListItem,
  ListPrivacy,
} from "@/store/multi-wishlist-store";
import { toast } from "sonner";

interface WishlistListPickerProps {
  item: Omit<WishlistListItem, "addedAt">;
  onClose: () => void;
}

const PRIVACY_META: Record<
  ListPrivacy,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  private: { icon: Lock, label: "Private", color: "text-slate-600", bg: "bg-slate-100" },
  shared: { icon: Users, label: "Shared", color: "text-amber-600", bg: "bg-amber-50" },
  public: { icon: Globe, label: "Public", color: "text-emerald-600", bg: "bg-emerald-50" },
};

export function WishlistListPicker({ item, onClose }: WishlistListPickerProps) {
  const { lists, addItem, createList, getListsContaining } =
    useMultiWishlistStore();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrivacy, setNewPrivacy] = useState<ListPrivacy>("private");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const containing = getListsContaining(item.id);

  const toggle = async (listId: string, listName: string) => {
    setLoadingId(listId);
    const already = containing.some((l) => l.id === listId);
    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 180));
    if (already) {
      useMultiWishlistStore.getState().removeItem(listId, item.id);
      toast(`Removed from "${listName}"`);
    } else {
      addItem(listId, item);
      toast.success(`Saved to "${listName}" ❤️`);
    }
    setLoadingId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    const id = createList(newName.trim(), newPrivacy);
    addItem(id, item);
    toast.success(`Created & saved to "${newName.trim()}" ✨`);
    setNewName("");
    setShowNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.20)" }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/30">
              <Heart className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-slate-900 leading-tight">
                Save to Wishlist
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Choose or create a list
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Product chip */}
        <div className="mx-5 mb-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <div className="w-1.5 h-8 rounded-full bg-rose-400 flex-shrink-0" />
          <p className="text-[12px] font-semibold text-slate-600 truncate">
            {item.name}
          </p>
          <span className="ml-auto text-[12px] font-black text-slate-800 flex-shrink-0">
            ₹{item.price}
          </span>
        </div>

        {/* List options */}
        <div className="px-4 pb-2 space-y-2 max-h-52 overflow-y-auto">
          {lists.length === 0 ? (
            <div className="py-6 text-center">
              <Sparkles className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                No lists yet — create one below!
              </p>
            </div>
          ) : (
            lists.map((list) => {
              const isIn = containing.some((l) => l.id === list.id);
              const isLoading = loadingId === list.id;
              const PrivacyIcon = PRIVACY_META[list.privacy].icon;

              return (
                <motion.button
                  key={list.id}
                  layout
                  onClick={() => toggle(list.id, list.name)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    isIn
                      ? "border-rose-400 bg-rose-50/60"
                      : "border-slate-200 hover:border-rose-300 hover:bg-slate-50"
                  } disabled:opacity-70`}
                >
                  {/* Animated fill on selection */}
                  {isIn && (
                    <motion.div
                      layoutId={`fill-${list.id}`}
                      className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isIn
                        ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-400/30"
                        : "bg-slate-100"
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isIn ? "text-white fill-current" : "text-slate-400"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <span
                      className={`block text-sm font-bold truncate ${
                        isIn ? "text-rose-700" : "text-slate-900"
                      }`}
                    >
                      {list.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <PrivacyIcon
                        className={`w-3 h-3 ${
                          isIn ? "text-rose-400" : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-semibold ${
                          isIn ? "text-rose-400" : "text-slate-400"
                        }`}
                      >
                        {list.items.length} item
                        {list.items.length !== 1 ? "s" : ""} ·{" "}
                        {PRIVACY_META[list.privacy].label}
                      </span>
                    </div>
                  </div>
                  {isIn && (
                    <CheckCircle className="w-5 h-5 text-rose-500 flex-shrink-0 relative z-10" />
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Create new list */}
        <div className="px-4 pb-5 pt-2">
          <AnimatePresence mode="wait">
            {showNew ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="List name (e.g. Diwali Shopping)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full h-11 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-[13px] font-semibold text-slate-900 outline-none focus:border-rose-400 focus:bg-white transition-all placeholder:text-slate-400"
                />
                {/* Privacy toggle */}
                <div className="grid grid-cols-3 gap-2">
                  {(["private", "shared", "public"] as ListPrivacy[]).map(
                    (p) => {
                      const meta = PRIVACY_META[p];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={p}
                          onClick={() => setNewPrivacy(p)}
                          className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                            newPrivacy === p
                              ? "border-rose-400 bg-rose-50 text-rose-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </button>
                      );
                    }
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNew(false)}
                    className="flex-1 h-11 rounded-xl border-2 border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-[13px] hover:from-rose-600 hover:to-pink-700 transition-all shadow-md shadow-rose-500/30 active:scale-[0.98]"
                  >
                    Create & Save
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowNew(true)}
                className="w-full h-11 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create new list
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

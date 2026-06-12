"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, Plus, CheckCircle, Circle, Trash2, UserPlus, ShoppingBag, Users, X, Send } from "lucide-react";
import { useFamilyListStore } from "@/store/family-list-store";
import { toast } from "sonner";

export default function ListsPage() {
  const { lists, createList, addItemToList, removeItemFromList, togglePurchased, deleteList } = useFamilyListStore();
  
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMembers, setNewMembers] = useState("");
  
  const [addItemTo, setAddItemTo] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm transition-all">
        <div className="max-w-[800px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Shared Lists</h1>
            <p className="text-[11px] font-medium text-slate-500">{lists.length} active list{lists.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-6">
        {/* Create List Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="bg-white rounded-2xl border-2 border-indigo-100 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-base font-bold text-slate-900">Create Shared List</p>
              </div>
              
              <div className="space-y-3">
                <input
                  placeholder="List name (e.g. Weekend Party)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <input
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <input
                  placeholder="Share with (comma-separated emails)"
                  value={newMembers}
                  onChange={(e) => setNewMembers(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      createList(newName.trim(), newDesc.trim(), newMembers.split(",").map((m) => m.trim()).filter(Boolean));
                      setNewName(""); setNewDesc(""); setNewMembers("");
                      setShowCreate(false);
                      toast.success("List created! Share it with your family.");
                    }
                  }}
                  disabled={!newName.trim()}
                  className="flex-1 h-12 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                  Create List
                </button>
                <button 
                  onClick={() => setShowCreate(false)} 
                  className="h-12 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {lists.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Users className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">No shared lists</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
              Create a shared shopping list to collaborate with family, roommates, or friends.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-12 px-8 rounded-xl bg-indigo-600 text-white text-[15px] font-bold items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Create Your First List
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {lists.map((list) => {
                const purchased = list.items.filter((i) => i.purchased).length;
                const total = list.items.length;
                const progress = total === 0 ? 0 : (purchased / total) * 100;

                return (
                  <motion.div 
                    key={list.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                              <Users className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">{list.name}</h3>
                          </div>
                          {list.description && (
                            <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">{list.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => { deleteList(list.id); toast.success("List deleted"); }}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                          aria-label={`Delete ${list.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {list.members.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Members:</div>
                          {list.members.map((member, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-[11px] font-semibold text-slate-600">
                              <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                {member[0].toUpperCase()}
                              </div>
                              {member}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {total > 0 && (
                      <div className="h-1 w-full bg-slate-100">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    )}

                    {/* Items */}
                    <div className="px-5 py-2">
                      {list.items.length === 0 ? (
                        <div className="py-8 text-center">
                          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-[13px] font-medium text-slate-500">No items yet. Add some groceries!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {list.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-3 group/item">
                              <button
                                onClick={() => togglePurchased(list.id, item.id)}
                                className="flex-shrink-0 focus:outline-none"
                                aria-label={item.purchased ? "Mark as not purchased" : "Mark as purchased"}
                              >
                                {item.purchased ? (
                                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                  </motion.div>
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className={`text-sm font-semibold transition-all ${item.purchased ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                  {item.name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                  Qty: {item.quantity} • <span className="text-slate-500">Added by {item.addedBy}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => { removeItemFromList(list.id, item.id); }}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 sm:opacity-0 sm:group-hover/item:opacity-100 text-slate-300 hover:text-red-500"
                                aria-label={`Remove ${item.name}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action bar */}
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className={purchased === total && total > 0 ? "text-emerald-500" : "text-slate-800"}>{purchased}</span> / {total} purchased
                        </span>
                        <button
                          onClick={() => setAddItemTo(addItemTo === list.id ? null : list.id)}
                          className="flex items-center gap-1.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Item
                        </button>
                      </div>

                      <AnimatePresence>
                        {addItemTo === list.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="flex gap-2 overflow-hidden"
                          >
                            <input
                              autoFocus
                              placeholder="Type an item name..."
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-indigo-600 transition-all shadow-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && itemName.trim()) {
                                  addItemToList(list.id, {
                                    productId: `custom-${Date.now()}`,
                                    name: itemName.trim(),
                                    price: 0,
                                    image: "/placeholder.svg",
                                    quantity: 1,
                                  });
                                  setItemName("");
                                  toast.success("Item added!");
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (itemName.trim()) {
                                  addItemToList(list.id, {
                                    productId: `custom-${Date.now()}`,
                                    name: itemName.trim(),
                                    price: 0,
                                    image: "/placeholder.svg",
                                    quantity: 1,
                                  });
                                  setItemName("");
                                  toast.success("Item added!");
                                }
                              }}
                              disabled={!itemName.trim()}
                              className="h-11 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                            >
                              <Send className="w-4 h-4 ml-0.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

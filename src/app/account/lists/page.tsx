"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, Plus, CheckCircle, Circle, Trash2, UserPlus, ShoppingBag, Users, X } from "lucide-react";
import { useFamilyListStore } from "@/store/family-list-store";
import { toast } from "sonner";

export default function ListsPage() {
  const { lists, createList, addItemToList, removeItemFromList, togglePurchased, deleteList } = useFamilyListStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [addItemTo, setAddItemTo] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Shared Lists</h1>
            <p className="text-xs text-[#666]">{lists.length} list{lists.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New List
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5 space-y-4">
        {/* Create List Form */}
        {showCreate && (
          <div className="bg-white rounded-2xl border border-[#ff4f8b]/30 p-5 shadow-sm space-y-3">
            <p className="text-sm font-bold text-[#1a1a1a]">Create New List</p>
            <input
              placeholder="List name (e.g. Weekend Party)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
            />
            <input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
            />
            <input
              placeholder="Share with (comma-separated emails)"
              value={newMembers}
              onChange={(e) => setNewMembers(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
            />
            <div className="flex gap-2">
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
                className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold hover:bg-[#e63872] transition-colors disabled:opacity-50"
              >
                Create List
              </button>
              <button onClick={() => setShowCreate(false)} className="h-11 px-4 rounded-xl border border-[#e8e8e8] text-sm font-semibold text-[#666] hover:bg-[#f2f2f2] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {lists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-[#ccc]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No lists yet</h3>
            <p className="text-sm text-[#666] mb-6">Create a shared shopping list with family or friends</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First List
            </button>
          </div>
        ) : (
          lists.map((list) => {
            const purchased = list.items.filter((i) => i.purchased).length;
            const total = list.items.length;
            return (
              <div key={list.id} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-[#e8e8e8] bg-[#fafafa]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#ff4f8b]" />
                        <h3 className="text-base font-bold text-[#1a1a1a]">{list.name}</h3>
                      </div>
                      {list.description && (
                        <p className="text-xs text-[#666] mt-0.5">{list.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {list.members.map((member, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] font-medium text-[#999]">
                            <div className="w-5 h-5 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                              <span className="text-[8px] font-bold text-[#666]">{member[0]}</span>
                            </div>
                            <span>{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { deleteList(list.id); toast.success("List deleted"); }}
                      className="p-1.5 hover:bg-[#fff0f6] rounded-lg transition-colors"
                      aria-label={`Delete ${list.name}`}
                    >
                      <Trash2 className="w-4 h-4 text-[#999] hover:text-[#ff4f8b]" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-2">
                  {list.items.length === 0 ? (
                    <p className="text-sm text-[#999] text-center py-4">No items yet. Add some groceries!</p>
                  ) : (
                    list.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-1.5">
                        <button
                          onClick={() => togglePurchased(list.id, item.id)}
                          className="flex-shrink-0"
                          aria-label={item.purchased ? "Mark as not purchased" : "Mark as purchased"}
                        >
                          {item.purchased ? (
                            <CheckCircle className="w-5 h-5 text-[#0c831f]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#ccc] hover:text-[#ff4f8b] transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${item.purchased ? "text-[#999] line-through" : "text-[#1a1a1a]"}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#999]">
                            Qty: {item.quantity} • Added by {item.addedBy}
                          </p>
                        </div>
                        <button
                          onClick={() => { removeItemFromList(list.id, item.id); }}
                          className="p-1 hover:bg-[#fff0f6] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="w-3.5 h-3.5 text-[#999]" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Action bar */}
                <div className="px-5 py-3 border-t border-[#e8e8e8] bg-[#fafafa]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">
                      {purchased}/{total} purchased
                    </span>
                    <button
                      onClick={() => setAddItemTo(addItemTo === list.id ? null : list.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#ff4f8b] hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>

                  {addItemTo === list.id && (
                    <div className="flex gap-2 mt-3">
                      <input
                        placeholder="Item name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="flex-1 h-10 rounded-xl border border-[#e8e8e8] px-3 text-sm outline-none focus:border-[#ff4f8b] transition-colors"
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
                            toast.success("Item added to list!");
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
                            toast.success("Item added to list!");
                          }
                        }}
                        disabled={!itemName.trim()}
                        className="h-10 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

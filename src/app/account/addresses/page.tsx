"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Home, Building2, Plus, Edit2, Trash2, MapPin, CheckCircle, X, Star, MapPinned } from "lucide-react";
import { useAddressStore, type Address } from "@/store/address-store";
import { useUserAddresses } from "@/hooks/use-user-addresses";
import { toast } from "sonner";

interface AddressForm {
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

const emptyForm: AddressForm = {
  type: "Home",
  name: "",
  address: "",
  city: "",
  pincode: "",
  phone: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { addresses, setDefaultAddress: storeSetDefaultAddress } = useAddressStore();
  const { addAddress, updateAddress, deleteAddress, setDefaultAddress } = useUserAddresses(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>({ ...emptyForm });
  const [addressToDelete, setAddressToDelete] = useState<{id: string, type: string} | null>(null);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (addr: Address) => {
    setForm({
      type: addr.type,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.pincode.trim() || !form.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^\+?91\s?\d{10}$|^\d{10}$/.test(form.phone.trim())) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (editingId) {
      const res = await updateAddress(editingId, form);
      if (res.success) {
        toast.success("Address updated successfully!");
        resetForm();
      } else {
        toast.error(res.message || "Failed to update address");
      }
    } else {
      const res = await addAddress(form);
      if (res.success) {
        toast.success("New address added!");
        resetForm();
      } else {
        toast.error(res.message || "Failed to add address");
      }
    }
  };

  const handleDeleteClick = (id: string, type: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (addr?.isDefault && addresses.filter((a) => a.id !== id).length > 0) {
      toast.error("Set another address as default before deleting this one");
      return;
    }
    setAddressToDelete({ id, type });
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    const { id, type } = addressToDelete;
    const res = await deleteAddress(id);
    if (res.success) {
      toast.success(`${type} address removed`);
    } else {
      toast.error(res.message || "Failed to delete address");
    }
    setAddressToDelete(null);
  };

  const handleSetDefault = async (id: string) => {
    // We update local state first for instant UI response
    storeSetDefaultAddress(id);
    // Call the dedicated set-default endpoint
    const res = await setDefaultAddress(id);
    if (res.success) {
      toast.success("Default address updated!");
    } else {
      toast.error(res.message || "Failed to sync default address");
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Delivery Addresses</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666]">{addresses.length} saved</span>
            {!showForm && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-1 h-9 px-3 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
        {/* ─── Add / Edit Address Form ─── */}
        {showForm && (
          <div className="bg-white rounded-2xl border-2 border-[#ff4f8b]/30 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#1a1a1a]">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>
              <button onClick={resetForm} className="p-1 hover:bg-[#f2f2f2] rounded-full transition-colors">
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            {/* Address Type */}
            <div className="flex gap-2">
              {(["Home", "Work", "Other"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, type }))}
                  className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-bold transition-colors ${
                    form.type === type
                      ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
                      : "border-[#e8e8e8] text-[#666] hover:border-[#ff4f8b]"
                  }`}
                >
                  {type === "Home" ? <Home className="w-3.5 h-3.5" /> : type === "Work" ? <Building2 className="w-3.5 h-3.5" /> : <MapPinned className="w-3.5 h-3.5" />}
                  {type}
                </button>
              ))}
            </div>

            <input
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full h-12 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] placeholder:text-[#999]"
            />
            <input
              placeholder="Address (Street, Area, Landmark) *"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full h-12 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] placeholder:text-[#999]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="h-12 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] placeholder:text-[#999]"
              />
              <input
                placeholder="Pincode *"
                value={form.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                inputMode="numeric"
                pattern="[0-9]{6}"
                className="h-12 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] placeholder:text-[#999]"
              />
            </div>
            <input
              placeholder="Phone Number *"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              type="tel"
              className="w-full h-12 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] placeholder:text-[#999]"
            />

            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded border-[#ccc] text-[#ff4f8b] focus:ring-[#ff4f8b]"
              />
              <span className="text-sm font-semibold text-[#1a1a1a]">Set as default address</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold hover:bg-[#e63872] transition-colors"
              >
                {editingId ? "Update Address" : "Save Address"}
              </button>
              <button
                onClick={resetForm}
                className="h-11 px-5 rounded-xl border border-[#e8e8e8] text-sm font-semibold text-[#666] hover:bg-[#f2f2f2] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Default Address Info */}
        {addresses.some((a) => a.isDefault) && !showForm && (
          <div className="flex items-center gap-2 px-1">
            <MapPin className="w-4 h-4 text-[#0c831f]" />
            <span className="text-xs font-medium text-[#0c831f]">Default delivery address</span>
          </div>
        )}

        {/* ── Address List ── */}
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-[#ccc]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No addresses saved</h3>
            <p className="text-sm text-[#666] mb-6">Add a delivery address to get started</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                address.isDefault ? "border-[#0c831f] ring-1 ring-[#0c831f]/20" : "border-[#e8e8e8]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    address.type === "Home" ? "bg-[#e8f5e9]" : address.type === "Work" ? "bg-[#e3f2fd]" : "bg-[#f3e5f5]"
                  }`}>
                    {address.type === "Home" ? (
                      <Home className="w-4.5 h-4.5 text-[#0c831f]" />
                    ) : address.type === "Work" ? (
                      <Building2 className="w-4.5 h-4.5 text-[#1565c0]" />
                    ) : (
                      <MapPinned className="w-4.5 h-4.5 text-[#7b1fa2]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1a1a1a]">{address.type}</span>
                      {address.isDefault && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#e8f5e9] text-[#0c831f] text-[10px] font-bold rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#e8f5e9] transition-colors group"
                      aria-label={`Set ${address.type} as default`}
                    >
                      <Star className="w-3.5 h-3.5 text-[#999] group-hover:text-[#0c831f]" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditForm(address)}
                    className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#f2f2f2] transition-colors"
                    aria-label={`Edit ${address.type} address`}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#666]" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(address.id, address.type)}
                    className="w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] flex items-center justify-center hover:bg-[#fff0f6] transition-colors"
                    aria-label={`Delete ${address.type} address`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#ff4f8b]" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="px-5 py-4">
                <p className="font-semibold text-sm text-[#1a1a1a] mb-1">{address.name}</p>
                <p className="text-sm text-[#666] leading-relaxed">{address.address}, {address.city} - {address.pincode}</p>
                <p className="text-sm text-[#666] mt-1.5">
                  <span className="text-[#999]">Phone: </span>{address.phone}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#fff0f6] flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-[#ff4f8b]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">Delete Address</h3>
                <p className="text-sm text-[#666] mt-1">
                  Are you sure you want to delete this {addressToDelete.type} address? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 pt-2">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="flex-1 h-11 rounded-xl border border-[#e8e8e8] text-sm font-semibold text-[#666] hover:bg-[#f2f2f2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 h-11 rounded-xl bg-[#ff4f8b] text-white text-sm font-bold hover:bg-[#e63872] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

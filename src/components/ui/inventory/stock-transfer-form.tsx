"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import type { StockTransfer } from "@/types/inventory";
import { adminToast } from "@/lib/admin-toast";
import { validateForm, inventorySchemas } from "@/validation/admin";

interface StockTransferFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StockTransfer, "id" | "status" | "createdAt">) => Promise<void>;
  warehouses: { name: string; id: string }[];
  products: { name: string; sku: string; id?: string }[];
}

export default function StockTransferForm({
  open,
  onClose,
  onSubmit,
  warehouses,
  products,
}: StockTransferFormProps) {
  const [product, setProduct] = useState("");
  const [sku, setSku] = useState("");
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Look up IDs
    const fromId = warehouses.find((w) => w.name === fromWarehouse)?.id || fromWarehouse;
    const toId = warehouses.find((w) => w.name === toWarehouse)?.id || toWarehouse;
    const selectedProduct = products.find((p) => p.name === product);
    const prodId = selectedProduct?.id || selectedProduct?.sku || sku || product;

    const payload = {
      fromWarehouseId: fromId,
      toWarehouseId: toId,
      productId: prodId,
      quantity,
      notes: notes || undefined,
    };

    const validation = validateForm(inventorySchemas.stockTransfer, payload);
    if (!validation.success) {
      adminToast.validationError(validation.errors);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        product,
        sku,
        fromWarehouse,
        toWarehouse,
        quantity,
        notes: notes || undefined,
        initiatedBy: "Admin User",
        date: new Date().toISOString().split("T")[0],
        fromWarehouseId: fromId,
        toWarehouseId: toId,
        productId: prodId,
      });
      // Reset form
      setProduct("");
      setSku("");
      setFromWarehouse("");
      setToWarehouse("");
      setQuantity(0);
      setNotes("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductChange = (name: string) => {
    setProduct(name);
    const found = products.find((p) => p.name === name);
    setSku(found?.sku || "");
  };

  const warehouseOptions = warehouses;
  const productOptions = products;

  return (
    <ReusableModal open={open} onClose={onClose} title="New Stock Transfer" subtitle="Transfer stock between warehouses" size="md">
      <div className="space-y-4">
        {/* Product */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Product *</label>
          <select
            value={product}
            onChange={(e) => handleProductChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
          >
            <option value="">Select Product</option>
            {productOptions.map((opt) => (
              <option key={opt.sku} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        </div>

        {/* From / To Side by side */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">From Warehouse *</label>
            <select
              value={fromWarehouse}
              onChange={(e) => setFromWarehouse(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            >
              <option value="">Select Source</option>
              {warehouseOptions.map((opt) => (
                <option key={opt.id} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div className="flex h-10 items-center pb-1">
            <ArrowRightLeft className="h-5 w-5 text-[#999]" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">To Warehouse *</label>
            <select
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            >
              <option value="">Select Destination</option>
              {warehouseOptions.map((opt) => (
                <option key={opt.id} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Quantity *</label>
          <input
            type="number"
            min={1}
            value={quantity || ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Enter quantity"
            className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#666]">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this transfer"
            rows={2}
            className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f] resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-[#fef2f2] px-3 py-2 text-xs font-bold text-[#dc2626]">
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
        <button
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
        >
          {submitting ? (
            <>Processing...</>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </>
          )}
        </button>
      </div>
    </ReusableModal>
  );
}

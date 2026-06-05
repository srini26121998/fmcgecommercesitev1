"use client";

import { useState, useMemo } from "react";
import {
  Save, X, TrendingUp, TrendingDown, DollarSign,
  Eye, Edit3, Trash2, ChevronUp, ChevronDown,
  ChevronsUpDown, Filter, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface PricingItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  cost: number;
  margin: number;
  tax: number;
  [key: string]: any;
}

interface PriceEditorProps {
  items: PricingItem[];
  onUpdate?: (id: string, data: { name?: string; price?: number; mrp?: number; costPrice?: number; taxRate?: number }) => Promise<boolean>;
  isLoading?: boolean;
}

type SortField = "name" | "brand" | "category" | "status" | "stock" | "price" | "mrp" | "cost" | "margin" | "tax";
type SortDir = "asc" | "desc";
type MarginFilter = "all" | "high" | "medium" | "low";
type ColumnKey = "product" | "brand" | "category" | "status" | "stock" | "price" | "mrp" | "cost" | "margin" | "tax" | "actions";

export default function PriceEditor({ items, onUpdate, isLoading }: PriceEditorProps) {
  // ── Sorting ──────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ── Filtering ────────────────────────────────────────────
  const [marginFilter, setMarginFilter] = useState<MarginFilter>("all");
  const [taxFilter, setTaxFilter] = useState<string>("all");

  // ── Pagination ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Columns ──────────────────────────────────────────────
  const [columns, setColumns] = useState<ColumnKey[]>([
    "product", "brand", "category", "status", "stock", "price", "mrp", "cost", "margin", "tax", "actions"
  ]);
  const [draggedCol, setDraggedCol] = useState<ColumnKey | null>(null);

  const handleDragStart = (e: React.DragEvent, col: ColumnKey) => {
    setDraggedCol(col);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: ColumnKey) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === "actions" || draggedCol === "actions") return;
    const newCols = [...columns];
    const sourceIdx = newCols.indexOf(draggedCol);
    const targetIdx = newCols.indexOf(targetCol);
    newCols.splice(sourceIdx, 1);
    newCols.splice(targetIdx, 0, draggedCol);
    setColumns(newCols);
    setDraggedCol(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [viewItem, setViewItem] = useState<PricingItem | null>(null);

  // ── Edit Drawer ──────────────────────────────────────────
  const [editItem, setEditItem] = useState<PricingItem | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; price: number | ""; mrp: number | ""; cost: number | ""; tax: number }>({
    name: "", price: 0, mrp: 0, cost: 0, tax: 0,
  });
  const [saving, setSaving] = useState(false);

  // ── Delete ───────────────────────────────────────────────
  const deleteItem = (item: PricingItem) => {
    toast.error(`Delete "${item.name}"?`, {
      action: { label: "Confirm", onClick: () => toast.success(`${item.name} deleted`) },
    });
  };

  const openEditDrawer = (item: PricingItem) => {
    setEditItem(item);
    setEditForm({ name: item.name, price: item.price, mrp: item.mrp, cost: item.cost, tax: item.tax });
  };

  const closeEditDrawer = () => { setEditItem(null); };

  const handleSave = async () => {
    if (!editItem || !onUpdate) return;
    setSaving(true);
    try {
      const ok = await onUpdate(editItem.id, {
        name: editForm.name,
        price: Number(editForm.price) || 0,
        mrp: Number(editForm.mrp) || 0,
        costPrice: Number(editForm.cost) || 0,
        taxRate: editForm.tax,
      });
      if (ok) {
        toast.success(`Pricing updated for ${editItem.name}`);
        closeEditDrawer();
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Sort handler ─────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Unique tax values for filter ─────────────────────────
  const taxValues = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => String(i.tax)))).sort()],
    [items]
  );

  // ── Filtered + sorted + paginated data ──────────────────
  const filteredSorted = useMemo(() => {
    let data = [...items];
    if (marginFilter !== "all") {
      data = data.filter((i) =>
        marginFilter === "high" ? i.margin >= 25 :
        marginFilter === "medium" ? i.margin >= 10 && i.margin < 25 :
        i.margin < 10
      );
    }
    if (taxFilter !== "all") {
      data = data.filter((i) => String(i.tax) === taxFilter);
    }
    data.sort((a, b) => {
      let av: any = a[sortField];
      let bv: any = b[sortField];
      if (sortField === "name") { av = a.name; bv = b.name; }
      else if (sortField === "category") { av = a.categoryName || a.category || ""; bv = b.categoryName || b.category || ""; }
      else if (sortField === "stock") { av = a.stock?.qtyAvailable ?? a.stock ?? 0; bv = b.stock?.qtyAvailable ?? b.stock ?? 0; }
      
      if (av === undefined || av === null) av = "";
      if (bv === undefined || bv === null) bv = "";
      
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [items, marginFilter, taxFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const displayItems = filteredSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset to page 1 when filters change
  const applyMarginFilter = (f: MarginFilter) => { setMarginFilter(f); setPage(1); };
  const applyTaxFilter = (v: string) => { setTaxFilter(v); setPage(1); };


  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-[#ccc]" />;
    return sortDir === "asc"
      ? <ChevronUp className="inline h-3 w-3 ml-1 text-[#0c831f]" />
      : <ChevronDown className="inline h-3 w-3 ml-1 text-[#0c831f]" />;
  };

  const getHeaderProps = (col: ColumnKey) => {
    const isFrozen = col === "actions";
    const baseThClass = `px-4 py-3 select-none transition-colors whitespace-nowrap ${
      isFrozen ? "sticky right-0 z-20 bg-[#f9fafb] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] w-28 text-right" : ""
    } ${draggedCol === col ? "opacity-50 bg-[#e8e8e8]" : ""}`;
    
    let alignmentClass = "text-left";
    let isSortable = true;
    let field: SortField | null = null;
    let label = "";

    switch (col) {
      case "product": alignmentClass = "text-left"; field = "name"; label = "Product"; break;
      case "brand": alignmentClass = "text-left"; field = "brand"; label = "Brand"; break;
      case "category": alignmentClass = "text-left"; field = "category"; label = "Category"; break;
      case "status": alignmentClass = "text-left"; field = "status"; label = "Status"; break;
      case "stock": alignmentClass = "text-left"; field = "stock"; label = "Stock"; break;
      case "price": alignmentClass = "text-center"; field = "price"; label = "Selling Price"; break;
      case "mrp": alignmentClass = "text-center"; field = "mrp"; label = "MRP"; break;
      case "cost": alignmentClass = "text-center"; field = "cost"; label = "Cost Price"; break;
      case "margin": alignmentClass = "text-right"; field = "margin"; label = "Margin"; break;
      case "tax": alignmentClass = "text-right"; field = "tax"; label = "Tax"; break;
      case "actions": alignmentClass = "text-right"; isSortable = false; label = "Actions"; break;
    }

    return {
      className: `${baseThClass} ${alignmentClass} ${isSortable ? "cursor-pointer hover:text-[#0c831f]" : "text-[#888]"}`,
      onClick: isSortable ? () => handleSort(field as SortField) : undefined,
      label,
      field,
      draggable: !isFrozen,
      col
    };
  };

  const renderCell = (item: PricingItem, col: ColumnKey) => {
    const isFrozen = col === "actions";
    const baseTdClass = `px-4 py-3 ${isFrozen ? "sticky right-0 z-10 bg-white group-hover:bg-[#f9fafb] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] transition-colors" : ""}`;

    switch (col) {
      case "product":
        return (
          <td key={col} className={`${baseTdClass} min-w-[200px]`}>
            <p className="font-bold text-[#1a1a1a] truncate max-w-[200px]">{item.name}</p>
            <p className="text-[10px] text-[#999]">{item.sku}</p>
            <p className="text-[10px] text-[#999]">{item.barcode}</p>
          </td>
        );
      case "brand":
        return <td key={col} className={`${baseTdClass} text-left text-[#666]`}>{item.brand || "—"}</td>;
      case "category":
        return <td key={col} className={`${baseTdClass} text-left text-[#666]`}>{item.categoryName || item.category || "—"}</td>;
      case "status":
        return (
          <td key={col} className={`${baseTdClass} text-left`}>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              item.status === 'active' ? 'bg-[#e8f5e9] text-[#0c831f]' : 'bg-[#f3f4f6] text-[#666]'
            }`}>
              {item.status || "—"}
            </span>
          </td>
        );
      case "stock":
        return <td key={col} className={`${baseTdClass} text-left text-[#666]`}>{item.stock?.qtyAvailable ?? item.stock ?? 0} {item.unit || ""}</td>;
      case "price":
        return <td key={col} className={`${baseTdClass} text-center font-bold`}>₹{item.price}</td>;
      case "mrp":
        return <td key={col} className={`${baseTdClass} text-center text-[#999] line-through`}>₹{item.mrp}</td>;
      case "cost":
        return <td key={col} className={`${baseTdClass} text-center text-[#666]`}>₹{item.cost}</td>;
      case "margin":
        const marginColor =
          item.margin >= 25 ? "text-[#0c831f]" :
          item.margin >= 10 ? "text-[#d97706]" :
          "text-[#dc2626]";
        return (
          <td key={col} className={`${baseTdClass} text-right`}>
            <div className="flex items-center justify-end gap-1">
              <span className={`font-bold ${marginColor}`}>{item.margin}%</span>
              {item.margin >= 25 ? (
                <TrendingUp className="h-3 w-3 text-[#0c831f]" />
              ) : item.margin < 10 ? (
                <TrendingDown className="h-3 w-3 text-[#dc2626]" />
              ) : null}
            </div>
          </td>
        );
      case "tax":
        return <td key={col} className={`${baseTdClass} text-right`}>{item.tax}%</td>;
      case "actions":
        return (
          <td key={col} className={`${baseTdClass} text-right`}>
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setViewItem(item)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff6ff] text-[#3b82f6] transition hover:bg-[#dbeafe]"
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => openEditDrawer(item)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f5e9] text-[#0c831f] transition hover:bg-[#dcfce7]"
                title="Edit pricing"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteItem(item)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] transition hover:bg-[#fee2e2]"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3">
        <Filter className="h-4 w-4 text-[#999]" />
        <span className="text-xs font-bold text-[#666]">Margin:</span>
        {(["", "high", "medium", "low"] as MarginFilter[]).map((f) => (
          <button
            key={f || "all"}
            onClick={() => applyMarginFilter((f || "all") as MarginFilter)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              marginFilter === (f || "all")
                ? "bg-[#0c831f] text-white"
                : "border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6]"
            }`}
          >
            {!f ? "All" : f === "high" ? "High ≥25%" : f === "medium" ? "Mid 10–25%" : "Low <10%"}
          </button>
        ))}

        <span className="ml-3 text-xs font-bold text-[#666]">Tax:</span>
        <select
          value={taxFilter}
          onChange={(e) => applyTaxFilter(e.target.value)}
          className="h-7 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[11px] font-semibold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
        >
          {taxValues.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Tax" : `${t}%`}</option>
          ))}
        </select>

        <span className="ml-auto text-[11px] text-[#999]">{filteredSorted.length} of {items.length} products</span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-[#e8e8e8] bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f9fafb] text-[10px] font-semibold uppercase tracking-wide text-[#888]">
              {columns.map((col) => {
                const props = getHeaderProps(col);
                return (
                  <th
                    key={col}
                    className={props.className}
                    onClick={props.onClick}
                    draggable={props.draggable}
                    onDragStart={(e) => props.draggable && handleDragStart(e, col)}
                    onDrop={(e) => props.draggable && handleDrop(e, col)}
                    onDragOver={handleDragOver}
                  >
                    {props.label} {props.field && <SortIcon field={props.field} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e8e8]">
            {displayItems.map((item) => (
              <tr key={item.id} className="text-sm transition hover:bg-[#f9fafb] group">
                {columns.map((col) => renderCell(item, col))}
              </tr>
            ))}
          </tbody>
        </table>

        {displayItems.length === 0 && !isLoading && (
          <div className="p-10 text-center">
            <DollarSign className="mx-auto h-7 w-7 text-[#ccc]" />
            <p className="mt-2 text-xs text-[#999]">No products match the current filters</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="h-8 flex-1 skeleton-shimmer rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {filteredSorted.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#e8e8e8] px-4 py-3">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#999]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-7 rounded-lg border border-[#e8e8e8] bg-white px-2 text-[11px] font-semibold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            >
              {[5, 10, 20, 50].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Page info + controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#999]">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredSorted.length)} of {filteredSorted.length}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#666] transition hover:bg-[#f6f7f6] disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-[11px] text-[#999]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition ${
                      safePage === p
                        ? "bg-[#0c831f] text-white"
                        : "border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#666] transition hover:bg-[#f6f7f6] disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          />
          {/* Dialog */}
          <div className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#0c831f]">Pricing Details</p>
                <h2 className="mt-0.5 text-base font-black text-[#1a1a1a]">{viewItem.name}</h2>
                <p className="text-[10px] text-[#999]">{viewItem.sku}</p>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Selling Price", value: `₹${viewItem.price}`, highlight: true },
                  { label: "MRP", value: `₹${viewItem.mrp}` },
                  { label: "Cost Price", value: `₹${viewItem.cost}` },
                  { label: "Tax Rate", value: `${viewItem.tax}%` },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-[#f9fafb] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                    <p className={`mt-1 text-lg font-black ${f.highlight ? "text-[#0c831f]" : "text-[#1a1a1a]"}`}>
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              {/* Margin bar */}
              <div className="mt-4 rounded-xl bg-[#f9fafb] px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Profit Margin</p>
                  <span className={`text-lg font-black ${
                    viewItem.margin >= 25 ? "text-[#0c831f]" :
                    viewItem.margin >= 10 ? "text-[#d97706]" : "text-[#dc2626]"
                  }`}>
                    {viewItem.margin}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      viewItem.margin >= 25 ? "bg-[#0c831f]" :
                      viewItem.margin >= 10 ? "bg-[#d97706]" : "bg-[#dc2626]"
                    }`}
                    style={{ width: `${Math.min(viewItem.margin, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#999]">
                  {viewItem.margin >= 25 ? "High margin product" :
                   viewItem.margin >= 10 ? "Medium margin product" : "Low margin — review pricing"}
                </p>
              </div>
            </div>
            <div className="border-t border-[#e8e8e8] px-6 py-4 flex justify-end">
              <button
                onClick={() => { setViewItem(null); openEditDrawer(viewItem); }}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all"
              >
                <Edit3 className="h-4 w-4" /> Edit Pricing
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Drawer ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editItem ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeEditDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editItem ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#0c831f]">Edit Pricing</p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-[280px]">{editItem?.name}</h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editItem?.sku}</p>
          </div>
          <button
            onClick={closeEditDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Live margin preview */}
          {editItem && (
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Live Margin Preview</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-2xl font-black ${
                  Number(editForm.mrp) > 0 && ((Number(editForm.mrp) - Number(editForm.cost)) / Number(editForm.mrp)) * 100 >= 25
                    ? "text-[#0c831f]"
                    : Number(editForm.mrp) > 0 && ((Number(editForm.mrp) - Number(editForm.cost)) / Number(editForm.mrp)) * 100 >= 10
                    ? "text-[#d97706]"
                    : "text-[#dc2626]"
                }`}>
                  {Number(editForm.mrp) > 0
                    ? (((Number(editForm.mrp) - Number(editForm.cost)) / Number(editForm.mrp)) * 100).toFixed(1)
                    : "0.0"}%
                </span>
                <span className="text-xs text-[#999]">margin on MRP</span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Product (Title)</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Selling Price (₹)</label>
            <input
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value === "" ? "" : Number(e.target.value) }))}
              min="0"
              step="0.01"
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">MRP (₹)</label>
            <input
              type="number"
              value={editForm.mrp}
              onChange={(e) => setEditForm((f) => ({ ...f, mrp: e.target.value === "" ? "" : Number(e.target.value) }))}
              min="0"
              step="0.01"
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
            {Number(editForm.mrp) > 0 && Number(editForm.price) > 0 && (
              <p className="mt-1 text-[10px] text-[#0c831f]">
                Discount: {(((Number(editForm.mrp) - Number(editForm.price)) / Number(editForm.mrp)) * 100).toFixed(1)}% off MRP
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Cost Price (₹)</label>
            <input
              type="number"
              value={editForm.cost}
              onChange={(e) => setEditForm((f) => ({ ...f, cost: e.target.value === "" ? "" : Number(e.target.value) }))}
              min="0"
              step="0.01"
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
            {Number(editForm.price) > 0 && Number(editForm.cost) > 0 && (
              <p className="mt-1 text-[10px] text-[#999]">
                Gross profit: ₹{(Number(editForm.price) - Number(editForm.cost)).toFixed(2)} per unit
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Tax Rate (%)</label>
            <select
              value={editForm.tax}
              onChange={(e) => setEditForm((f) => ({ ...f, tax: Number(e.target.value) }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            >
              {[0, 5, 12, 18, 28].map((t) => (
                <option key={t} value={t}>{t}% GST</option>
              ))}
            </select>
          </div>

          {editItem && (
            <div className="space-y-4 pt-4 border-t border-[#e8e8e8]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">Additional Details (Read-only)</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">SKU</label>
                  <input type="text" value={editItem.sku || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Barcode</label>
                  <input type="text" value={editItem.barcode || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Description</label>
                <textarea value={editItem.description || ""} disabled className="h-20 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] p-3 text-xs text-[#666] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Brand</label>
                  <input type="text" value={editItem.brand || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Category</label>
                  <input type="text" value={editItem.categoryName || editItem.category || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Unit</label>
                  <input type="text" value={editItem.unit || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Weight</label>
                  <input type="text" value={editItem.weight || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Status</label>
                  <input type="text" value={editItem.status || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Stock Available</label>
                  <input type="text" value={editItem.stock?.qtyAvailable ?? editItem.stock ?? 0} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Warehouse</label>
                  <input type="text" value={editItem.warehouse || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Supplier</label>
                  <input type="text" value={editItem.supplier || ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Created At</label>
                  <input type="text" value={editItem.createdAt ? new Date(editItem.createdAt).toLocaleDateString() : ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#666]">Updated At</label>
                  <input type="text" value={editItem.updatedAt ? new Date(editItem.updatedAt).toLocaleDateString() : ""} disabled className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#f9fafb] px-3 text-xs text-[#666]" />
                </div>
              </div>
            </div>
          )}

          {/* Summary card */}
          <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 space-y-2 text-xs">
            <p className="font-black text-[#666] uppercase tracking-wide text-[10px]">Price Summary</p>
            <div className="flex justify-between">
              <span className="text-[#999]">Selling Price</span>
              <span className="font-bold text-[#1a1a1a]">₹{editForm.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">MRP</span>
              <span className="font-bold text-[#1a1a1a]">₹{editForm.mrp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#999]">Cost</span>
              <span className="font-bold text-[#1a1a1a]">₹{editForm.cost}</span>
            </div>
            <div className="flex justify-between border-t border-[#e8e8e8] pt-2">
              <span className="text-[#999]">Tax amount</span>
              <span className="font-bold text-[#1a1a1a]">
                ₹{((Number(editForm.price) * editForm.tax) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button
            onClick={closeEditDrawer}
            className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </aside>
    </>
  );
}

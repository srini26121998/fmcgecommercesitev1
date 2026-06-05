"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedLoader } from "@/components/ui/animated-loader";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  hideOnMobile?: boolean;
}

interface TableAction<T> {
  label: string;
  icon: ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "danger" | "success" | "warning";
  show?: (item: T) => boolean;
}

interface BulkAction {
  label: string;
  icon: ReactNode;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "danger" | "success";
}

interface ReusableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  actions?: TableAction<T>[];
  bulkActions?: BulkAction[];
  enableSelection?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  sortKey?: string | null;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string, dir: "asc" | "desc") => void;
}

export function ReusableTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  actions,
  bulkActions,
  enableSelection = false,
  onRowClick,
  emptyMessage = "No data found",
  emptyIcon,
  page,
  pageSize = 10,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  sortKey: externalSortKey,
  sortDir: externalSortDir,
  onSortChange,
}: ReusableTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDir, setInternalSortDir] = useState<"asc" | "desc">("asc");

  const sortKey = externalSortKey !== undefined ? externalSortKey : internalSortKey;
  const sortDir = externalSortDir !== undefined ? externalSortDir : internalSortDir;

  const sortedData = useMemo(() => {
    // If onSortChange is provided, assume backend sorting or controlled sorting
    if (onSortChange && externalSortKey !== undefined) return data;
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, onSortChange, externalSortKey]);

  // -- Drag and Drop State --
  const [colOrder, setColOrder] = useState<string[]>([]);

  useEffect(() => {
    setColOrder(columns.map((c) => c.key));
  }, [columns]);

  const orderedColumns = useMemo(() => {
    if (colOrder.length === 0) return columns;
    const colMap = new Map(columns.map((c) => [c.key, c]));
    return colOrder.map((key) => colMap.get(key)).filter(Boolean) as Column<T>[];
  }, [columns, colOrder]);

  // -- Drag and Drop Handlers --
  const handleColDragStart = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData("text/plain/col", key);
  };

  const handleColDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData("text/plain/col");
    if (!sourceKey || sourceKey === targetKey) return;
    setColOrder((prev) => {
      const newOrder = [...prev];
      const srcIdx = newOrder.indexOf(sourceKey);
      const tgtIdx = newOrder.indexOf(targetKey);
      if (srcIdx > -1 && tgtIdx > -1) {
        newOrder.splice(srcIdx, 1);
        newOrder.splice(tgtIdx, 0, sourceKey);
      }
      return newOrder;
    });
  };

  const handleSort = useCallback((key: string) => {
    const isSameKey = sortKey === key;
    const newDir = isSameKey && sortDir === "asc" ? "desc" : "asc";

    if (onSortChange) {
      onSortChange(key, newDir);
    } else {
      setInternalSortKey(key);
      setInternalSortDir(newDir);
    }
  }, [sortKey, sortDir, onSortChange]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === data.length) {
        return new Set();
      }
      return new Set(data.map(keyExtractor));
    });
  }, [data, keyExtractor]);

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  if (isLoading) {
    return <AnimatedLoader text="Loading records..." />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {emptyIcon || (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f6]">
            <svg className="h-6 w-6 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        )}
        <p className="text-sm font-bold text-[#666]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk Action Bar */}
      {enableSelection && selectedIds.size > 0 && bulkActions && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#0c831f]/5 border border-[#0c831f]/20 px-4 py-2.5">
          <span className="text-xs font-bold text-[#0c831f]">{selectedIds.size} selected</span>
          <div className="ml-auto flex items-center gap-1.5">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.onClick(Array.from(selectedIds))}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${action.variant === "danger"
                    ? "bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]"
                    : action.variant === "success"
                      ? "bg-[#e8f5e9] text-[#0c831f] hover:bg-[#d0f0d4]"
                      : "bg-white text-[#666] hover:bg-[#f6f7f6] border border-[#e8e8e8]"
                  }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-2 rounded-lg px-2 py-1.5 text-xs font-bold text-[#999] hover:text-[#666]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e8e8e8] bg-white">
        <table className="w-full admin-table-responsive">
          <thead>
            <tr className="bg-[#f9fafb] text-left text-[9px] font-medium uppercase tracking-wider text-[#666]">
              {enableSelection && (
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[#d0d0d0] accent-[#0c831f]"
                  />
                </th>
              )}
              {orderedColumns.map((col) => (
                <th
                  key={col.key}
                  draggable
                  onDragStart={(e) => handleColDragStart(e, col.key)}
                  onDragOver={handleColDragOver}
                  onDrop={(e) => handleColDrop(e, col.key)}
                  className={`px-3 py-2 ${col.hideOnMobile ? "hidden md:table-cell" : ""} ${col.sortable ? "cursor-pointer select-none hover:text-[#1a1a1a]" : ""
                    }`}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.align === "right"
                      ? "justify-end"
                      : col.align === "center"
                        ? "justify-center"
                        : "justify-start"
                    }`}>
                    <div className="cursor-grab hover:text-black opacity-50 hover:opacity-100 mr-1" title="Drag to reorder column" onClick={e => e.stopPropagation()}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                    </div>
                    {col.header}
                    {col.sortable && (
                      <span className="text-[#999]">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="w-24 px-3 py-2 text-left sticky right-0 bg-[#f9fafb] shadow-[-1px_0_0_0_#e8e8e8] z-10">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e8e8]">
            {sortedData.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.has(id);
              return (
                <tr
                  key={id}
                  className={`group text-xs font-normal text-[#334155] transition-all duration-150 ${onRowClick ? "cursor-pointer" : ""
                    } ${isSelected ? "bg-[#e8f5e9]/40" : "hover:bg-[#f9fafb]"
                    }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {enableSelection && (
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-[#d0d0d0] accent-[#0c831f]"
                      />
                    </td>
                  )}
                  {orderedColumns.map((col) => (
                    <td
                      key={col.key}
                      data-label={col.header}
                      className={`md:px-3 md:py-2 max-md:px-0 max-md:py-1.5 max-md:whitespace-normal md:whitespace-nowrap ${col.hideOnMobile ? "hidden md:table-cell" : "flex md:table-cell"}`}
                      style={{ textAlign: col.align || "left" }}
                    >
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td data-label="Actions" className={`md:px-3 md:py-2 max-md:px-0 max-md:py-2 max-md:whitespace-normal md:whitespace-nowrap md:sticky right-0 z-10 md:shadow-[-1px_0_0_0_#e8e8e8] flex md:table-cell ${isSelected ? "bg-[#f4f9f5]" : "bg-white group-hover:bg-[#f9fafb]"}`}>
                      <div className="flex items-center justify-start gap-1">
                        {actions
                          .filter((a) => !a.show || a.show(item))
                          .map((action) => (
                            <button
                              key={action.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:scale-105 ${action.variant === "danger"
                                  ? "text-[#dc2626] hover:bg-[#fef2f2]"
                                  : action.variant === "success"
                                    ? "text-[#0c831f] hover:bg-[#e8f5e9]"
                                    : action.variant === "warning"
                                      ? "text-[#d97706] hover:bg-[#fffbeb]"
                                      : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                                }`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total && total > pageSize && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pagination-responsive">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="rounded-lg border border-[#e8e8e8] bg-white px-2 py-1 text-xs font-bold text-[#1a1a1a] outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs text-[#666]">
              {total} results
            </span>
            <button
              disabled={!page || page <= 1}
              onClick={() => onPageChange?.((page || 1) - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[60px] text-center text-xs font-bold text-[#1a1a1a]">
              {page || 1} of {totalPages}
            </span>
            <button
              disabled={!page || page >= totalPages}
              onClick={() => onPageChange?.((page || 1) + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

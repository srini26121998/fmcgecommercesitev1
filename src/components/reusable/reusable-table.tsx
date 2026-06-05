"use client";

import React, { useMemo } from "react";
import type { Column, TableAction, TableBulkAction, PaginationState } from "@/types/products";

const pageSizeOptions = [10, 25, 50, 100];

interface ReusableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (key: string, order: "asc" | "desc") => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  actions?: TableAction<T>[];
  bulkActions?: TableBulkAction[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  compact?: boolean;
}

export default function ReusableTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortKey,
  sortOrder,
  selectedIds = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  className = "",
  compact = false,
}: ReusableTableProps<T>) {
  const allSelected = useMemo(
    () => data.length > 0 && selectedIds.length === data.length,
    [data, selectedIds]
  );

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((item) => keyExtractor(item)));
    }
  };

  const toggleItem = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    onSort(key, newOrder);
  };

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-xl border border-[#e8e8e8] bg-white ${className}`}>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-4 rounded bg-[#f0f0f0]" />
              <div className="h-10 flex-1 rounded-lg bg-[#f0f0f0]" />
              <div className="h-10 w-20 rounded-lg bg-[#f0f0f0]" />
              <div className="h-10 w-20 rounded-lg bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-[#e8e8e8] bg-white ${className}`}>
        <div className="w-16 h-16 rounded-full bg-[#f2f2f2] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-lg font-bold text-[#1a1a1a]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-[#e8e8e8] bg-white ${className}`}>
      <div className="overflow-x-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#ccc transparent" }}>
        <table className="w-full admin-table-responsive">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-[#f9fafb]">
              {onSelectionChange && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[#d0d0d0] text-[#0c831f] focus:ring-[#0c831f]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-${col.align || "left"} ${
                    compact ? "text-[10px]" : "text-xs"
                  } font-black uppercase tracking-wide text-[#666] ${
                    col.hideOnMobile ? "hidden md:table-cell" : ""
                  }`}
                  style={{ width: col.width }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-[#1a1a1a] transition-colors"
                    >
                      {col.header}
                      {sortKey === col.key && (
                        <svg className={`w-3 h-3 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);
              return (
                <tr
                  key={id}
                  className={`border-b border-[#e8e8e8] transition-colors ${
                    isSelected ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {onSelectionChange && (
                    <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(id)}
                        className="h-4 w-4 rounded border-[#d0d0d0] text-[#0c831f] focus:ring-[#0c831f]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      data-label={col.header}
                      className={`px-3 ${compact ? "py-2.5" : "py-3"} text-sm ${
                        col.hideOnMobile ? "hidden md:table-cell" : "flex md:table-cell"
                      }`}
                    >
                      {col.render ? col.render(item) : (item[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e8e8e8] bg-[#f9fafb] px-4 py-3 pagination-responsive">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <span>Show</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="rounded-lg border border-[#e8e8e8] bg-white px-2 py-1 text-xs font-semibold text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#0c831f]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>
              of {pagination.total} items
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#666] hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from(
              { length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) },
              (_, i) => {
                const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      pagination.page === pageNum
                        ? "bg-[#0c831f] text-white"
                        : "text-[#666] hover:bg-[#f0f0f0]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
            <button
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#666] hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

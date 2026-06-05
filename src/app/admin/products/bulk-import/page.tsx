"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, RefreshCw, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useBulkUpload } from "@/hooks/use-products";

export default function BulkImportPage() {
  const { records, loading, uploading, error, fetchHistory, uploadFile, downloadTemplateFile } = useBulkUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const result = await uploadFile(file);
      if (result) {
        toast.success(`Import started ₹ Job ID: ${result.jobId}`);
      } else {
        toast.error("Upload failed");
      }
    }
  };

  const handleFileSelect = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await uploadFile(file);
        if (result) {
          toast.success(`Import started ₹ Job ID: ${result.jobId}`);
        } else {
          toast.error("Upload failed");
        }
      }
    };
    input.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Bulk Import</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Import products in bulk using CSV or Excel files. Download the template to get started. {records.length} previous imports.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Upload */}
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-black text-[#1a1a1a]">Upload File</h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={handleFileSelect}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver ? "border-[#0c831f] bg-[#e8f5e9]" : "border-[#d0d0d0] hover:border-[#0c831f]/40"
              } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
                  <p className="mt-3 text-sm font-bold text-[#1a1a1a]">Uploading & processing...</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5e9]">
                    {dragOver ? (
                      <Upload className="h-6 w-6 text-[#0c831f] animate-bounce" />
                    ) : (
                      <Upload className="h-6 w-6 text-[#0c831f]" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#1a1a1a]">
                    {dragOver ? "Drop your file here" : "Drop your file here or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-[#999]">Supports .csv, .xlsx, .xls</p>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-black text-[#1a1a1a]">Instructions</h3>
              <div className="space-y-3">
                {[
                  { icon: Download, text: "Download the template file below", color: "text-[#2563eb]" },
                  { icon: FileSpreadsheet, text: "Fill in product details (name, SKU, price, stock, etc.)", color: "text-[#0c831f]" },
                  { icon: AlertTriangle, text: "Ensure SKUs are unique and required fields are filled", color: "text-[#d97706]" },
                  { icon: CheckCircle, text: "Upload the completed file and review the preview", color: "text-[#9333ea]" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f7f6]">
                      <step.icon className={`h-4 w-4 ${step.color}`} />
                    </div>
                    <span className="text-sm text-[#666]">{step.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  toast.info("Downloading template...");
                  const success = await downloadTemplateFile();
                  if (success) {
                    toast.success("Template downloaded successfully");
                  } else {
                    toast.error("Failed to download template");
                  }
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e8e8] bg-white py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6] transition-all"
              >
                <Download className="h-4 w-4" />
                Download Template (.xlsx)
              </button>
            </div>

            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-black text-[#1a1a1a]">Recent Imports</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#0c831f]" />
                  <span className="ml-2 text-sm text-[#666]">Loading history...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-6 w-6 text-[#ccc]" />
                  <p className="mt-1 text-xs text-[#999]">No imports yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {records.map((imp) => (
                    <div key={imp.id} className="flex items-center justify-between rounded-xl bg-[#f9fafb] p-3 transition-all hover:shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{imp.fileName}</p>
                        <p className="text-xs text-[#999]">
                          {new Date(imp.uploadedAt).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold ${
                          imp.status === "completed"
                            ? "text-[#0c831f]"
                            : imp.status === "processing"
                            ? "text-[#d97706]"
                            : "text-[#dc2626]"
                        }`}
                      >
                        {imp.status === "completed" ? (
                          <><CheckCircle className="h-3.5 w-3.5" /> Completed</>
                        ) : imp.status === "processing" ? (
                          <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing</>
                        ) : (
                          <><AlertTriangle className="h-3.5 w-3.5" /> Failed</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


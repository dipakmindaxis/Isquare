import React, { useState, useRef, useMemo } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Search,

  Check,

  Package,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductImportRow, ProductImportResult } from "../models/quotationModels";
import { productImportService, parseProductWorkbook } from "../services/productImportService";
import { downloadProductExcelTemplate } from "../utils/productExcelTemplate";
import { formatINR } from "../utils/quotationCalculations";

interface ProductExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  existingProducts: Product[];
}

export const ProductExcelImportModal: React.FC<ProductExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingProducts,
}) => {
  const [step, setStep] = useState<"upload" | "preview" | "summary">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const [parsedRows, setParsedRows] = useState<ProductImportRow[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "valid" | "error">("all");
  const [previewSearch, setPreviewSearch] = useState<string>("");
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set of existing item codes from database for fast duplicate checking
  const existingCodeSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of existingProducts) {
      if (!p.isDeleted && p.itemCode && p.itemCode.trim()) {
        set.add(p.itemCode.trim().toLowerCase());
      }
    }
    return set;
  }, [existingProducts]);



  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setParsedRows([]);
    setImportResult(null);
    setFilterMode("all");
    setPreviewSearch("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Parse Excel file client-side
  const processExcelFile = async (file: File) => {
    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      toast.error("Invalid file format. Please upload an .xlsx or .xls Excel file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const { rows: extracted, sheetName: matchedSheetName } = await parseProductWorkbook(file, existingCodeSet);
      setParsedRows(extracted);
      setStep("preview");
      toast.success(`Parsed ${extracted.length} records from '${matchedSheetName}'`);
    } catch (err: any) {
      console.error("Error parsing Excel:", err);
      toast.error(err?.message || "Failed to parse Excel file");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  };

  // Filtering for preview table
  const validCount = useMemo(() => parsedRows.filter((r) => r.isValid).length, [parsedRows]);
  const errorCount = useMemo(() => parsedRows.filter((r) => !r.isValid).length, [parsedRows]);

  const filteredPreviewRows = useMemo(() => {
    let list = parsedRows;
    if (filterMode === "valid") list = list.filter((r) => r.isValid);
    if (filterMode === "error") list = list.filter((r) => !r.isValid);

    if (previewSearch.trim()) {
      const q = previewSearch.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          (r.itemCode && r.itemCode.toLowerCase().includes(q)) ||
          (r.brand && r.brand.toLowerCase().includes(q)) ||
          (r.hsnCode && r.hsnCode.toLowerCase().includes(q))
      );
    }

    return list;
  }, [parsedRows, filterMode, previewSearch]);

  // Execute bulk import
  const handleConfirmImport = async () => {
    if (validCount === 0) {
      toast.error("There are no valid records to import.");
      return;
    }

    setIsImporting(true);
    try {
      let res: ProductImportResult;
      if (selectedFile) {
        try {
          // Attempt dedicated backend API import
          res = await productImportService.importExcel(selectedFile);
        } catch (backendErr) {
          console.warn("Dedicated Excel import endpoint not reachable, using bulk import fallback:", backendErr);
          // Fall back to server bulk import endpoint or sequential creation
          try {
            res = await productImportService.bulkImport(parsedRows.filter((r) => r.isValid));
          } catch (bulkErr) {
            console.warn("Bulk import endpoint not reachable, using standard API creation:", bulkErr);
            res = await productImportService.fallbackImportSequential(parsedRows);
          }
        }
      } else {
        res = await productImportService.bulkImport(parsedRows.filter((r) => r.isValid));
      }

      setImportResult(res);
      setStep("summary");
      if (res.successCount > 0) {
        toast.success(`Successfully imported ${res.successCount} products!`);
        onImportSuccess();
      } else {
        toast.error("Import completed with 0 saved products. Please review errors.");
      }
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      toast.error("Failed to complete Excel import: " + (err?.message || "Server error"));
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#00234a]">
                Import Products via Excel
              </h3>
              <p className="text-xs text-gray-500">
                Bulk create enterprise product catalog records using an Excel spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* STEP 1: FILE UPLOAD */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Template Download Card */}
              <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/50 border border-emerald-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#00234a]">
                      Download Excel Template
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Use the pre-configured template with standardized column headers, valid units of measurement, and sample safety equipment products.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadProductExcelTemplate()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                >
                  <Download size={14} />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isDragOver
                    ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                    : "border-gray-300 hover:border-emerald-400 hover:bg-slate-50/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                  {isParsing ? (
                    <RefreshCw size={26} className="animate-spin text-emerald-600" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>

                <p className="text-sm font-bold text-[#00234a]">
                  {isParsing
                    ? "Reading and validating Excel file..."
                    : "Drag and drop your Excel file here, or click to browse"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: <span className="font-semibold text-gray-700">.xlsx</span>, <span className="font-semibold text-gray-700">.xls</span> (Max file size: 100MB)
                </p>
              </div>

              {/* Supported Columns Guide */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs text-gray-600 space-y-2">
                <div className="font-bold text-[#00234a] flex items-center gap-1.5">
                  <Package size={14} className="text-[#FF7900]" />
                  <span>Supported Product Master Fields</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px] pt-1">
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    <strong className="text-emerald-700">Product Name *</strong> (Required)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    <strong className="text-emerald-700">Standard Rate *</strong> (Required)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    <strong className="text-emerald-700">GST Rate *</strong> (e.g. 18%)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Item Code (Auto PRD-XXX)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Brand / Manufacturer
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Technical Specification
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    HSN Code (e.g. 650610)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Default UOM (Nos, Pcs, Set, Mtr)
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Purchase Rate
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Profit %
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Stock Quantity
                  </span>
                  <span className="p-1.5 bg-white rounded-md border border-gray-200">
                    Product Image URL
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION TABLE */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Header Stats & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      filterMode === "all"
                        ? "bg-[#00234a] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("valid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      filterMode === "valid"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Valid ({validCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("error")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      filterMode === "error"
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>Errors / Duplicates ({errorCount})</span>
                  </button>
                </div>

                {/* Search in preview */}
                <div className="relative min-w-[220px]">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Search in preview..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[46vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-[#00234a] sticky top-0 z-10 font-bold border-b border-gray-200 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">#</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Item Code</th>
                      <th className="py-2.5 px-3 whitespace-nowrap min-w-[180px]">Product Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Brand</th>
                      <th className="py-2.5 px-3 whitespace-nowrap min-w-[160px]">Specification</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">HSN Code</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">UOM</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Std Rate</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">GST %</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Purchase Rate</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Profit %</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPreviewRows.length > 0 ? (
                      filteredPreviewRows.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={`hover:bg-slate-50/80 transition ${
                            !row.isValid ? "bg-red-50/30" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 font-semibold text-gray-500">
                            {row.rowIndex}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                <Check size={12} />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <div className="group relative inline-block">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 cursor-help">
                                  <AlertCircle size={12} />
                                  <span>Error</span>
                                </span>
                                <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 z-20 w-64 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none">
                                  {row.validationErrors.map((err, idx) => (
                                    <div key={idx} className="text-red-300">
                                      • {err}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-gray-700 whitespace-nowrap">
                            {row.itemCode || <span className="text-gray-400 italic">(Auto)</span>}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#00234a]">
                            {row.productName}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                            {row.brand || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 truncate max-w-[200px]" title={row.specification}>
                            {row.specification || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-700 whitespace-nowrap">
                            {row.hsnCode || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                            {row.defaultUom || "Nos"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#00234a] whitespace-nowrap">
                            {formatINR(row.standardRate)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-700 whitespace-nowrap">
                            {row.gstRate}%
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-700 whitespace-nowrap">
                            {row.purchaseRate != null ? formatINR(row.purchaseRate) : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-700 whitespace-nowrap">
                            {row.profitPercentage != null ? `${row.profitPercentage}%` : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                            {row.stock != null ? row.stock : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-gray-400">
                          No matching records found in preview.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Error Notice if any */}
              {errorCount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                  <span>
                    <strong>{errorCount} record(s)</strong> have validation errors or duplicate item codes and will be skipped. Only the <strong>{validCount} valid record(s)</strong> will be imported.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUMMARY RESULT */}
          {step === "summary" && importResult && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-bold text-[#00234a]">
                  Excel Import Finished
                </h4>
                <p className="text-xs text-gray-500">
                  {importResult.message || "Product catalog batch processing has completed."}
                </p>
              </div>

              {/* Statistics Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <span className="text-xs text-gray-500 block font-semibold">Total Records</span>
                  <span className="text-2xl font-bold text-[#00234a] mt-1 block">
                    {importResult.totalRecords}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="text-xs text-emerald-700 block font-semibold">Successfully Saved</span>
                  <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                    {importResult.successCount}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <span className="text-xs text-amber-700 block font-semibold">Duplicates Skipped</span>
                  <span className="text-2xl font-bold text-amber-700 mt-1 block">
                    {importResult.duplicateCount}
                  </span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <span className="text-xs text-red-700 block font-semibold">Failed Records</span>
                  <span className="text-2xl font-bold text-red-700 mt-1 block">
                    {importResult.failedCount}
                  </span>
                </div>
              </div>

              {/* Error Details Table if errors exist */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-4 py-2.5 border-b border-red-200 font-bold text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>Error Details Breakdown ({importResult.errors.length})</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Row</th>
                          <th className="py-2 px-3">Item Code</th>
                          <th className="py-2 px-3">Product Name</th>
                          <th className="py-2 px-3">Error Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importResult.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-red-50/20">
                            <td className="py-2 px-3 font-mono font-semibold text-gray-500">
                              #{err.rowNumber}
                            </td>
                            <td className="py-2 px-3 font-mono text-gray-700">
                              {err.itemCode || "-"}
                            </td>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              {err.productName || "-"}
                            </td>
                            <td className="py-2 px-3 text-red-600 font-medium">
                              {err.errorMessage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          {step === "upload" && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                <Upload size={14} />
                <span>Select Excel File</span>
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Change File
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={validCount === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className={`inline-flex items-center gap-2 px-5 py-2 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                    validCount > 0 && !isImporting
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-400 cursor-not-allowed opacity-70"
                  }`}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Importing Records...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Confirm & Import ({validCount} Records)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === "summary" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-[#00234a] hover:bg-[#001833] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductExcelImportModal;


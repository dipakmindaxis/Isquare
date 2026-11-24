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
  Image as ImageIcon,
  FolderArchive,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductImportRow, ProductImportResult } from "../models/quotationModels";
import { productImportService, parseProductWorkbook } from "../services/productImportService";
import { downloadProductExcelTemplate } from "../utils/productExcelTemplate";
import { resolveImageUrl } from "../services/quotationService";

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
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentSheetName, setCurrentSheetName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isZipDragOver, setIsZipDragOver] = useState<boolean>(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleZipFileSelected = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".zip") {
      toast.error("Invalid file format. Please upload a .zip file containing product images.");
      if (zipInputRef.current) zipInputRef.current.value = "";
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.error("ZIP file size exceeds 200MB limit. Please upload a smaller ZIP archive.");
      if (zipInputRef.current) zipInputRef.current.value = "";
      return;
    }

    setZipFile(file);
    toast.success(`Attached product images ZIP: ${file.name}`);

    // If Excel file is already selected, both files are selected -> automatically proceed to preview!
    if (selectedFile) {
      setTimeout(() => {
        processExcelFile(selectedFile);
      }, 300);
    }
  };

  const handleExcelFileSelected = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      toast.error("Invalid file format. Please upload an .xlsx or .xls Excel file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    toast.success(`Attached Excel catalog: ${file.name}`);

    // If ZIP file is already selected, both files are selected -> automatically proceed to preview!
    if (zipFile) {
      setTimeout(() => {
        processExcelFile(file);
      }, 300);
    }
  };

  const handleZipDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsZipDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleZipFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleZipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleZipFileSelected(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setZipFile(null);
    setParsedRows([]);
    setImportResult(null);
    setFilterMode("all");
    setPreviewSearch("");
    setAvailableSheets([]);
    setCurrentSheetName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processExcelFile = async (file: File, sheetNameToUse?: string) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      toast.error("Invalid file format. Please upload an .xlsx or .xls Excel file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const { rows: extracted, sheetName: matchedSheetName, availableSheets: sheets } =
        await parseProductWorkbook(file, existingProducts, sheetNameToUse);
      setAvailableSheets(sheets);
      setCurrentSheetName(matchedSheetName);
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

  const handleSheetChange = (newSheet: string) => {
    if (selectedFile) {
      processExcelFile(selectedFile, newSheet);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleExcelFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleExcelFileSelected(e.target.files[0]);
    }
  };

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
          res = await productImportService.importExcel(selectedFile, zipFile);
        } catch (backendErr) {
          console.warn("Dedicated Excel import failed, falling back to sequential/bulk import:", backendErr);
          const validRows = parsedRows.filter((r) => r.isValid);
          const hasExisting = validRows.some((r) => r.isExisting);
          if (hasExisting) {
            res = await productImportService.fallbackImportSequential(validRows);
          } else {
            try {
              res = await productImportService.bulkImport(validRows);
            } catch (bulkErr) {
              res = await productImportService.fallbackImportSequential(validRows);
            }
          }
        }
      } else {
        const validRows = parsedRows.filter((r) => r.isValid);
        res = await productImportService.bulkImport(validRows);
      }

      setImportResult(res);
      setStep("summary");
      toast.success(`Successfully imported ${res.successCount} product(s)!`);
      onImportSuccess();
    } catch (err: any) {
      console.error("Import execution failed:", err);
      toast.error(err?.message || "Failed to import products from Excel");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/60 text-[#FF7900] flex items-center justify-center shrink-0">
              <Download size={16} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Import Products via Excel
            </h3>
          </div>

          {/* Stepper indicator matching Reference Image */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {/* Step 1 */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                step === "upload"
                  ? "bg-[#FF7900] text-white font-semibold"
                  : "bg-emerald-600 text-white font-semibold"
              }`}
            >
              {step !== "upload" ? (
                <Check size={12} className="stroke-[3]" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
              )}
              <span>Upload Files</span>
            </div>

            <span className="text-gray-300 font-light">&rsaquo;</span>

            {/* Step 2 */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                step === "preview"
                  ? "bg-[#FF7900] text-white font-semibold"
                  : step === "summary"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-white border border-gray-200 text-gray-400 font-medium"
              }`}
            >
              {step === "summary" ? (
                <Check size={12} className="stroke-[3]" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "preview"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  2
                </span>
              )}
              <span>Preview &amp; Validate</span>
            </div>

            <span className="text-gray-300 font-light">&rsaquo;</span>

            {/* Step 3 */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                step === "summary"
                  ? "bg-[#FF7900] text-white font-semibold"
                  : "bg-white border border-gray-200 text-gray-400 font-medium"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === "summary"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                3
              </span>
              <span>Completed</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer self-end sm:self-auto"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* STEP 1: FILE UPLOAD */}
          {step === "upload" && (
            <div className="space-y-5">
              {/* Template Download Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7900] flex items-center justify-center border border-orange-200/50 shrink-0">
                    <Download size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Download Excel Template
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadProductExcelTemplate()}
                  className="border border-[#FF7900] text-[#FF7900] hover:bg-orange-50 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Download Template
                </button>
              </div>

              {/* Upload Grid: Excel File (Required) + Product Images ZIP (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Excel File Upload Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 pb-3">
                    <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={16} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">
                      Excel Catalog Spreadsheet <span className="text-red-500">*</span>
                    </h4>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 flex flex-col justify-between min-h-[160px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileSpreadsheet size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Ready
                          </span>
                          <p className="text-xs font-bold text-gray-900 truncate mt-1" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-emerald-200/60 mt-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                      className={`border border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${
                        isDragOver
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-gray-200 bg-[#fbfcfd]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
                        {isParsing ? (
                          <RefreshCw size={18} className="animate-spin text-blue-500" />
                        ) : (
                          <Upload size={18} />
                        )}
                      </div>
                      <p className="text-xs text-gray-700">
                        {isParsing ? (
                          "Reading Excel file..."
                        ) : (
                          <>
                            Drag &amp; drop Excel file or{" "}
                            <span className="font-semibold text-gray-900">Browse</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        (.xlsx, .xls)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Browse File
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Product Images ZIP Upload Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FolderArchive size={16} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Product Images ZIP File
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                                          </span>
                  </div>

                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleZipInputChange}
                    className="hidden"
                  />

                  {zipFile ? (
                    <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 flex flex-col justify-between min-h-[160px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FolderArchive size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Attached
                          </span>
                          <p className="text-xs font-bold text-gray-900 truncate mt-1" title={zipFile.name}>
                            {zipFile.name}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {formatFileSize(zipFile.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-blue-200/60 mt-3">
                        <button
                          type="button"
                          onClick={() => zipInputRef.current?.click()}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                        >
                          Change ZIP
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZipFile(null);
                            if (zipInputRef.current) zipInputRef.current.value = "";
                          }}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsZipDragOver(true);
                      }}
                      onDragLeave={() => setIsZipDragOver(false)}
                      onDrop={handleZipDrop}
                      className={`border border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${
                        isZipDragOver
                          ? "border-blue-500 bg-blue-50/40"
                          : "border-gray-200 bg-[#fbfcfd]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
                        <FolderArchive size={18} />
                      </div>
                      <p className="text-xs text-gray-700">
                        Drag &amp; drop ZIP file or{" "}
                        <span className="font-semibold text-gray-900">Browse</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        (.zip)
                      </p>
                      <button
                        type="button"
                        onClick={() => zipInputRef.current?.click()}
                        className="mt-3 px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Browse File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION TABLE */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Uploaded Files Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold shadow-2xs">
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>
                    {selectedFile
                      ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                      : "Catalog.xlsx"}
                  </span>
                </div>
                {zipFile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold shadow-2xs">
                    <FolderArchive size={15} className="text-amber-600" />
                    <span>{`${zipFile.name} (${formatFileSize(zipFile.size)})`}</span>
                  </div>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterMode === "all"
                        ? "bg-[#00234a] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("valid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      filterMode === "error"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>Errors / Duplicates ({errorCount})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {availableSheets.length > 1 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-700">Sheet:</span>
                      <select
                        value={currentSheetName}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="text-xs font-semibold text-[#FF7900] bg-transparent focus:outline-none cursor-pointer"
                      >
                        {availableSheets.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={previewSearch}
                      onChange={(e) => setPreviewSearch(e.target.value)}
                      placeholder="Search in preview..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7900]"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] text-[#00234a] sticky top-0 z-10 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap w-12 text-gray-700">#</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-gray-700">Item Code</th>
                      <th className="py-2.5 px-3 whitespace-nowrap min-w-[220px] text-gray-700">Product Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-gray-700">Brand</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-gray-700">HSN Code</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-gray-700">UOM</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right text-gray-700">Rate (₹)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPreviewRows.length > 0 ? (
                      filteredPreviewRows.map((row) => {
                        const resolvedImg = row.imageDataUrl || resolveImageUrl(row.productImage);
                        const rateDisplay =
                          typeof row.standardRate === "number"
                            ? row.standardRate.toFixed(2)
                            : row.standardRate || "0.00";

                        return (
                          <tr
                            key={row.rowIndex}
                            className={`hover:bg-slate-50/80 transition ${
                              !row.isValid ? "bg-red-50/20" : ""
                            }`}
                          >
                            <td className="py-2.5 px-3 font-medium text-gray-500">
                              {row.rowIndex}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-gray-700 whitespace-nowrap">
                              {row.itemCode || <span className="text-gray-400 italic">-</span>}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-gray-900">
                              <div className="flex items-center gap-2.5">
                                {resolvedImg ? (
                                  <img
                                    src={resolvedImg}
                                    alt={row.productName}
                                    className="w-7 h-7 object-contain rounded border border-gray-200 bg-white shrink-0 p-0.5"
                                  />
                                ) : null}
                                <span className="truncate max-w-[280px]" title={row.productName}>
                                  {row.productName}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                              {row.brand || "-"}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-700 whitespace-nowrap">
                              {row.hsnCode || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap uppercase">
                              {row.defaultUom || "EACH"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                              {rateDisplay}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-center">
                              {row.isValid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                                  Valid
                                </span>
                              ) : row.isExisting ? (
                                <div className="group relative inline-block">
                                  <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 cursor-help"
                                    title={row.validationErrors.join(" ")}
                                  >
                                    Duplicate
                                  </span>
                                  {row.validationErrors.length > 0 && (
                                    <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 z-20 w-64 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none text-left">
                                      {row.validationErrors.map((err, idx) => (
                                        <div key={idx} className="text-amber-300">
                                          • {err}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="group relative inline-block">
                                  <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 cursor-help"
                                    title={row.validationErrors.join(" ")}
                                  >
                                    Error
                                  </span>
                                  {row.validationErrors.length > 0 && (
                                    <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 z-20 w-64 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none text-left">
                                      {row.validationErrors.map((err, idx) => (
                                        <div key={idx} className="text-rose-300">
                                          • {err}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
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
                    <strong>{errorCount} record(s)</strong> have validation errors or duplicate product names and will be skipped. Only the <strong>{validCount} valid record(s)</strong> will be imported.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUMMARY RESULT */}
          {step === "summary" && importResult && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-3">
                  Excel Import Finished
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {importResult.successCount} products imported successfully into Product Master.
                </p>
              </div>

              {/* 5 Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                <div className="bg-[#f0f7ff] border border-sky-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                    <Package size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Total Records</span>
                  <span className="text-2xl font-bold text-sky-600 mt-1">
                    {importResult.totalRecords}
                  </span>
                </div>

                <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Imported</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1">
                    {importResult.successCount}
                  </span>
                </div>

                <div className="bg-[#fffbeb] border border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                    <FileSpreadsheet size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Duplicates</span>
                  <span className="text-2xl font-bold text-amber-500 mt-1">
                    {importResult.duplicateCount}
                  </span>
                </div>

                <div className="bg-[#fef2f2] border border-rose-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                    <AlertCircle size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Failed</span>
                  <span className="text-2xl font-bold text-rose-500 mt-1">
                    {importResult.failedCount}
                  </span>
                </div>

                <div className="bg-[#faf5ff] border border-purple-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                    <ImageIcon size={18} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Images Extracted</span>
                  <span className="text-2xl font-bold text-purple-600 mt-1">
                    {importResult.imagesExtracted ?? 0}
                  </span>
                </div>
              </div>

              {/* Missing Images Notice */}
              {importResult.missingImages && importResult.missingImages.length > 0 && (
                <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/50">
                  <div className="bg-amber-100/70 px-4 py-2 border-b border-amber-200 font-bold text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>Missing Images in ZIP ({importResult.missingImages.length})</span>
                  </div>
                  <div className="p-3 text-xs text-amber-900 space-y-1.5">
                    <p className="text-[11px] text-gray-600">
                      The following image filenames were referenced in Excel but were not found in the uploaded ZIP file. The products were created without images:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                      {importResult.missingImages.map((img, idx) => (
                        <span key={idx} className="font-mono text-[11px] bg-white border border-amber-300 px-2 py-0.5 rounded-md text-amber-800">
                          {img}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          {step === "upload" && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isParsing}
                onClick={() => selectedFile && processExcelFile(selectedFile)}
                className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer ${
                  selectedFile && !isParsing
                    ? "bg-[#FF7900] hover:bg-[#E66D00] text-white shadow-orange-500/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Validating Excel...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Preview</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change Files</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={validCount === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className={`inline-flex items-center gap-2 px-5 py-2 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                    validCount > 0 && !isImporting
                      ? "bg-[#FF7900] hover:bg-[#E66D00] shadow-orange-500/20"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Import ({validCount})</span>
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
                className="px-6 py-2 bg-[#FF7900] hover:bg-[#E66D00] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
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

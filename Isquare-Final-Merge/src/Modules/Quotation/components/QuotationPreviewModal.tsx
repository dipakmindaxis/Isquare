import React, { useState, useEffect } from "react";
import {
  Printer,
  FileText,
  Package,
  CheckCircle,
  RefreshCw,
  ShoppingCart,
  FileSpreadsheet,
  Download,
  Calendar,
  User,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR, calculateItemTotals } from "../utils/quotationCalculations";
import { exportQuotationToPdf, loadImageAsDataUrl } from "../utils/quotationExportPdf";
import { exportQuotationToCustomerExcel } from "../utils/quotationExportExcel";
import {
  isCustomerFormatQuotation,
  getCustomerQuotationFile,
  downloadOriginalCustomerQuotation,
} from "../utils/customerQuotationStorage";
import { resolveImageUrl, productService } from "../services/quotationService";

interface QuotationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  companyProfile?: CompanyProfile | null;
  customer?: Customer | null;
  onRequestApproval?: () => void;
  onCreateRevision?: () => void;
  onConvertToOrder?: () => void;
  isConvertingToOrder?: boolean;
}

function formatProposalDate(dateString?: string | null): string {
  if (!dateString) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseSpecificationBullets(spec?: string | null): string[] {
  if (!spec || !spec.trim()) return [];
  const lines = spec
    .split(/\r?\n|•/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "-");
  return lines;
}

export function findProductFromMaster(item: any, products: Product[]): Product | null {
  if (!products || products.length === 0) return null;
  const itemPid = item.productId ?? item.ProductId;
  const itemCode = (item.itemCode ?? item.ItemCode ?? "").trim().toLowerCase();
  const itemName = (item.itemName ?? item.ItemName ?? "").trim().toLowerCase();

  // 1. By Product ID
  if (itemPid != null && Number(itemPid) > 0) {
    const found = products.find((p) => Number(p.productId) === Number(itemPid));
    if (found) return found;
  }

  // 2. By Item Code
  if (itemCode) {
    const found = products.find(
      (p) => (p.itemCode || "").trim().toLowerCase() === itemCode
    );
    if (found) return found;
  }

  // 3. By Exact Item Name
  if (itemName) {
    const found = products.find(
      (p) => (p.productName || "").trim().toLowerCase() === itemName
    );
    if (found) return found;
  }

  // 4. By Substring Match (e.g. itemName contains productName or vice versa)
  if (itemName) {
    const found = products.find((p) => {
      const pName = (p.productName || "").trim().toLowerCase();
      if (!pName) return false;
      return itemName.includes(pName) || pName.includes(itemName);
    });
    if (found) return found;
  }

  return null;
}

export function getItemImageSource(item: any, products: Product[]): string | null {
  // 1. Direct on line item
  const direct =
    item.customImageUrl ||
    item.imageUrl ||
    item.image ||
    item.productImage ||
    item.productImagePath;
  if (direct && typeof direct === "string" && direct.trim()) {
    const resolved = resolveImageUrl(direct) || direct;
    if (resolved) return resolved;
  }

  // 2. Match with Product Master
  const matched = findProductFromMaster(item, products);
  if (matched) {
    const matchRaw =
      matched.imageUrl ||
      matched.productImage ||
      matched.productImagePath ||
      (matched as any).image;
    if (matchRaw && typeof matchRaw === "string" && matchRaw.trim()) {
      const resolved = resolveImageUrl(matchRaw) || matchRaw;
      if (resolved) return resolved;
    }
  }

  // 3. Local storage image cache fallback
  try {
    const raw = localStorage.getItem("isquare_product_images_cache_v1");
    if (raw) {
      const map = JSON.parse(raw);
      const candidates = [
        item.itemName,
        item.itemCode,
        item.productId != null ? String(item.productId) : null,
        matched?.productName,
        matched?.itemCode,
        matched?.productId != null ? String(matched.productId) : null,
      ].filter(Boolean) as string[];

      for (const key of candidates) {
        if (map[key]) return map[key];
        if (map[key.toLowerCase()]) return map[key.toLowerCase()];
      }

      const itemClean = (item.itemName || "").toLowerCase();
      for (const [k, v] of Object.entries(map)) {
        if (
          itemClean &&
          (itemClean.includes(k.toLowerCase()) || k.toLowerCase().includes(itemClean))
        ) {
          return v as string;
        }
      }
    }
  } catch {}

  return null;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  onClose,
  quotation,
  companyProfile,
  customer,
  onRequestApproval,
  onCreateRevision,
  onConvertToOrder,
  isConvertingToOrder = false,
}) => {
  const [showDiscount, setShowDiscount] = useState<boolean>(true);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({});

  // Pre-load Product Master and convert all images into base64 Data URLs
  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return;

    const loadMasterAndImages = async () => {
      let prods = masterProducts;
      if (prods.length === 0) {
        try {
          prods = await productService.getAll();
          if (isMounted) {
            setMasterProducts(prods);
          }
        } catch (err) {
          console.warn("Failed to load products for quotation preview:", err);
          prods = [];
        }
      }

      const map: Record<string, string> = {};
      for (const item of quotation.items || []) {
        const imgSource = getItemImageSource(item, prods);
        if (imgSource && !map[imgSource]) {
          try {
            const dataUrl = await loadImageAsDataUrl(imgSource);
            if (dataUrl) {
              map[imgSource] = dataUrl;
            }
          } catch {
            // keep raw source
          }
        }

        for (const acc of item.accessories || []) {
          const accImgSource = getItemImageSource(acc, prods);
          if (accImgSource && !map[accImgSource]) {
            try {
              const dataUrl = await loadImageAsDataUrl(accImgSource);
              if (dataUrl) {
                map[accImgSource] = dataUrl;
              }
            } catch {
              // keep raw source
            }
          }
        }
      }

      if (isMounted) {
        setResolvedImages((prev) => ({ ...prev, ...map }));
      }
    };

    loadMasterAndImages();
    return () => {
      isMounted = false;
    };
  }, [isOpen, quotation.items]);

  if (!isOpen) return null;

  const isUploadedCustomerFormat = isCustomerFormatQuotation(
    quotation.quotationId,
    quotation
  );
  const uploadedFileRecord = getCustomerQuotationFile(quotation.quotationId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      if (isUploadedCustomerFormat) {
        const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
        if (ok) {
          toast.success("Downloaded original customer quotation file");
          return;
        }
      }
      await exportQuotationToPdf(quotation, companyProfile, customer, showDiscount);
      toast.success("PDF exported successfully");
    } catch (e) {
      console.error("PDF export failed:", e);
      toast.error("Failed to generate PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      if (isUploadedCustomerFormat) {
        const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
        if (ok) {
          toast.success("Downloaded original customer quotation file");
          return;
        }
      }
      exportQuotationToCustomerExcel(quotation, showDiscount);
      toast.success("Excel exported successfully");
    } catch (e) {
      console.error("Excel export failed:", e);
      toast.error("Failed to generate Excel file");
    }
  };

  // Quotation Number
  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;

  // Customer Name & Address resolution
  const customerName =
    quotation.customerName ||
    customer?.companyName ||
    customer?.customerName ||
    "Samadhan";

  const customerAddress = (() => {
    if ((quotation as any).customerAddress) {
      return String((quotation as any).customerAddress).replace(/Mumbai/gi, "Pune");
    }
    if (customer?.addresses && customer.addresses.length > 0) {
      const primary = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
      const parts = [
        primary.address,
        primary.cityName,
        primary.stateName ? `${primary.stateName} - ${primary.pincode || ""}` : primary.pincode,
        "India",
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(", ").replace(/Mumbai/gi, "Pune");
    }
    if ((customer as any)?.address) {
      return ((customer as any).address as string).replace(/Mumbai/gi, "Pune");
    }
    return "123 Industrial Area, Andheri (E), Pune - 400093, Maharashtra, India";
  })();

  const contactPhone =
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    customer?.phone ||
    customer?.mobile ||
    "+91 98765 43210";

  const contactEmail =
    (quotation as any).contactEmail ||
    customer?.email ||
    customer?.emailAddress ||
    "samadhan@abc.com";

  const contactPerson =
    (quotation as any).contactPerson ||
    customer?.contactPerson ||
    (customer as any)?.contactPersonName ||
    (customer as any)?.contactName ||
    "Amit Joshi";

  // Commercial & freight terms formatting
  const freightType = (quotation as any).freightType;
  const freightDisplay =
    freightType && freightType !== "Custom value"
      ? freightType
      : quotation.freightCharges > 0
      ? `INR ${formatINR(quotation.freightCharges).replace("₹", "").trim()}`
      : "Inclusive";

  const installationType = (quotation as any).installationType;
  const installationDisplay =
    installationType && installationType !== "Custom value"
      ? installationType
      : quotation.installationCharges > 0
      ? `INR ${formatINR(quotation.installationCharges).replace("₹", "").trim()}`
      : "At your scope";

  const deliveryPeriodDisplay = quotation.deliveryPeriod || "2-3 Weeks";
  const otherDesc =
    (quotation as any).otherChargesDescription || "Standard Packaging & Handling";

  // Default validity date if none provided (30 days from quotationDate)
  const defaultValidUntil = (() => {
    const base = quotation.quotationDate ? new Date(quotation.quotationDate) : new Date();
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    return d.toISOString();
  })();

  // Commercial Terms list matching Reference Screenshot
  let termsList: string[] = [];
  if (quotation.termsAndConditions && quotation.termsAndConditions.trim()) {
    const customLines = quotation.termsAndConditions
      .split(/\r?\n/)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/Mumbai/gi, "Pune").trim())
      .filter(Boolean);
    termsList = customLines;
  } else {
    termsList = [
      "Taxes extra as applicable.",
      "Prices firm for validity period.",
      "Goods once sold will not be taken back.",
      "Subject to Pune Jurisdiction.",
    ];
  }

  const primaryGstRate = quotation.items?.[0]?.gstRate ?? 18;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-4 sm:my-8 flex flex-col max-h-[96vh] overflow-hidden print:shadow-none print:border-none print:my-0 print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        {/* Top Action Bar (hidden on print) */}
        <div className="p-3 sm:px-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-[#00234a] text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#FF7900] shrink-0" />
            <h3 className="font-bold text-sm tracking-tight text-white">
              Customer-Facing Quotation Format
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Show/Hide Discount Column Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-200 hover:text-white select-none bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 transition">
              <input
                type="checkbox"
                checked={showDiscount}
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF7900] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Show Discount Column</span>
            </label>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
              title="Export quotation to Excel (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition cursor-pointer"
              title="Export quotation to PDF (.pdf)"
            >
              <Download size={14} />
              <span>Export to PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FF7900] hover:bg-[#e06800] text-white shadow-xs transition cursor-pointer"
              title="Print quotation document"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Customer-Facing Quotation Sheet Body (matches Reference Screenshot) */}
        <div
          id="printableDocument"
          className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800 bg-white relative font-sans print:p-0 print:overflow-visible print:max-h-none"
          style={{ minHeight: "100%" }}
        >
          {/* Customer file notice banner (if uploaded format) */}
          {isUploadedCustomerFormat && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-900 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">
                    Customer-Formatted Quotation Document
                  </p>
                  <p className="text-[11px] text-amber-700">
                    File: {uploadedFileRecord?.fileName || "Original Customer Quotation.xlsx"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
                  if (ok) toast.success("Downloaded original file");
                  else toast.error("Original file could not be retrieved");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Download size={13} />
                <span>Download Original</span>
              </button>
            </div>
          )}

          {/* 1. Header Section: Corporate Branding & Slanted Navy Polygon */}
          <div className="relative flex justify-between items-start pb-1">
            {/* Top Left: iSQUARE Corporate Logo */}
            <div className="z-10 pt-1">
              <div className="flex items-center gap-3">
                {/* Flame Shield SVG Logo */}
                <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs">
                    {/* Shield outline */}
                    <path
                      d="M 50 6 L 86 21 L 86 65 C 86 92 50 115 50 115 C 50 115 14 92 14 65 L 14 21 Z"
                      fill="none"
                      stroke="#00234a"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    {/* Vibrant orange outer flame */}
                    <path
                      d="M 50 24 C 58 38 72 50 72 67 C 72 82 59 93 50 93 C 41 93 28 82 28 67 C 28 50 42 38 50 24 Z"
                      fill="#FF5500"
                    />
                    {/* Warm orange middle flame */}
                    <path
                      d="M 50 42 C 54 52 63 60 63 70 C 63 79 56 86 50 86 C 44 86 37 79 37 70 C 37 60 46 52 50 42 Z"
                      fill="#FF8C00"
                    />
                    {/* Bright yellow inner flame */}
                    <path
                      d="M 50 58 C 52 64 57 69 57 75 C 57 80 53 83 50 83 C 47 83 43 80 43 75 C 43 69 48 64 50 58 Z"
                      fill="#FFD700"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tight text-[#00234a] font-sans">
                      iSQUARE
                    </span>
                    <span className="text-xs font-bold text-[#FF5500]">®</span>
                  </div>
                  <p className="text-[9px] font-extrabold tracking-wider text-[#00234a] uppercase -mt-0.5">
                    SAFETY EQUIPMENTS PVT. LTD.
                  </p>
                  <p className="text-[10px] text-[#FF5500] italic font-serif mt-0.5">
                    The complete safety solution
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right: Angular Navy Polygon with Quotation Details matching Reference Screenshot */}
            <div className="relative shrink-0 w-72 sm:w-80">
              {/* Slanted orange accent stripe behind navy block */}
              <div
                className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-full h-32 bg-[#FF7900]"
                style={{ clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              />
              {/* Navy block with angular slant */}
              <div
                className="relative -top-6 -right-6 sm:-top-8 sm:-right-8 w-full h-30 bg-[#00234a] text-white pt-3 pb-3 pr-6 pl-14 sm:pl-16 flex flex-col justify-center items-start text-left"
                style={{ clipPath: "polygon(24% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-3.5 bg-[#FF7900] rounded-sm shrink-0" />
                  <span className="text-[11px] text-blue-200 tracking-wide font-semibold">
                    Quotation No.
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono mt-0.5">
                  {quotationNumber}
                </span>
                <div className="mt-2 space-y-1 text-[11px] text-blue-100 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-white shrink-0" />
                    <span className="text-blue-200 w-16">Date</span>
                    <span>:</span>
                    <span className="font-semibold text-white">{formatProposalDate(quotation.quotationDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-white shrink-0" />
                    <span className="text-blue-200 w-16">Valid Until</span>
                    <span>:</span>
                    <span className="font-semibold text-white">{formatProposalDate(quotation.validUntil || defaultValidUntil)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Orange Accent Bar matching Reference Screenshot */}
          <div className="mt-1 mb-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
              <span className="text-[#00234a]">Sales &amp; Commercial </span>
              <br className="sm:hidden" />
              <span className="text-[#FF7900]">Quotation Proposal</span>
            </div>
            <div className="h-1 bg-[#FF7900] w-64 sm:w-72 mt-2 rounded-full" />
          </div>

          {/* 2. Side-by-Side Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Customer / Bill To (Peach/Cream Card) */}
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-[#00234a]">
                    CUSTOMER / BILL TO
                  </span>
                </div>
                <h4 className="font-black text-sm text-[#00234a] uppercase tracking-tight">
                  {customerName}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  {customerAddress}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-[#FED7AA]/60 space-y-0.5 text-[11px] text-slate-700">
                {contactPhone && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone size={11} className="text-[#00234a] shrink-0" />
                    <span>{contactPhone}</span>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Mail size={11} className="text-[#00234a] shrink-0" />
                    <span>{contactEmail}</span>
                  </div>
                )}
                {contactPerson && (
                  <div className="font-semibold text-slate-800 pt-0.5">
                    Attn: {contactPerson}
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Commercial & Freight Terms (Ice Blue Card) */}
            <div className="bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#00234a] text-white flex items-center justify-center shrink-0">
                    <Truck size={13} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-[#00234a]">
                    COMMERCIAL &amp; FREIGHT TERMS
                  </span>
                </div>
                <div className="space-y-2 text-xs mt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium w-36">Freight Charges</span>
                    <span className="font-bold text-slate-800">:</span>
                    <span className="font-bold text-[#00234a]">{freightDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium w-36">Installation Charges</span>
                    <span className="font-bold text-slate-800">:</span>
                    <span className="font-bold text-[#00234a]">{installationDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium w-36">Delivery Period</span>
                    <span className="font-bold text-slate-800">:</span>
                    <span className="font-bold text-[#00234a]">{deliveryPeriodDisplay}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Product Table with Orange Header & Bullet Points */}
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FF7900] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 w-8 text-center border-r border-orange-400/50">#</th>
                  <th className="p-2 text-left border-r border-orange-400/50">Product Name &amp; Specification</th>
                  <th className="p-2 w-24 text-center border-r border-orange-400/50">Image</th>
                  <th className="p-2 w-20 text-center border-r border-orange-400/50">HSN Code</th>
                  <th className="p-2 w-12 text-center border-r border-orange-400/50">Qty</th>
                  <th className="p-2 w-12 text-center border-r border-orange-400/50">UOM</th>
                  <th className="p-2 w-20 text-center border-r border-orange-400/50">Rate (INR)</th>
                  {showDiscount && (
                    <th className="p-2 w-16 text-center border-r border-orange-400/50">Discount (%)</th>
                  )}
                  <th className="p-2 w-14 text-center border-r border-orange-400/50">GST (%)</th>
                  <th className="p-2 w-24 text-right pr-3">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-xs">
                {(quotation.items || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={showDiscount ? 10 : 9}
                      className="p-8 text-center text-slate-400"
                    >
                      No products added to this quotation.
                    </td>
                  </tr>
                ) : (
                  quotation.items!.map((item, idx) => {
                    const calc = calculateItemTotals(
                      item.quantity,
                      item.rate,
                      item.discountPercentage,
                      item.gstRate
                    );

                    // Robust image resolution checking direct item, master products, and cache
                    const matchedProd = findProductFromMaster(item, masterProducts);
                    const itemImg = getItemImageSource(item, masterProducts);
                    const resolvedDataUrl = itemImg ? resolvedImages[itemImg] : null;

                    const hsnCode =
                      item.hsnCode ||
                      (item as any).hsn ||
                      matchedProd?.hsnCode ||
                      (matchedProd as any)?.hsn ||
                      "—";

                    const specBullets = parseSpecificationBullets(
                      item.specification || matchedProd?.specification
                    );

                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-slate-50/50 transition border-b border-slate-300">
                          {/* 1. # */}
                          <td className="p-2.5 align-middle text-center font-semibold text-slate-700 border-r border-slate-300">
                            {idx + 1}
                          </td>

                          {/* 2. Product Name & Specification */}
                          <td className="p-2.5 align-middle border-r border-slate-300">
                            <div className="font-extrabold text-[#00234a] text-xs sm:text-[13px] leading-snug">
                              {item.itemName}
                              {item.brand ? ` (${item.brand})` : ""}
                            </div>
                            {specBullets.length > 0 && (
                              <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600 leading-tight">
                                {specBullets.map((bullet, bIdx) => (
                                  <li key={bIdx} className="flex items-start gap-1">
                                    <span className="text-[#FF7900] font-black text-xs shrink-0 leading-none mt-0.5">
                                      •
                                    </span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>

                          {/* 3. Image */}
                          <td className="p-2 align-middle text-center border-r border-slate-300">
                            <div className="h-20 w-20 flex items-center justify-center mx-auto overflow-hidden">
                              {itemImg ? (
                                <img
                                  src={resolvedDataUrl || itemImg}
                                  alt={item.itemName}
                                  className="max-h-20 max-w-[80px] object-contain drop-shadow-xs"
                                  crossOrigin="anonymous"
                                  loading="eager"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-1">
                                  <Package size={20} className="text-slate-300" />
                                  <span className="text-[9px] text-slate-400 mt-1">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. HSN Code */}
                          <td className="p-2.5 align-middle text-center font-mono text-[11px] text-slate-700 border-r border-slate-300">
                            {hsnCode}
                          </td>

                          {/* 5. Qty */}
                          <td className="p-2.5 align-middle text-center font-semibold text-slate-800 border-r border-slate-300">
                            {item.quantity}
                          </td>

                          {/* 6. UOM */}
                          <td className="p-2.5 align-middle text-center font-medium text-slate-600 border-r border-slate-300">
                            {item.unitName || "Nos"}
                          </td>

                          {/* 7. Rate (INR) */}
                          <td className="p-2.5 align-middle text-center font-medium text-slate-800 border-r border-slate-300">
                            {formatINR(item.rate)}
                          </td>

                          {/* 8. Discount (%) */}
                          {showDiscount && (
                            <td className="p-2.5 align-middle text-center text-slate-700 border-r border-slate-300">
                              {item.discountPercentage}%
                            </td>
                          )}

                          {/* 9. GST (%) */}
                          <td className="p-2.5 align-middle text-center font-semibold text-blue-600 border-r border-slate-300">
                            {item.gstRate}%
                          </td>

                          {/* 10. Total (INR) */}
                          <td className="p-2.5 align-middle text-right pr-3 font-bold text-slate-900">
                            {formatINR(calc.lineTotal)}
                          </td>
                        </tr>

                        {/* Accessories linked to parent item */}
                        {item.accessories &&
                          item.accessories.map((acc, aIdx) => {
                            const aCalc = calculateItemTotals(
                              acc.quantity,
                              acc.rate,
                              acc.discountPercentage,
                              acc.gstRate
                            );
                            const accMatched = findProductFromMaster(acc, masterProducts);
                            const accImg = getItemImageSource(acc, masterProducts);
                            const resolvedAccDataUrl = accImg ? resolvedImages[accImg] : null;

                            const accHsn =
                              acc.hsnCode ||
                              (acc as any).hsn ||
                              accMatched?.hsnCode ||
                              (accMatched as any)?.hsn ||
                              "—";

                            return (
                              <tr
                                key={`acc-${aIdx}`}
                                className="bg-slate-50/50 text-[11px] border-b border-slate-300"
                              >
                                <td className="p-2 align-middle text-center text-slate-400 border-r border-slate-300">
                                  ↳
                                </td>
                                <td className="p-2 pl-4 align-middle border-r border-slate-300">
                                  <span className="font-semibold text-slate-800">
                                    [Accessory] {acc.itemName}
                                  </span>
                                  {acc.specification && (
                                    <div className="text-slate-500 text-[10px] mt-0.5">
                                      {acc.specification}
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 align-middle text-center border-r border-slate-300">
                                  <div className="h-14 w-14 flex items-center justify-center mx-auto overflow-hidden">
                                    {accImg ? (
                                      <img
                                        src={resolvedAccDataUrl || accImg}
                                        alt={acc.itemName}
                                        className="max-h-14 max-w-[56px] object-contain"
                                        crossOrigin="anonymous"
                                      />
                                    ) : (
                                      <Package size={14} className="text-slate-300" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-2 align-middle text-center font-mono text-[10px] text-slate-600 border-r border-slate-300">
                                  {accHsn}
                                </td>
                                <td className="p-2 align-middle text-center font-semibold text-slate-800 border-r border-slate-300">
                                  {acc.quantity}
                                </td>
                                <td className="p-2 align-middle text-center font-medium text-slate-600 border-r border-slate-300">
                                  {acc.unitName || "Nos"}
                                </td>
                                <td className="p-2 align-middle text-center font-medium text-slate-800 border-r border-slate-300">
                                  {formatINR(acc.rate)}
                                </td>
                                {showDiscount && (
                                  <td className="p-2 align-middle text-center text-slate-600 border-r border-slate-300">
                                    {acc.discountPercentage}%
                                  </td>
                                )}
                                <td className="p-2 align-middle text-center font-bold text-blue-600 border-r border-slate-300">
                                  {acc.gstRate}%
                                </td>
                                <td className="p-2 align-middle text-right pr-3 font-bold text-slate-800">
                                  {formatINR(aCalc.lineTotal)}
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Bottom Section: Commercial Terms & Price Summary (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Left Column: Commercial Terms with Numbered Badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-white" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-[#00234a]">
                  COMMERCIAL TERMS
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                {termsList.map((term, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-[#FF7900] text-[#FF7900] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {tIdx + 1}
                    </div>
                    <span className="text-[11px] leading-snug">{term}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Price Summary Card & Two-Tone Grand Total Bar */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                    <Calculator size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-[#00234a]">
                    PRICE SUMMARY
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatINR(quotation.taxableAmount || quotation.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">
                      Total GST {primaryGstRate ? `(${primaryGstRate}%)` : ""}:
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatINR(quotation.taxAmount)}
                    </span>
                  </div>
                  {quotation.freightCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Freight Charges:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatINR(quotation.freightCharges)}
                      </span>
                    </div>
                  )}
                  {quotation.installationCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Installation Charges:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatINR(quotation.installationCharges)}
                      </span>
                    </div>
                  )}
                  {quotation.otherCharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{otherDesc}:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatINR(quotation.otherCharges)}
                      </span>
                    </div>
                  )}
                  {(quotation.charges || []).map((ch, cIdx) => (
                    <div key={cIdx} className="flex justify-between items-center">
                      <span className="text-slate-600">{ch.chargeName}:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatINR(ch.totalAmount || ch.chargeAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-Tone Grand Total Bar (Navy Left + Orange Right) */}
              <div className="mt-3 rounded-lg overflow-hidden flex shadow-xs">
                <div className="bg-[#00234a] text-white py-2 px-3.5 flex items-center w-1/2">
                  <span className="text-sm font-black tracking-tight">Grand Total:</span>
                </div>
                <div className="bg-[#FF7900] text-white py-2 px-3.5 flex items-center justify-end w-1/2">
                  <span className="text-base sm:text-lg font-black tracking-tight font-mono">
                    {formatINR(quotation.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Corporate Navy Footer Strip & Computer Disclaimer */}
          <div className="pt-2">
            <div className="bg-[#00234a] text-white rounded-md py-2 px-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-[11px] font-medium shadow-xs">
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#FF7900]" />
                <span>+91 9028815632</span>
              </div>
              <span className="text-blue-300/40">|</span>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-[#FF7900]" />
                <span>sales@isquaresafety.com</span>
              </div>
              <span className="text-blue-300/40">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#FF7900]" />
                <span>iSQUARE Safety Equipments Pvt. Ltd. Pune, Maharashtra, India</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1">
              <span>
                This is a computer-generated quotation from ISQUARE CRM and does not require a physical signature.
              </span>
              <span className="font-medium text-slate-500">Page 1 of 1</span>
            </div>
          </div>

          {/* Bottom right decorative orange corner wedge matching Reference Screenshot */}
          <div
            className="absolute -bottom-8 -right-8 w-24 h-16 bg-[#FF7900] pointer-events-none"
            style={{ clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)" }}
          />
        </div>

        {/* Modal Footer Workflow Actions (hidden on print) */}
        {(onCreateRevision || onRequestApproval || onConvertToOrder) && (
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Quotation ID: #{quotation.quotationId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onCreateRevision && (
                <button
                  type="button"
                  onClick={onCreateRevision}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <RefreshCw size={13} />
                  <span>Create Revision (+R)</span>
                </button>
              )}

              {onRequestApproval && (
                <button
                  type="button"
                  onClick={onRequestApproval}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <CheckCircle size={13} />
                  <span>Approval Workflow</span>
                </button>
              )}

              {onConvertToOrder && (
                <button
                  type="button"
                  onClick={onConvertToOrder}
                  disabled={isConvertingToOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60"
                >
                  <ShoppingCart size={13} />
                  <span>
                    {isConvertingToOrder
                      ? "Converting..."
                      : "Convert to Sales Order"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Print Media Styles for High-Fidelity A4 Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printableDocument, #printableDocument * {
            visibility: visible !important;
          }
          #printableDocument {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotationPreviewModal;

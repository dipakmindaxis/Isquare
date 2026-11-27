import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import type { Contact } from "../../RSM/Pages/Master/Contact/Types/ContactTypes";
import { getContactById, getContactsByCompanyId } from "../../RSM/Pages/Master/Contact/Services/ContactService";
import { formatINR, calculateItemTotals, hasQuotationDiscount } from "../utils/quotationCalculations";
import { exportQuotationToPdf, loadImageAsDataUrl } from "../utils/quotationExportPdf";
import { exportQuotationToCustomerExcel } from "../utils/quotationExportExcel";
import { ISQUARE_SEAL_BASE64 } from "../utils/isquareSealBase64";
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
  onUpdateFields?: (fields: { subject?: string; greeting?: string; introduction?: string }) => void;
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
  } catch { }

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
  onUpdateFields,
}) => {
  const hasDiscount = useMemo(() => hasQuotationDiscount(quotation), [quotation]);
  const [showDiscount, setShowDiscount] = useState<boolean>(hasDiscount);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({});
  const [contactRecord, setContactRecord] = useState<Contact | null>(null);

  const [editableSubject, setEditableSubject] = useState<string>(
    quotation.subject !== undefined && quotation.subject !== null
      ? quotation.subject
      : "Offer for PPP"
  );
  const [editableGreeting, setEditableGreeting] = useState<string>(
    quotation.greeting !== undefined && quotation.greeting !== null
      ? quotation.greeting
      : "Dear Sir/Madam,"
  );
  const [editableIntroduction, setEditableIntroduction] = useState<string>(
    quotation.introduction !== undefined && quotation.introduction !== null
      ? quotation.introduction
      : "We take pleasure in submitting our competitive offer for your requirement."
  );

  useEffect(() => {
    if (quotation.subject !== undefined && quotation.subject !== null) {
      setEditableSubject(quotation.subject);
    }
    if (quotation.greeting !== undefined && quotation.greeting !== null) {
      setEditableGreeting(quotation.greeting);
    }
    if (quotation.introduction !== undefined && quotation.introduction !== null) {
      setEditableIntroduction(quotation.introduction);
    }
  }, [quotation.subject, quotation.greeting, quotation.introduction, isOpen]);

  useEffect(() => {
    setShowDiscount(hasDiscount);
  }, [hasDiscount, isOpen]);

  // Resolve Contact Record using ContactService to ensure real contact data
  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return;

    const resolveContact = async () => {
      const contactId = (quotation as any).contactPersonId || (quotation as any).contactId;
      const compId = quotation.customerId || customer?.companyId || (customer as any)?.customerId;

      if (contactId && Number(contactId) > 0) {
        try {
          const c = await getContactById(Number(contactId));
          if (isMounted && c) {
            setContactRecord(c);
            return;
          }
        } catch {
          // ignore
        }
      }

      if (compId && Number(compId) > 0) {
        try {
          const contacts = await getContactsByCompanyId(Number(compId));
          if (isMounted && contacts.length > 0) {
            const targetName = (quotation as any).contactPerson || "";
            const matched = targetName
              ? contacts.find(
                (c) => (c.fullName || "").trim().toLowerCase() === targetName.trim().toLowerCase()
              ) || contacts[0]
              : contacts[0];
            setContactRecord(matched || null);
            return;
          }
        } catch {
          // ignore
        }
      }

      if (isMounted) {
        setContactRecord(null);
      }
    };

    resolveContact();
    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    (quotation as any).contactPersonId,
    (quotation as any).contactId,
    quotation.customerId,
    customer?.companyId,
    (customer as any)?.customerId,
    (quotation as any).contactPerson,
  ]);

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

  // Quotation Number
  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;

  // Company details resolution
  const companyName = companyProfile?.companyName || "iSQUARE Safety Equipments Pvt. Ltd.";
  const companyAddress = "GOYAL RESIDENCY B, SR NO. 434/4A, OFFICE, B1/13, Kasarwadi, Maharashtra 411034";
  const companyPhone = companyProfile?.phone || "+91 9028815632";
  const companyEmail = companyProfile?.email || "sales@isquaresafety.com";
  const companyGstin = companyProfile?.gstin || "27AARCP3435C1ZD";
  const companyPan = companyProfile?.pan || "AARCP3435C";

  // Customer Name & Address resolution
  const customerName =
    customer?.companyName ||
    (customer as any)?.company ||
    quotation.customerName ||
    customer?.customerName ||
    "Valued Client";

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
    return "";
  })();

  const contactPerson =
    (quotation as any).contactPerson ||
    contactRecord?.fullName ||
    customer?.contactPerson ||
    (customer as any)?.contactPersonName ||
    (customer as any)?.contactName ||
    "";

  const contactPhone =
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    contactRecord?.mobileNo ||
    contactRecord?.altMobileNo ||
    customer?.phone ||
    customer?.mobile ||
    "";

  const contactEmail =
    (quotation as any).contactEmail ||
    contactRecord?.emailAddress ||
    contactRecord?.altEmailAddress ||
    customer?.email ||
    customer?.emailAddress ||
    "";

  const handlePrint = async () => {
    const printableElement = document.getElementById("printableDocument");
    if (!printableElement) {
      window.print();
      return;
    }

    try {
      // 1. Wait for images inside printable document to fully load
      const images = Array.from(printableElement.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 2500);
          });
        })
      );

      // 1b. Synchronize live inputs and textareas to attributes so cloned DOM prints exact values
      printableElement.querySelectorAll("input").forEach((inp) => {
        inp.setAttribute("value", (inp as HTMLInputElement).value);
      });
      printableElement.querySelectorAll("textarea").forEach((txt) => {
        (txt as HTMLTextAreaElement).textContent = (txt as HTMLTextAreaElement).value;
      });

      // 2. Remove any previous print iframe
      const oldFrame = document.getElementById("quotationPrintFrame");
      if (oldFrame) {
        oldFrame.remove();
      }

      // 3. Create isolated iframe for clean native printing without UI/layout interference
      const printFrame = document.createElement("iframe");
      printFrame.id = "quotationPrintFrame";
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      printFrame.style.zIndex = "-9999";
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (!frameDoc || !printFrame.contentWindow) {
        window.print();
        return;
      }

      // 4. Collect stylesheets from parent document (Tailwind, fonts, etc.)
      let stylesHtml = "";
      document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
        stylesHtml += node.outerHTML;
      });

      // 5. Dedicated A4 print styling for exact colors, borders, and multi-page pagination
      const printSpecificCss = `
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 10mm 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 12px;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          #printableDocument {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          img {
            max-width: 100% !important;
            height: auto;
          }
        </style>
      `;

      frameDoc.open();
      frameDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${quotationNumber}_CustomerQuotation</title>
    ${stylesHtml}
    ${printSpecificCss}
  </head>
  <body class="bg-white text-slate-800 p-0 m-0">
    <div id="printableDocument" class="space-y-4 text-xs text-slate-800 bg-white">
      ${printableElement.innerHTML}
    </div>
  </body>
</html>`);
      frameDoc.close();

      // 6. Wait for all images inside iframe to be ready
      const frameImages = Array.from(frameDoc.querySelectorAll("img"));
      await Promise.all(
        frameImages.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 2500);
          });
        })
      );

      // 7. Trigger native browser Print dialog
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {
          console.warn("Iframe print error, falling back to window.print():", e);
          window.print();
        }
      }, 300);
    } catch (err) {
      console.warn("Print preparation failed, falling back to window.print():", err);
      window.print();
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdfQuote: Quotation = {
        ...quotation,
        subject: editableSubject,
        greeting: editableGreeting,
        introduction: editableIntroduction,
      };
      await exportQuotationToPdf(pdfQuote, companyProfile, customer, showDiscount, {
        contactPerson,
        contactPhone,
        contactEmail,
        customerAddress,
        masterProducts,
      });
      toast.success("PDF exported successfully");
    } catch (e) {
      console.error("PDF export failed:", e);
      toast.error("Failed to generate PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      if (isUploadedCustomerFormat) {
        const ok = downloadOriginalCustomerQuotation(quotation.quotationId);
        if (ok) {
          toast.success("Downloaded original customer quotation file");
          return;
        }
      }
      const excelQuote: Quotation = {
        ...quotation,
        subject: editableSubject,
        greeting: editableGreeting,
        introduction: editableIntroduction,
      };
      await exportQuotationToCustomerExcel(
        excelQuote,
        showDiscount,
        companyProfile,
        customer,
        masterProducts
      );
      toast.success("Excel exported successfully");
    } catch (e) {
      console.error("Excel export failed:", e);
      toast.error("Failed to generate Excel file");
    }
  };

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

  // Single-row calculated final amount matching Excel format (e.g. ₹699.74 for sample)
  const calculatedSubTotal = (() => {
    const itemsSum = (quotation.items || []).reduce((acc, item) => {
      const itemTot = calculateItemTotals(
        item.quantity,
        item.rate,
        item.discountPercentage,
        item.gstRate
      ).lineTotal;
      const accTot = (item.accessories || []).reduce((aAcc, acc) => {
        return aAcc + calculateItemTotals(
          acc.quantity,
          acc.rate,
          acc.discountPercentage,
          acc.gstRate
        ).lineTotal;
      }, 0);
      return acc + itemTot + accTot;
    }, 0);
    return itemsSum > 0 ? itemsSum : (quotation.grandTotal || quotation.taxableAmount || 0);
  })();

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
          className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800 bg-white relative print:p-0 print:overflow-visible print:max-h-none"
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

          {/* 1. Corporate Letterhead Header matching Reference */}
          <div className="border-b-2 border-[#FF7900] pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Left: iSQUARE Corporate Logo & Title */}
              <div className="flex items-center gap-3">
                {/* Flame Shield SVG Logo */}
                <div className="w-14 h-14 shrink-0 flex items-center justify-center">
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
                    <span className="text-2xl font-black tracking-tight text-[#00234a]">
                      iSQUARE
                    </span>
                    <span className="text-xs font-bold text-[#FF5500]">®</span>
                  </div>
                  <p className="text-[10px] font-extrabold tracking-wider text-[#00234a] uppercase -mt-0.5">
                    SAFETY EQUIPMENTS PVT. LTD.
                  </p>
                  <p className="text-[10px] text-[#FF5500] italic font-serif mt-0.5">
                    The complete safety solution
                  </p>
                </div>
              </div>

              {/* Right: Company Registered Address */}
              <div className="flex items-center gap-3 sm:gap-4 self-stretch sm:self-center justify-between sm:justify-end">
                <div className="text-right text-[10px] sm:text-[11px] text-[#64748B] space-y-0.5 max-w-xs sm:max-w-sm">
                  <p className="font-semibold text-[#102A50] leading-snug">
                    {companyAddress}
                  </p>
                  <p className="text-[#64748B]">
                    <span className="font-medium text-[#102A50]">Contact:</span> {companyPhone}
                    <span className="mx-1.5 text-slate-300">|</span>
                    <span className="font-medium text-[#102A50]">Email:</span> {companyEmail}
                  </p>
                  <p className="text-[#64748B] font-mono text-[10px]">
                    <span className="font-medium text-[#102A50]">GSTIN:</span> {companyGstin}
                    <span className="mx-1.5 text-slate-300">|</span>
                    <span className="font-medium text-[#102A50]">PAN:</span> {companyPan}
                  </p>
                </div>
              </div>
            </div>

            {/* Thin Orange Horizontal Separator below Header */}
            <div className="w-full border-b-2 border-[#FF7900] mt-3 mb-1"></div>
          </div>

          {/* Quotation Reference & Date Strip */}
          <div className="bg-[#F5F8FC] border border-[#D6E0EC] rounded-lg px-4 py-2 flex flex-wrap justify-between items-center text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#002B55]">Ref.:</span>
              <span className="font-black text-[#FF7900] tracking-wide text-sm">{quotationNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#102A50] font-medium">
              <Calendar size={13} className="text-[#FF7900] shrink-0" />
              <span className="text-[#64748B]">Date:</span>
              <span className="font-bold text-[#002B55]">{formatProposalDate(quotation.quotationDate)}</span>
            </div>
          </div>

          {/* 2. Customer Information Block */}
          <div className="bg-[#F5F8FC] border border-[#D6E0EC] rounded-xl p-4 text-xs text-[#102A50] space-y-1.5 shadow-2xs">
            <div className="font-bold text-[#64748B]">To,</div>
            <h4 className="font-black text-sm text-[#002B55] uppercase tracking-tight">
              {customerName}
            </h4>
            {customerAddress && (
              <p className="text-[11px] text-[#64748B] leading-snug">
                {customerAddress}
              </p>
            )}
            <div className="pt-1 space-y-1 text-[11px] text-[#102A50]">
              {contactPerson && (
                <div>
                  <span className="font-semibold text-[#002B55]">Kind Attn: </span>
                  <span className="font-medium text-[#102A50]">{contactPerson}</span>
                </div>
              )}
              {contactPhone && (
                <div>
                  <span className="font-semibold text-[#002B55]">Mob. No.: </span>
                  <span className="text-[#102A50]">{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div>
                  <span className="font-semibold text-[#002B55]">Email id: </span>
                  <span className="text-[#102A50]">{contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Subject Section: Highlighted Bar with Navy-Blue Label & Light Orange Background matching screenshot */}
          <div className="my-2.5 space-y-1.5 text-xs text-[#102A50]">
            {/* 1. Subject: Dark-blue SUB: label + light orange container with orange border */}
            <div>
              <div className="inline-flex items-center rounded-lg overflow-hidden border border-orange-200 bg-orange-50/80 shadow-2xs">
                <span className="bg-[#002B55] text-white font-extrabold px-3 py-1 text-xs tracking-wider uppercase select-none shrink-0">
                  SUB:
                </span>
                <input
                  type="text"
                  value={editableSubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditableSubject(val);
                    onUpdateFields?.({ subject: val });
                  }}
                  placeholder="Offer for PPP"
                  style={{ width: `${Math.max((editableSubject || "").length + 1, 14)}ch` }}
                  className="bg-transparent px-3.5 py-1 font-bold text-[#002B55] text-xs sm:text-[13px] tracking-wide outline-none border-none max-w-full"
                  title="Subject"
                />
              </div>
            </div>

            {/* 2. Greeting: Bold text */}
            <div className="pt-0.5">
              <input
                type="text"
                value={editableGreeting}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditableGreeting(val);
                  onUpdateFields?.({ greeting: val });
                }}
                placeholder="Dear Sir/Madam,"
                className="w-full bg-transparent font-bold text-[#002B55] text-xs sm:text-[13px] outline-none border-none p-0"
                title="Greeting"
              />
            </div>

            {/* 3. Introduction: Normal paragraph text with left indentation and spacing */}
            <div className="pl-4 sm:pl-5">
              <textarea
                rows={2}
                value={editableIntroduction}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditableIntroduction(val);
                  onUpdateFields?.({ introduction: val });
                }}
                placeholder="We take pleasure in submitting our competitive offer for your requirement."
                className="w-full bg-transparent text-[#64748B] text-[11px] sm:text-xs leading-relaxed outline-none resize-none border-none p-0"
                title="Introduction"
              />
            </div>
          </div>

          {/* 4. Product Table with Orange Header & Enterprise Theme */}
          <div className="border border-[#D6E0EC] rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FF7900] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 w-8 text-center border-r border-orange-400/50">SR. NO.</th>
                  <th className="p-2 text-left border-r border-orange-400/50">DESCRIPTION</th>
                  <th className="p-2 w-20 text-center border-r border-orange-400/50">IMAGE</th>
                  <th className="p-2 w-20 text-center border-r border-orange-400/50">HSN CODE</th>
                  <th className="p-2 w-14 text-center border-r border-orange-400/50">GST (%)</th>
                  <th className="p-2 w-12 text-center border-r border-orange-400/50">QTY</th>
                  <th className="p-2 w-12 text-center border-r border-orange-400/50">UOM</th>
                  <th className="p-2 w-20 text-center border-r border-orange-400/50">UNIT RATE (INR)</th>
                  {showDiscount && (
                    <th className="p-2 w-16 text-center border-r border-orange-400/50">DISCOUNT (%)</th>
                  )}
                  <th className="p-2 w-24 text-right pr-3">TOTAL AMOUNT (INR)</th>
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
                          <td className="p-2.5 align-middle text-center text-[11px] text-slate-700 border-r border-slate-300">
                            {hsnCode}
                          </td>

                          {/* 5. GST (%) */}
                          <td className="p-2.5 align-middle text-center font-semibold text-blue-600 border-r border-slate-300">
                            {item.gstRate}%
                          </td>

                          {/* 6. Qty */}
                          <td className="p-2.5 align-middle text-center font-semibold text-slate-800 border-r border-slate-300">
                            {item.quantity}
                          </td>

                          {/* 7. UOM */}
                          <td className="p-2.5 align-middle text-center font-medium text-slate-600 border-r border-slate-300">
                            {item.unitName || "Nos"}
                          </td>

                          {/* 8. Rate (INR) */}
                          <td className="p-2.5 align-middle text-center font-medium text-slate-800 border-r border-slate-300">
                            {formatINR(item.rate)}
                          </td>

                          {/* Discount (%) */}
                          {showDiscount && (
                            <td className="p-2.5 align-middle text-center text-slate-700 border-r border-slate-300">
                              {item.discountPercentage}%
                            </td>
                          )}

                          {/* Total (INR) */}
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
                                <td className="p-2 align-middle text-center text-[10px] text-slate-600 border-r border-slate-300">
                                  {accHsn}
                                </td>
                                <td className="p-2 align-middle text-center font-bold text-blue-600 border-r border-slate-300">
                                  {acc.gstRate}%
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

                {/* Sub Total row inside product table matching Excel-style client format */}
                {(quotation.items || []).length > 0 && (
                  <tr className="bg-[#F5F8FC] font-black border-t-2 border-[#D6E0EC]">
                    <td
                      colSpan={showDiscount ? 9 : 8}
                      className="p-2.5 text-right font-extrabold text-[#002B55] border-r border-[#D6E0EC] uppercase tracking-wider text-xs"
                    >
                      SUB TOTAL
                    </td>
                    <td className="p-2.5 text-right pr-3 font-black text-sm text-[#FF7900]">
                      {formatINR(calculatedSubTotal)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Bottom Section: Commercial Terms */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                <FileText size={14} className="text-white" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-[#002B55]">
                COMMERCIAL TERMS
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-[#102A50]">
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

          {/* 5. Closing Section matching Client Reference */}
          <div className="pt-2 text-xs text-[#102A50] space-y-1">
            <div className="font-semibold">Thanking you,</div>
            <div className="font-semibold">Yours faithfully,</div>
            <div className="font-bold text-[#002B55]">For {companyName}</div>

            {/* Circular Blue Company Stamp replacing Authorized Signatory */}
            <div className="pt-2 pb-1">
              <div className="w-24 h-24 shrink-0 flex items-center justify-start">
                <img
                  src={ISQUARE_SEAL_BASE64}
                  alt="iSQUARE Company Stamp"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Center-Aligned Contact Note */}
            <div className="text-center pt-3 pb-1 border-t border-[#D6E0EC] space-y-0.5">
              <p className="text-[11px] text-[#64748B]">
                Note: If you need any clarification or further assistance please feel free to contact
              </p>
              <p className="text-xs font-bold text-[#002B55]">
                Mr. Irfan Attar
              </p>
            </div>
          </div>

          {/* Page Counter (Clean and minimal) */}
          <div className="flex justify-end items-center text-[10px] text-[#64748B] pt-1 px-1">
            <span className="font-medium text-[#64748B]">Page 1 of 1</span>
          </div>
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
          html, body {
            background: white !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #root,
          #root > div,
          .h-screen,
          [class*="h-screen"],
          [class*="overflow-hidden"],
          [class*="overflow-y-auto"],
          main,
          .fixed,
          [class*="max-w-4xl"] {
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          aside,
          nav,
          header,
          .print\\:hidden,
          [class*="Sidebar"],
          [class*="Navbar"] {
            display: none !important;
          }
          #printableDocument {
            display: block !important;
            position: static !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          table {
            page-break-inside: auto;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotationPreviewModal;

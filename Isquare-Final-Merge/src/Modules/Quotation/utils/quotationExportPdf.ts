import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { calculateItemTotals } from "./quotationCalculations";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "./customerQuotationStorage";
import { resolveImageUrl, getProductImageCache, productService } from "../services/quotationService";

const PAGE_MARGIN = 14;
const FOOTER_SPACE = 14;

type QuotationPdfDetails = Quotation & {
  freightType?: string | null;
  installationType?: string | null;
  otherChargesDescription?: string | null;
};

type CustomerPdfDetails = Customer & {
  contactPerson?: string | null;
  contactPersonName?: string | null;
  email?: string | null;
  phone?: string | null;
};

type QuotationItemPdfDetails = NonNullable<Quotation["items"]>[number] & {
  hsn?: string | null;
  image?: string | null;
  productImage?: string | null;
  productImagePath?: string | null;
  customImageUrl?: string | null;
  imageUrl?: string | null;
};

function formatPdfNumber(value: number | null | undefined): string {
  return (Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function createRupeeMark(): string | null {
  const canvas = document.createElement("canvas");
  canvas.height = 96;
  let context = canvas.getContext("2d");
  if (!context) return null;
  context.font = "72px 'Segoe UI', Arial, sans-serif";
  canvas.width = Math.ceil(context.measureText("₹").width) + 8;
  context = canvas.getContext("2d");
  if (!context) return null;
  context.font = "72px 'Segoe UI', Arial, sans-serif";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#334155";
  context.fillText("₹", 2, 76);
  return canvas.toDataURL("image/png");
}

function drawCurrencyMark(
  doc: jsPDF,
  mark: string | null,
  x: number,
  baselineY: number,
  color: [number, number, number] = [51, 65, 85]
) {
  if (mark) {
    doc.addImage(mark, "PNG", x, baselineY - 2.7, 2.4, 2.7);
    return;
  }
  doc.setTextColor(...color);
  doc.text("INR", x, baselineY);
}

function findProductFromMaster(item: any, products: Product[]): Product | null {
  if (!products || products.length === 0) return null;
  const itemPid = item.productId ?? item.ProductId;
  const itemCode = (item.itemCode ?? item.ItemCode ?? "").trim().toLowerCase();
  const itemName = (item.itemName ?? item.ItemName ?? "").trim().toLowerCase();

  if (itemPid != null && Number(itemPid) > 0) {
    const found = products.find((p) => Number(p.productId) === Number(itemPid));
    if (found) return found;
  }
  if (itemCode) {
    const found = products.find(
      (p) => (p.itemCode || "").trim().toLowerCase() === itemCode
    );
    if (found) return found;
  }
  if (itemName) {
    const found = products.find(
      (p) => (p.productName || "").trim().toLowerCase() === itemName
    );
    if (found) return found;
  }
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

function getItemImageSource(item: any, products: Product[]): string | null {
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

/**
 * Robust asynchronous loader that resolves images as Data URLs.
 * 1. Checks if already a Data URL.
 * 2. Checks localStorage image cache.
 * 3. Tries fetch blob -> FileReader (avoids canvas taint).
 * 4. Falls back to Image + Canvas.
 */
export async function loadImageAsDataUrl(source?: string | null): Promise<string | null> {
  if (!source) return null;
  const trimmed = source.trim();
  if (!trimmed) return null;

  // 1. Direct Data URL
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 2. Check product image cache
  const cached = getProductImageCache(trimmed);
  if (cached) {
    return cached;
  }

  // 3. Try to fetch as Blob and convert via FileReader (avoids canvas taint)
  try {
    const response = await fetch(trimmed, { mode: "cors" });
    if (response.ok) {
      const blob = await response.blob();
      const readerResult = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
      if (readerResult) return readerResult;
    }
  } catch {
    // Continue to fallback
  }

  // 4. Fallback to Image element with Canvas
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const timeout = window.setTimeout(() => finish(null), 8000);
    const finish = (dataUrl: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(dataUrl);
    };

    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || 100;
        canvas.height = image.naturalHeight || 100;
        const context = canvas.getContext("2d");
        if (!context) {
          finish(null);
          return;
        }
        context.drawImage(image, 0, 0);
        finish(canvas.toDataURL("image/png"));
      } catch {
        finish(null);
      }
    };
    image.onerror = () => finish(null);
    image.src = trimmed;
  });
}

/**
 * Main PDF export function:
 * Captures #printableDocument directly when available in the DOM using html2canvas,
 * producing 100% parity with the preview modal and Reference Screenshot.
 * If not present in the DOM, falls back to the enhanced programmatic jsPDF autoTable.
 */
export async function exportQuotationToPdf(
  quotation: Quotation,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  showDiscount: boolean = true
) {
  if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
    const downloaded = downloadOriginalCustomerQuotation(quotation.quotationId);
    if (downloaded) return;
  }

  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;

  // If the rendered preview is available in the DOM, capture it directly
  const printableElement = document.getElementById("printableDocument");
  if (printableElement) {
    try {
      // 1. Wait for all preview images to finish loading
      const images = Array.from(printableElement.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            window.setTimeout(() => resolve(false), 2500);
          });
        })
      );

      // Temporarily unconstrain overflow to capture full document without scrollbar
      const origOverflow = printableElement.style.overflow;
      const origMaxHeight = printableElement.style.maxHeight;
      printableElement.style.overflow = "visible";
      printableElement.style.maxHeight = "none";

      // 2. High-DPI canvas capture
      const canvas = await html2canvas(printableElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: printableElement.scrollWidth || 794,
        height: printableElement.scrollHeight,
      });

      // Restore styling
      printableElement.style.overflow = origOverflow;
      printableElement.style.maxHeight = origMaxHeight;

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        let position = 0;
        let heightLeft = imgHeight;
        while (heightLeft > 0) {
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`${quotationNumber}_CustomerQuotation.pdf`);
      return;
    } catch (err) {
      console.warn("Direct HTML-to-PDF export failed, falling back to programmatic autoTable:", err);
    }
  }

  // Programmatic Fallback
  await generateProgrammaticPdf(quotation, companyProfile, customer, showDiscount);
}

/**
 * Programmatic jsPDF + autoTable generator that adheres to the Reference Screenshot styling:
 * Orange header [#FF7900], navy blue branding, side-by-side terms/summary, two-tone total,
 * correct image embedding from Product Master, and no "Image unavailable" text.
 */
async function generateProgrammaticPdf(
  quotation: Quotation,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  showDiscount: boolean = true
) {
  // Pre-load Master Products for fallback image & HSN resolution
  let masterProducts: Product[] = [];
  try {
    masterProducts = await productService.getAll();
  } catch {
    masterProducts = [];
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const rupeeMark = createRupeeMark();
  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;
  const customerName =
    quotation.customerName ||
    customer?.customerName ||
    customer?.companyName ||
    "Valued Customer";
  const quotationDetails = quotation as QuotationPdfDetails;
  const freightType = quotationDetails.freightType;
  const freightDisplay =
    freightType && freightType !== "Custom value"
      ? freightType
      : quotation.freightCharges > 0
      ? `INR ${formatPdfNumber(quotation.freightCharges)}`
      : "Inclusive";
  const installationType = quotationDetails.installationType;
  const installationDisplay =
    installationType && installationType !== "Custom value"
      ? installationType
      : quotation.installationCharges > 0
      ? `INR ${formatPdfNumber(quotation.installationCharges)}`
      : "At your scope";
  const otherChargesDescription =
    quotationDetails.otherChargesDescription || "Standard Packaging & Handling";

  doc.setProperties({ title: `${quotationNumber} Customer Quotation` });

  // 1. Company Branding (Left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 35, 74); // Corporate Navy #00234a
  doc.text(
    doc.splitTextToSize(
      companyProfile?.companyName || "ISQUARE SAFETY EQUIPMENTS PVT. LTD.",
      contentWidth * 0.55
    ),
    PAGE_MARGIN,
    18
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 121, 0); // Corporate Orange #FF7900
  doc.text("Sales & Commercial Quotation Proposal", PAGE_MARGIN, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  if (companyProfile?.gstin) {
    doc.text(
      `GSTIN: ${companyProfile.gstin}${companyProfile.pan ? ` | PAN: ${companyProfile.pan}` : ""}`,
      PAGE_MARGIN,
      29
    );
  }

  // 2. Quotation Info (Right side with Navy styling)
  doc.setFillColor(0, 35, 74); // Navy polygon simulation
  doc.roundedRect(pageWidth - PAGE_MARGIN - 65, 11, 65, 23, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text("Quotation No.", pageWidth - PAGE_MARGIN - 5, 16, { align: "right" });

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(quotationNumber, pageWidth - PAGE_MARGIN - 5, 21, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(239, 246, 255);
  const quotationDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  const validUntilDate = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  doc.text(`Date : ${quotationDate}`, pageWidth - PAGE_MARGIN - 5, 26, { align: "right" });
  doc.text(`Valid Until : ${validUntilDate}`, pageWidth - PAGE_MARGIN - 5, 30, { align: "right" });

  // Orange divider line
  doc.setDrawColor(255, 121, 0);
  doc.setLineWidth(0.8);
  doc.line(PAGE_MARGIN, 36, pageWidth - PAGE_MARGIN, 36);

  // 3. Info Cards (Side by Side)
  const infoTop = 40;
  const cardWidth = contentWidth / 2 - 3;
  const cardHeight = 28;

  // Left Card: Customer / Bill To (Peach #FFF7ED)
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE_MARGIN, infoTop, cardWidth, cardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 35, 74);
  doc.text("CUSTOMER / BILL TO", PAGE_MARGIN + 4, infoTop + 5);

  doc.setFontSize(9);
  doc.setTextColor(0, 35, 74);
  doc.text(doc.splitTextToSize(customerName, cardWidth - 8), PAGE_MARGIN + 4, infoTop + 10);

  const customerDetails = customer as CustomerPdfDetails | null | undefined;
  const contactPerson =
    quotation.contactPerson ||
    customerDetails?.contactPerson ||
    customerDetails?.contactPersonName;
  const contactPhone =
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    customerDetails?.phone ||
    customer?.mobile;
  const contactEmail =
    (quotation as any).contactEmail ||
    customerDetails?.email;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let cY = infoTop + 15;
  if (contactPerson) {
    doc.text(`Attn: ${contactPerson}`, PAGE_MARGIN + 4, cY);
    cY += 4;
  }
  if (contactPhone || contactEmail) {
    const contactLine = [contactPhone, contactEmail].filter(Boolean).join(" | ");
    doc.text(doc.splitTextToSize(contactLine, cardWidth - 8), PAGE_MARGIN + 4, cY);
  }

  // Right Card: Commercial & Freight Terms (Ice Blue #F0F7FF)
  const rightCardX = PAGE_MARGIN + cardWidth + 6;
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(rightCardX, infoTop, cardWidth, cardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 35, 74);
  doc.text("COMMERCIAL & FREIGHT TERMS", rightCardX + 4, infoTop + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Freight Charges     : ${freightDisplay}`, rightCardX + 4, infoTop + 11);
  doc.text(`Installation Charges: ${installationDisplay}`, rightCardX + 4, infoTop + 16);
  doc.text(
    `Delivery Period     : ${quotation.deliveryPeriod || "2-3 Weeks"}`,
    rightCardX + 4,
    infoTop + 21
  );

  // 4. Product Table with Orange Header
  const tableStartY = infoTop + cardHeight + 5;
  const headers = [
    "#",
    "Product Name & Specification",
    "Image",
    "HSN Code",
    "Qty",
    "UOM",
    "Rate (INR)",
    ...(showDiscount ? ["Discount (%)"] : []),
    "GST (%)",
    "Total (INR)",
  ];

  const rows: string[][] = [];
  const imageSources: Array<string | null> = [];

  (quotation.items || []).forEach((item, index) => {
    const itemDetails = item as QuotationItemPdfDetails;
    const totals = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );
    const description = [
      `${item.itemName}${item.brand ? ` (${item.brand})` : ""}`,
      item.specification || "",
    ]
      .filter(Boolean)
      .join("\n");

    const matchedProd = findProductFromMaster(item, masterProducts);
    const itemImage = getItemImageSource(item, masterProducts);
    const hsnCode =
      itemDetails.hsnCode ||
      itemDetails.hsn ||
      matchedProd?.hsnCode ||
      "-";

    rows.push([
      String(index + 1),
      description,
      "", // Clean empty string - NO "Image unavailable"
      hsnCode,
      String(item.quantity),
      item.unitName || "Nos",
      formatPdfNumber(item.rate),
      ...(showDiscount ? [`${item.discountPercentage}%`] : []),
      `${item.gstRate}%`,
      formatPdfNumber(totals.lineTotal),
    ]);
    imageSources.push(itemImage || null);

    (item.accessories || []).forEach((accessory) => {
      const accessoryDetails = accessory as QuotationItemPdfDetails;
      const accessoryTotals = calculateItemTotals(
        accessory.quantity,
        accessory.rate,
        accessory.discountPercentage,
        accessory.gstRate
      );
      const accMatched = findProductFromMaster(accessory, masterProducts);
      const accessoryImage = getItemImageSource(accessory, masterProducts);
      const accHsn =
        accessoryDetails.hsnCode ||
        accessoryDetails.hsn ||
        accMatched?.hsnCode ||
        "-";

      rows.push([
        "",
        `↳ [Accessory] ${accessory.itemName}${accessory.specification ? `\n${accessory.specification}` : ""}`,
        "",
        accHsn,
        String(accessory.quantity),
        accessory.unitName || "Nos",
        formatPdfNumber(accessory.rate),
        ...(showDiscount ? [`${accessory.discountPercentage}%`] : []),
        `${accessory.gstRate}%`,
        formatPdfNumber(accessoryTotals.lineTotal),
      ]);
      imageSources.push(accessoryImage || null);
    });
  });

  const embeddedImages = await Promise.all(imageSources.map(loadImageAsDataUrl));

  const fixedWidths = showDiscount
    ? [6, 18, 16, 10, 12, 20, 14, 12, 24]
    : [6, 18, 16, 10, 12, 22, 12, 26];
  const productColumnWidth = contentWidth - fixedWidths.reduce((sum, width) => sum + width, 0);
  const columnWidths = [fixedWidths[0], productColumnWidth, ...fixedWidths.slice(1)];
  const rateColumnIndex = 6;
  const totalColumnIndex = headers.length - 1;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_SPACE + 8 },
    head: [headers],
    body: rows.length
      ? rows
      : [["1", "No products added to this quotation.", "", "", "", "", "", ...(showDiscount ? [""] : []), "", ""]],
    theme: "grid",
    showHead: "everyPage",
    headStyles: {
      fillColor: [255, 121, 0], // Solid Vibrant Orange #FF7900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2.5,
      lineColor: [230, 100, 0],
      lineWidth: 0.15,
      halign: "center",
    },
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: columnWidths[0], halign: "center" },
      1: { cellWidth: columnWidths[1], valign: "top", fontStyle: "bold", textColor: [0, 35, 74] },
      2: { cellWidth: columnWidths[2], halign: "center" },
      3: { cellWidth: columnWidths[3], halign: "center" },
      4: { cellWidth: columnWidths[4], halign: "center" },
      5: { cellWidth: columnWidths[5], halign: "center" },
      [rateColumnIndex]: { cellWidth: columnWidths[rateColumnIndex], halign: "right" },
      ...(showDiscount
        ? {
            7: { cellWidth: columnWidths[7], halign: "center" as const },
            8: { cellWidth: columnWidths[8], halign: "center" as const },
            9: { cellWidth: columnWidths[9], halign: "right" as const },
          }
        : {
            7: { cellWidth: columnWidths[7], halign: "center" as const },
            8: { cellWidth: columnWidths[8], halign: "right" as const },
          }),
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const imageData = embeddedImages[data.row.index];
        if (imageData) {
          data.cell.text = [];
          const size = Math.min(15, data.cell.width - 2, data.cell.height - 2);
          doc.addImage(
            imageData,
            "PNG",
            data.cell.x + (data.cell.width - size) / 2,
            data.cell.y + (data.cell.height - size) / 2,
            size,
            size
          );
        } else {
          data.cell.text = [];
        }
        return;
      }
      if (
        data.section !== "body" ||
        (data.column.index !== rateColumnIndex && data.column.index !== totalColumnIndex) ||
        !rupeeMark
      ) {
        return;
      }
      const text = String(data.cell.text[0] || "");
      if (!text.trim()) return;
      const rightEdge = data.cell.x + data.cell.width - 2;
      const textWidth = doc.getTextWidth(text);
      drawCurrencyMark(doc, rupeeMark, rightEdge - textWidth - 2.5, data.cell.y + data.cell.height / 2 + 1);
    },
  });

  const finalTableY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  let y = (finalTableY || tableStartY) + 6;

  // 5. Bottom Section: Side-by-Side Commercial Terms & Price Summary
  const summaryBoxWidth = contentWidth * 0.48;
  const summaryX = pageWidth - PAGE_MARGIN - summaryBoxWidth;



  let defaultTerms: string[] = [];
  if (quotation.termsAndConditions && quotation.termsAndConditions.trim()) {
    const customLines = quotation.termsAndConditions
      .split(/\r?\n/)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/Mumbai/gi, "Pune").trim())
      .filter(Boolean);
    defaultTerms = customLines;
  } else {
    defaultTerms = [
      "Taxes extra as applicable.",
      "Prices firm for validity period.",
      "Goods once sold will not be taken back.",
      "Subject to Pune Jurisdiction.",
    ];
  }

  // Draw Commercial Terms (Left side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 35, 74);
  doc.text("COMMERCIAL TERMS", PAGE_MARGIN, y + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  let termY = y + 7;
  defaultTerms.forEach((term, idx) => {
    doc.setDrawColor(255, 121, 0);
    doc.setLineWidth(0.3);
    doc.circle(PAGE_MARGIN + 2, termY - 1, 1.8, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(255, 121, 0);
    doc.text(String(idx + 1), PAGE_MARGIN + 1.2, termY - 0.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(term, PAGE_MARGIN + 6, termY);
    termY += 4.5;
  });

  // Draw Price Summary Card (Right side)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, y - 2, summaryBoxWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 35, 74);
  doc.text("PRICE SUMMARY", summaryX + 4, y + 3);

  const primaryGst = quotation.items?.[0]?.gstRate ?? 18;
  const summaryRows: Array<[string, number]> = [
    ["Subtotal:", quotation.taxableAmount || quotation.subtotal],
    [`Total GST (${primaryGst}%):`, quotation.taxAmount],
    ...(quotation.freightCharges > 0 ? [["Freight Charges:", quotation.freightCharges] as [string, number]] : []),
    ...(quotation.installationCharges > 0
      ? [["Installation Charges:", quotation.installationCharges] as [string, number]]
      : []),
    ...(quotation.otherCharges > 0
      ? [[`${otherChargesDescription}:`, quotation.otherCharges] as [string, number]]
      : []),
  ];

  let sumRowY = y + 8;
  summaryRows.forEach(([lbl, val]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, summaryX + 4, sumRowY);
    const amountStr = `INR ${formatPdfNumber(val)}`;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(amountStr, summaryX + summaryBoxWidth - 4, sumRowY, { align: "right" });
    sumRowY += 4.2;
  });

  // Two-Tone Grand Total Bar
  const totalBarY = y + 24;
  const barHalfWidth = summaryBoxWidth / 2;
  doc.setFillColor(0, 35, 74); // Navy left
  doc.rect(summaryX, totalBarY, barHalfWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Grand Total:", summaryX + 3, totalBarY + 5.2);

  doc.setFillColor(255, 121, 0); // Orange right
  doc.rect(summaryX + barHalfWidth, totalBarY, barHalfWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `INR ${formatPdfNumber(quotation.grandTotal)}`,
    summaryX + summaryBoxWidth - 3,
    totalBarY + 5.2,
    { align: "right" }
  );

  // 6. Corporate Navy Footer Strip
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    const footerBarY = pageHeight - 14;

    doc.setFillColor(0, 35, 74); // Navy Footer Bar #00234a
    doc.roundedRect(PAGE_MARGIN, footerBarY, contentWidth, 6.5, 1, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    const footerText =
      "+91 9028815632   |   sales@isquaresafety.com   |   iSQUARE Safety Equipments Pvt. Ltd. Pune, Maharashtra, India";
    doc.text(footerText, pageWidth / 2, footerBarY + 4.2, { align: "center" });

    // Sub-footer text
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This is a computer-generated quotation from ISQUARE CRM and does not require a physical signature.",
      PAGE_MARGIN,
      pageHeight - 4
    );
    doc.text(`Page ${page} of ${doc.getNumberOfPages()}`, pageWidth - PAGE_MARGIN, pageHeight - 4, {
      align: "right",
    });
  }

  doc.save(`${quotationNumber}_CustomerQuotation.pdf`);
}

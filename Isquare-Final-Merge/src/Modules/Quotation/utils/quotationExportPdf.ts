import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { calculateItemTotals, hasQuotationDiscount } from "./quotationCalculations";
import { resolveImageUrl, getProductImageCache, productService } from "../services/quotationService";
import { ISQUARE_LOGO_BASE64 } from "./isquareLogoBase64";
import { ISQUARE_SEAL_BASE64 } from "./isquareSealBase64";

const PAGE_MARGIN = 12;
const FOOTER_SPACE = 12;

export interface ExportPdfOptions {
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  customerAddress?: string;
  masterProducts?: Product[];
}

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

export function findProductFromMaster(item: any, products: Product[]): Product | null {
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

export function getItemImageSource(item: any, products: Product[]): string | null {
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
  } catch { }

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

  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  const cached = getProductImageCache(trimmed);
  if (cached) {
    return cached;
  }

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
  } catch { }

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const timeout = window.setTimeout(() => finish(null), 5000);
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
 * Generates a clean, professional vector PDF matching the Customer-Facing Quotation Preview.
 * Excludes preview toolbars, buttons, and browser UI elements.
 */
export async function exportQuotationToPdf(
  quotation: Quotation,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  showDiscount?: boolean,
  options?: ExportPdfOptions
) {
  const effectiveShowDiscount =
    showDiscount !== undefined ? showDiscount : hasQuotationDiscount(quotation);

  await generateProgrammaticPdf(
    quotation,
    companyProfile,
    customer,
    effectiveShowDiscount,
    options
  );
}

/**
 * Programmatic jsPDF + autoTable generator that adheres 1:1 to the Customer-Facing Quotation Preview:
 * - Official iSQUARE corporate header & logo
 * - Company contact, address, GSTIN, and PAN
 * - Quotation reference number & proposal date strip
 * - Full customer information block with address & contact details
 * - Dynamic subject bar ("Sub: Offer for PPP") + introductory greeting
 * - Product table with orange header (#FF7900), white bold text, bulleted specs, and embedded product images
 * - Subtotal row matching preview
 * - Numbered commercial terms
 * - Closing message, official company stamp, and centered contact note
 * - Dynamic page numbers on every page
 * - Repeating table headers on subsequent pages
 */
async function generateProgrammaticPdf(
  quotation: Quotation,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  showDiscount: boolean = true,
  options?: ExportPdfOptions
) {
  // 1. Resolve Master Products for fallback images & HSN
  let masterProducts: Product[] = options?.masterProducts || [];
  if (masterProducts.length === 0) {
    try {
      masterProducts = await productService.getAll();
    } catch {
      masterProducts = [];
    }
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const rightX = pageWidth - PAGE_MARGIN;
  const rupeeMark = createRupeeMark();

  const quotationNumber =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;
  const quotationDate = formatProposalDate(quotation.quotationDate);

  doc.setProperties({
    title: `${quotationNumber} Customer Quotation`,
    subject: "Customer-Facing Quotation Document",
    author: "iSQUARE Safety Equipments Pvt. Ltd.",
  });

  // 2. Company Details Resolution
  const companyName = companyProfile?.companyName || "iSQUARE Safety Equipments Pvt. Ltd.";
  const companyAddress = "GOYAL RESIDENCY B, SR NO. 434/4A, OFFICE, B1/13, Kasarwadi, Maharashtra 411034";
  const companyPhone = companyProfile?.phone || "+91 9028815632";
  const companyEmail = companyProfile?.email || "sales@isquaresafety.com";
  const companyGstin = companyProfile?.gstin || "27AARCP3435C1ZD";
  const companyPan = companyProfile?.pan || "AARCP3435C";

  // 3. Corporate Header with Official Logo (Left) and Company Details (Right)
  try {
    doc.addImage(ISQUARE_LOGO_BASE64, "PNG", PAGE_MARGIN, 9, 48, 15);
  } catch (err) {
    // Fallback vector logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0, 35, 74);
    doc.text("iSQUARE", PAGE_MARGIN, 14);
    doc.setFontSize(7.5);
    doc.setTextColor(255, 85, 0);
    doc.text("SAFETY EQUIPMENTS PVT. LTD.", PAGE_MARGIN, 18);
    doc.setFont("helvetica", "italic");
    doc.text("The complete safety solution", PAGE_MARGIN, 22);
  }

  // Right-aligned company address & contact
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(16, 42, 80); // #102A50
  doc.text(companyAddress, rightX, 13, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(`Contact: ${companyPhone}   |   Email: ${companyEmail}`, rightX, 17, { align: "right" });
  doc.text(`GSTIN : ${companyGstin}   |   PAN : ${companyPan}`, rightX, 21, { align: "right" });

  // Vibrant Orange Separator Line
  doc.setDrawColor(255, 121, 0); // #FF7900
  doc.setLineWidth(0.6);
  doc.line(PAGE_MARGIN, 26, rightX, 26);

  // 4. Quotation Reference & Date Strip
  doc.setFillColor(245, 248, 252); // #F5F8FC
  doc.setDrawColor(214, 224, 236); // #D6E0EC
  doc.setLineWidth(0.25);
  doc.roundedRect(PAGE_MARGIN, 29, contentWidth, 7, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 85); // #002B55
  doc.text("Ref.:", PAGE_MARGIN + 3, 33.7);
  doc.setTextColor(255, 121, 0); // #FF7900
  doc.text(quotationNumber, PAGE_MARGIN + 12, 33.7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Date:", rightX - 24, 33.7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 43, 85);
  doc.text(quotationDate, rightX - 3, 33.7, { align: "right" });

  // 5. Customer Information Block
  const infoTop = 38.5;

  // Resolve Customer Name
  const customerName =
    customer?.companyName ||
    (customer as any)?.company ||
    quotation.customerName ||
    customer?.customerName ||
    "Valued Customer";

  // Resolve Customer Address
  let customerAddress = options?.customerAddress || "";
  if (!customerAddress) {
    if ((quotation as any).customerAddress) {
      customerAddress = String((quotation as any).customerAddress).replace(/Mumbai/gi, "Pune");
    } else if (customer?.addresses && customer.addresses.length > 0) {
      const primary = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
      const parts = [
        primary.address,
        primary.cityName,
        primary.stateName ? `${primary.stateName} - ${primary.pincode || ""}` : primary.pincode,
        "India",
      ].filter(Boolean);
      if (parts.length > 0) customerAddress = parts.join(", ").replace(/Mumbai/gi, "Pune");
    } else if ((customer as any)?.address) {
      customerAddress = ((customer as any).address as string).replace(/Mumbai/gi, "Pune");
    }
  }

  const customerDetails = customer as CustomerPdfDetails | null | undefined;
  const contactPerson =
    options?.contactPerson ||
    quotation.contactPerson ||
    customerDetails?.contactPerson ||
    customerDetails?.contactPersonName ||
    "";
  const contactPhone =
    options?.contactPhone ||
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    customerDetails?.phone ||
    customer?.mobile ||
    "";
  const contactEmail =
    options?.contactEmail ||
    (quotation as any).contactEmail ||
    customerDetails?.email ||
    "";

  doc.setFontSize(7.5);
  const addressLines = customerAddress
    ? doc.splitTextToSize(customerAddress, contentWidth - 8)
    : [];

  let cardHeight = 11 + addressLines.length * 3.5;
  if (contactPerson) cardHeight += 3.5;
  if (contactPhone) cardHeight += 3.5;
  if (contactEmail) cardHeight += 3.5;

  doc.setFillColor(245, 248, 252); // #F5F8FC
  doc.setDrawColor(214, 224, 236); // #D6E0EC
  doc.setLineWidth(0.25);
  doc.roundedRect(PAGE_MARGIN, infoTop, contentWidth, cardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("To,", PAGE_MARGIN + 3.5, infoTop + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 43, 85);
  doc.text(customerName.toUpperCase(), PAGE_MARGIN + 3.5, infoTop + 8.5);

  let curY = infoTop + 8.5;
  if (addressLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    addressLines.forEach((line: string) => {
      curY += 3.5;
      doc.text(line, PAGE_MARGIN + 3.5, curY);
    });
  }

  if (contactPerson) {
    curY += 3.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 43, 85);
    doc.text("Kind Attn:", PAGE_MARGIN + 3.5, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 42, 80);
    doc.text(contactPerson, PAGE_MARGIN + 19, curY);
  }

  if (contactPhone) {
    curY += 3.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 43, 85);
    doc.text("Mob. No.:", PAGE_MARGIN + 3.5, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 42, 80);
    doc.text(contactPhone, PAGE_MARGIN + 19, curY);
  }

  if (contactEmail) {
    curY += 3.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 43, 85);
    doc.text("Email id:", PAGE_MARGIN + 3.5, curY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 42, 80);
    doc.text(contactEmail, PAGE_MARGIN + 19, curY);
  }

  // 6. Subject, Greeting & Introduction (Clean text format without dark-blue/orange styling)
  const subY = infoTop + cardHeight + 4;
  const subjectText = (quotation.subject || "").trim() || "Offer for PPP";
  const greetingText = (quotation.greeting || "").trim() || "Dear Sir/Madam,";
  const introText =
    (quotation.introduction || "").trim() ||
    "We take pleasure in submitting our competitive offer for your requirement.";

  // SUB: Offer for PPP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 85);
  doc.text(`SUB: ${subjectText}`, PAGE_MARGIN, subY);

  // Greeting
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 43, 85);
  doc.text(greetingText, PAGE_MARGIN, subY + 4.5);

  // Introduction
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(introText, PAGE_MARGIN, subY + 8);

  // 7. Product Table with Orange Header (#FF7900) & Professional Theme
  const tableStartY = subY + 11.5;
  const headers = [
    "SR. NO.",
    "DESCRIPTION",
    "IMAGE",
    "HSN CODE",
    "GST (%)",
    "QTY",
    "UOM",
    "UNIT RATE (INR)",
    ...(showDiscount ? ["DISCOUNT (%)"] : []),
    "TOTAL AMOUNT (INR)",
  ];

  const rows: any[][] = [];
  const imageSources: Array<string | null> = [];

  (quotation.items || []).forEach((item, index) => {
    const itemDetails = item as QuotationItemPdfDetails;
    const totals = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );

    const matchedProd = findProductFromMaster(item, masterProducts);
    const itemImage = getItemImageSource(item, masterProducts);
    const hsnCode =
      itemDetails.hsnCode ||
      itemDetails.hsn ||
      matchedProd?.hsnCode ||
      "-";

    const specBullets = parseSpecificationBullets(
      item.specification || matchedProd?.specification
    );
    let descText = `${item.itemName}${item.brand ? ` (${item.brand})` : ""}`;
    if (specBullets.length > 0) {
      descText += "\n" + specBullets.map((b) => `•  ${b}`).join("\n");
    }

    rows.push([
      String(index + 1),
      descText,
      "", // Clean empty string - image drawn in didDrawCell
      hsnCode,
      `${item.gstRate}%`,
      String(item.quantity),
      item.unitName || "Nos",
      formatPdfNumber(item.rate),
      ...(showDiscount ? [`${item.discountPercentage}%`] : []),
      formatPdfNumber(totals.lineTotal),
    ]);
    imageSources.push(itemImage || null);

    // Linked accessories
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

      let accDescText = `↳ [Accessory] ${accessory.itemName}`;
      const accBullets = parseSpecificationBullets(
        accessory.specification || accMatched?.specification
      );
      if (accBullets.length > 0) {
        accDescText += "\n" + accBullets.map((b) => `•  ${b}`).join("\n");
      }

      rows.push([
        "↳",
        accDescText,
        "",
        accHsn,
        `${accessory.gstRate}%`,
        String(accessory.quantity),
        accessory.unitName || "Nos",
        formatPdfNumber(accessory.rate),
        ...(showDiscount ? [`${accessory.discountPercentage}%`] : []),
        formatPdfNumber(accessoryTotals.lineTotal),
      ]);
      imageSources.push(accessoryImage || null);
    });
  });

  const embeddedImages = await Promise.all(imageSources.map(loadImageAsDataUrl));

  // Single-row calculated final amount matching Customer-Facing format
  const calculatedSubTotal = (quotation.items || []).reduce((acc, item) => {
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
  }, 0) || quotation.grandTotal || 0;

  if (rows.length > 0) {
    rows.push([
      {
        content: "SUB TOTAL",
        colSpan: showDiscount ? 9 : 8,
        styles: {
          halign: "right",
          fontStyle: "bold",
          textColor: [0, 43, 85],
          fillColor: [245, 248, 252],
          fontSize: 7.5,
        },
      },
      {
        content: formatPdfNumber(calculatedSubTotal),
        styles: {
          halign: "right",
          fontStyle: "bold",
          textColor: [255, 121, 0],
          fillColor: [245, 248, 252],
          fontSize: 8,
        },
      },
    ]);
  }

  // Column widths definition
  const fixedWidths = showDiscount
    ? [10, 18, 16, 12, 10, 12, 20, 14, 24]
    : [10, 18, 16, 12, 10, 12, 22, 26];
  const productColumnWidth = contentWidth - fixedWidths.reduce((sum, width) => sum + width, 0);
  const columnWidths = [fixedWidths[0], productColumnWidth, ...fixedWidths.slice(1)];
  const rateColumnIndex = 7;
  const totalColumnIndex = headers.length - 1;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_SPACE + 8 },
    head: [headers],
    body: rows.length
      ? rows
      : [["1", "No products added to this quotation.", "", "", "", "", "", "", ...(showDiscount ? [""] : []), ""]],
    theme: "grid",
    showHead: "everyPage",
    headStyles: {
      fillColor: [255, 121, 0], // Solid Vibrant Orange #FF7900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      cellPadding: 2.5,
      lineColor: [224, 104, 0],
      lineWidth: 0.15,
      halign: "center",
      valign: "middle",
    },
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
      textColor: [16, 42, 80],
      lineColor: [214, 224, 236],
      lineWidth: 0.15,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: columnWidths[0], halign: "center" },
      1: { cellWidth: columnWidths[1], valign: "top", fontStyle: "bold", textColor: [0, 43, 85] },
      2: { cellWidth: columnWidths[2], halign: "center" },
      3: { cellWidth: columnWidths[3], halign: "center" },
      4: { cellWidth: columnWidths[4], halign: "center", fontStyle: "bold", textColor: [37, 99, 235] }, // GST (%) in blue
      5: { cellWidth: columnWidths[5], halign: "center" }, // Qty
      6: { cellWidth: columnWidths[6], halign: "center" }, // UOM
      7: { cellWidth: columnWidths[7], halign: "right" },  // Rate (INR)
      ...(showDiscount
        ? {
          8: { cellWidth: columnWidths[8], halign: "center" as const }, // Discount (%)
          9: { cellWidth: columnWidths[9], halign: "right" as const, fontStyle: "bold" as const }, // Total (INR)
        }
        : {
          8: { cellWidth: columnWidths[8], halign: "right" as const, fontStyle: "bold" as const }, // Total (INR)
        }),
    },
    didDrawCell: (data) => {
      // Draw image in cell
      if (data.section === "body" && data.column.index === 2) {
        const imageData = embeddedImages[data.row.index];
        if (imageData) {
          data.cell.text = [];
          const size = Math.min(14, data.cell.width - 2, data.cell.height - 2);
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
      // Draw rupee mark in Rate and Total columns
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

  // 8. Bottom Section: Commercial Terms
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

  // Check page height before Commercial Terms
  if (y + 36 > pageHeight - 15) {
    doc.addPage();
    y = PAGE_MARGIN + 5;
  }

  // Commercial Terms Header
  doc.setFillColor(255, 121, 0); // #FF7900
  doc.roundedRect(PAGE_MARGIN, y, 4.5, 4.5, 0.8, 0.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 85);
  doc.text("COMMERCIAL TERMS", PAGE_MARGIN + 6.5, y + 3.5);

  let termY = y + 8;
  termsList.forEach((term, idx) => {
    doc.setDrawColor(255, 121, 0);
    doc.setLineWidth(0.3);
    doc.circle(PAGE_MARGIN + 2, termY - 0.9, 1.7, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(255, 121, 0);
    doc.text(String(idx + 1), PAGE_MARGIN + 1.2, termY - 0.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(16, 42, 80);
    doc.text(term, PAGE_MARGIN + 5.5, termY);
    termY += 4.5;
  });

  // 9. Closing Section & Official Stamp
  let closingY = termY + 5;
  if (closingY + 36 > pageHeight - 15) {
    doc.addPage();
    closingY = PAGE_MARGIN + 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 42, 80);
  doc.text("Thanking you,", PAGE_MARGIN, closingY);
  doc.text("Yours faithfully,", PAGE_MARGIN, closingY + 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 43, 85);
  doc.text(`For ${companyName}`, PAGE_MARGIN, closingY + 8);

  // Circular Blue Company Stamp
  try {
    doc.addImage(ISQUARE_SEAL_BASE64, "PNG", PAGE_MARGIN, closingY + 10, 22, 22);
  } catch (err) {
    console.warn("Could not embed stamp in signatory area:", err);
  }

  // 10. Center-Aligned Contact Note (Mr. Irfan Attar)
  const noteY = closingY + 35;
  doc.setDrawColor(214, 224, 236);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN + 25, noteY - 3, rightX - 25, noteY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Note: If you need any clarification or further assistance please feel free to contact",
    pageWidth / 2,
    noteY,
    { align: "center" }
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 85);
  doc.text("Mr. Irfan Attar", pageWidth / 2, noteY + 4.5, { align: "center" });

  // 11. Clean Dynamic Page Numbering ("Page X of Y")
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${page} of ${totalPages}`, rightX, pageHeight - 5, {
      align: "right",
    });
  }

  doc.save(`${quotationNumber}_CustomerQuotation.pdf`);
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation, CompanyProfile } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { calculateItemTotals } from "./quotationCalculations";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "./customerQuotationStorage";
import { resolveImageUrl } from "../services/quotationService";

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

function loadImageAsDataUrl(source?: string | null): Promise<string | null> {
  if (!source) return Promise.resolve(null);

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const timeout = window.setTimeout(() => finish(null), 10000);
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
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          finish(null);
          return;
        }
        context.drawImage(image, 0, 0);
        finish(canvas.toDataURL("image/png"));
      } catch (error) {
        console.warn("Could not prepare quotation product image for PDF:", error);
        finish(null);
      }
    };
    image.onerror = () => finish(null);
    image.src = source;
  });
}

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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const rupeeMark = createRupeeMark();
  const quotationNumber = quotation.quotationNumber || `QT-${quotation.quotationId}`;
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(
    doc.splitTextToSize(
      companyProfile?.companyName || "ISQUARE SAFETY EQUIPMENTS PVT. LTD.",
      contentWidth * 0.58
    ),
    PAGE_MARGIN,
    18
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Sales & Commercial Quotation Proposal", PAGE_MARGIN, 24);
  if (companyProfile?.gstin) {
    doc.text(
      `GSTIN: ${companyProfile.gstin}${companyProfile.pan ? ` | PAN: ${companyProfile.pan}` : ""}`,
      PAGE_MARGIN,
      29
    );
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(21, 64, 104);
  doc.text(quotationNumber, pageWidth - PAGE_MARGIN, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const quotationDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toISOString().substring(0, 10)
    : new Date().toISOString().substring(0, 10);
  doc.text(`Date: ${quotationDate}`, pageWidth - PAGE_MARGIN, 24, { align: "right" });
  if (quotation.enquiryRef) {
    doc.text(`Enquiry Ref: ${quotation.enquiryRef}`, pageWidth - PAGE_MARGIN, 29, {
      align: "right",
    });
  }
  if (quotation.validUntil) {
    doc.text(
      `Valid Until: ${new Date(quotation.validUntil).toISOString().substring(0, 10)}`,
      pageWidth - PAGE_MARGIN,
      34,
      { align: "right" }
    );
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, 37, pageWidth - PAGE_MARGIN, 37);

  const infoTop = 42;
  const infoColumnWidth = contentWidth / 2 - 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CUSTOMER / BILL TO:", PAGE_MARGIN, infoTop);
  doc.text("COMMERCIAL & FREIGHT TERMS:", PAGE_MARGIN + contentWidth / 2 + 5, infoTop);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(customerName, infoColumnWidth), PAGE_MARGIN, infoTop + 5);

  let leftInfoY = infoTop + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const customerDetails = customer as CustomerPdfDetails | null | undefined;
  const contactPerson =
    quotation.contactPerson ||
    customerDetails?.contactPerson ||
    customerDetails?.contactPersonName;
  const customerLines = [
    contactPerson ? `Attn: ${contactPerson}` : "",
    customerDetails?.email
      ? `${customerDetails.email}${customerDetails.phone ? ` | ${customerDetails.phone}` : ""}`
      : "",
    customer?.gstin ? `GSTIN: ${customer.gstin}` : "",
  ].filter(Boolean);
  customerLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, infoColumnWidth);
    doc.text(wrapped, PAGE_MARGIN, leftInfoY);
    leftInfoY += wrapped.length * 4;
  });

  const rightInfoX = PAGE_MARGIN + contentWidth / 2 + 5;
  let rightInfoY = infoTop + 5;
  const commercialLines = [
    `Freight: ${freightDisplay}`,
    `Installation: ${installationDisplay}`,
    ...(quotation.otherCharges > 0
      ? [`${otherChargesDescription}: INR ${formatPdfNumber(quotation.otherCharges)}`]
      : []),
    ...(quotation.deliveryPeriod ? [`Delivery Period: ${quotation.deliveryPeriod}`] : []),
  ];
  commercialLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, infoColumnWidth);
    doc.text(wrapped, rightInfoX, rightInfoY);
    rightInfoY += wrapped.length * 4;
  });

  const tableStartY = Math.max(leftInfoY, rightInfoY) + 5;
  const headers = [
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

  (quotation.items || []).forEach((item) => {
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
    const itemImage = resolveImageUrl(
      itemDetails.customImageUrl ||
        itemDetails.imageUrl ||
        itemDetails.productImage ||
        itemDetails.productImagePath
    );
    rows.push([
      description,
      itemImage ? "Image unavailable" : "-",
      itemDetails.hsnCode || itemDetails.hsn || "-",
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
      const accessoryImage = resolveImageUrl(
        accessoryDetails.customImageUrl ||
          accessoryDetails.imageUrl ||
          accessoryDetails.productImage ||
          accessoryDetails.productImagePath
      );
      rows.push([
        `- [Accessory] ${accessory.itemName}${accessory.specification ? `\n${accessory.specification}` : ""}`,
        accessoryImage ? "Image unavailable" : "-",
        accessoryDetails.hsnCode || accessoryDetails.hsn || "-",
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
    ? [14, 17, 10, 14, 22, 14, 12, 25]
    : [14, 17, 10, 14, 22, 12, 27];
  const productColumnWidth = contentWidth - fixedWidths.reduce((sum, width) => sum + width, 0);
  const columnWidths = [productColumnWidth, ...fixedWidths];
  const rateColumnIndex = 5;
  const totalColumnIndex = headers.length - 1;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: FOOTER_SPACE },
    head: [headers],
    body: rows.length ? rows : [["No products added to this quotation.", "", "", "", "", "", ...(showDiscount ? [""] : []), "", ""]],
    theme: "grid",
    showHead: "everyPage",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 2,
      lineColor: [30, 41, 59],
      lineWidth: 0.15,
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
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: columnWidths[0], valign: "top" },
      1: { cellWidth: columnWidths[1], halign: "center" },
      2: { cellWidth: columnWidths[2], halign: "center" },
      3: { cellWidth: columnWidths[3], halign: "center" },
      4: { cellWidth: columnWidths[4], halign: "center" },
      [rateColumnIndex]: { cellWidth: columnWidths[rateColumnIndex], halign: "right" },
      ...(showDiscount
        ? {
            6: { cellWidth: columnWidths[6], halign: "center" as const },
            7: { cellWidth: columnWidths[7], halign: "center" as const },
            8: { cellWidth: columnWidths[8], halign: "right" as const },
          }
        : {
            6: { cellWidth: columnWidths[6], halign: "center" as const },
            7: { cellWidth: columnWidths[7], halign: "right" as const },
          }),
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const imageData = embeddedImages[data.row.index];
        if (imageData) {
          data.cell.text = [];
          const size = Math.min(12, data.cell.width - 4, data.cell.height - 4);
          doc.addImage(
            imageData,
            "PNG",
            data.cell.x + (data.cell.width - size) / 2,
            data.cell.y + (data.cell.height - size) / 2,
            size,
            size
          );
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
  let y = (finalTableY || tableStartY) + 8;
  const chargeRows: Array<[string, number]> = [
    ["Subtotal:", quotation.taxableAmount || quotation.subtotal],
    ["Total GST:", quotation.taxAmount],
    ...(quotation.freightCharges > 0 ? [["Freight Charges:", quotation.freightCharges] as [string, number]] : []),
    ...(quotation.installationCharges > 0
      ? [["Installation Charges:", quotation.installationCharges] as [string, number]]
      : []),
    ...(quotation.otherCharges > 0
      ? [[`${otherChargesDescription}:`, quotation.otherCharges] as [string, number]]
      : []),
    ...((quotation.charges || []).map((charge) => [
      `${charge.chargeName}:`,
      charge.totalAmount || charge.chargeAmount,
    ] as [string, number])),
  ];
  const summaryHeight = (chargeRows.length + 1) * 5 + 5;
  if (y + summaryHeight > pageHeight - FOOTER_SPACE) {
    doc.addPage();
    y = PAGE_MARGIN;
  }

  const summaryWidth = 88;
  const summaryX = pageWidth - PAGE_MARGIN - summaryWidth;
  const summaryRight = pageWidth - PAGE_MARGIN;
  const drawSummaryRow = (
    label: string,
    value: number,
    baselineY: number,
    emphasized = false
  ) => {
    doc.setFont("helvetica", emphasized ? "bold" : "normal");
    doc.setFontSize(emphasized ? 10 : 8);
    if (emphasized) {
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(label, summaryX, baselineY);
    const amount = formatPdfNumber(value);
    const amountWidth = doc.getTextWidth(amount);
    doc.text(amount, summaryRight, baselineY, { align: "right" });
    drawCurrencyMark(
      doc,
      rupeeMark,
      summaryRight - amountWidth - 2.5,
      baselineY,
      emphasized ? [21, 64, 104] : [71, 85, 105]
    );
  };

  chargeRows.forEach(([label, value]) => {
    drawSummaryRow(label, value, y);
    y += 4.5;
  });
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX, y, summaryRight, y);
  y += 5;
  drawSummaryRow("Grand Total:", quotation.grandTotal, y, true);
  y += 10;

  const termsLines = [
    ...(quotation.paymentTermsName ? [`Payment Terms: ${quotation.paymentTermsName}`] : []),
    ...(quotation.warranty &&
    quotation.warranty.trim().toLowerCase() !== "1 year standard"
      ? [`Warranty: ${quotation.warranty}`]
      : []),
    ...(quotation.termsAndConditions ? [quotation.termsAndConditions] : []),
  ];
  const bankLines = companyProfile?.bankName
    ? [
        `Bank: ${companyProfile.bankName}`,
        ...(companyProfile.accountNumber ? [`A/C No: ${companyProfile.accountNumber}`] : []),
        ...(companyProfile.ifscCode
          ? [
              `IFSC: ${companyProfile.ifscCode}${companyProfile.branchName ? ` | Branch: ${companyProfile.branchName}` : ""}`,
            ]
          : []),
        "Please quote quotation number in RTGS / NEFT transfer remarks",
      ]
    : [];

  if (termsLines.length || bankLines.length) {
    const termsWidth = contentWidth / 2 - 4;
    const bankWidth = contentWidth / 2 - 4;
    const wrappedTerms = termsLines.flatMap((line) => doc.splitTextToSize(line, termsWidth));
    const wrappedBank = bankLines.flatMap((line) => doc.splitTextToSize(line, bankWidth));
    const sectionHeight = 9 + Math.max(wrappedTerms.length, wrappedBank.length, 1) * 3.5;
    if (y + sectionHeight > pageHeight - FOOTER_SPACE) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    if (termsLines.length) doc.text("COMMERCIAL TERMS:", PAGE_MARGIN, y);
    if (bankLines.length) {
      doc.text("BANK REMITTANCE DETAILS:", pageWidth / 2 + 2, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    if (wrappedTerms.length) doc.text(wrappedTerms, PAGE_MARGIN, y + 4);
    if (wrappedBank.length) doc.text(wrappedBank, pageWidth / 2 + 2, y + 4);
    y += sectionHeight;
  }

  const footerY = pageHeight - 7;
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(PAGE_MARGIN, footerY - 4, pageWidth - PAGE_MARGIN, footerY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "This is a computer-generated quotation from ISQUARE CRM and does not require a physical signature.",
      PAGE_MARGIN,
      footerY
    );
    doc.text(`Page ${page} of ${doc.getNumberOfPages()}`, pageWidth - PAGE_MARGIN, footerY, {
      align: "right",
    });
  }

  doc.save(`${quotationNumber}_CustomerQuotation.pdf`);
}

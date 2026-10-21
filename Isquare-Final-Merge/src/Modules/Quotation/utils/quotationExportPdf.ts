import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation, CompanyProfile } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { formatINR, calculateItemTotals } from "./quotationCalculations";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "./customerQuotationStorage";

export function exportQuotationToPdf(
  quotation: Quotation,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  showDiscount: boolean = true
) {
  // If uploaded customer quotation, download the original file if available
  if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
    const downloaded = downloadOriginalCustomerQuotation(quotation.quotationId);
    if (downloaded) return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header: Company Details
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text(companyProfile?.companyName || "ISQUARE SAFETY EQUIPMENTS PVT. LTD.", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Customer-Facing Commercial Quotation", 14, 23);

  if (companyProfile?.gstin) {
    doc.text(
      `GSTIN: ${companyProfile.gstin}${companyProfile.pan ? ` | PAN: ${companyProfile.pan}` : ""}`,
      14,
      28
    );
  }

  // Right Header: Quotation Number & Date
  const qNum = quotation.quotationNumber || `QT-${quotation.quotationId}`;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 64, 104); // #154068
  doc.text(qNum, pageWidth - 14, 18, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const qDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toISOString().substring(0, 10)
    : new Date().toISOString().substring(0, 10);
  doc.text(`Date: ${qDate}`, pageWidth - 14, 23, { align: "right" });

  if (quotation.enquiryRef) {
    doc.text(`Enquiry Ref: ${quotation.enquiryRef}`, pageWidth - 14, 28, { align: "right" });
  }

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  // Customer & Terms Info Boxes
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("CUSTOMER / BILL TO:", 14, 38);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  const custName =
    quotation.customerName ||
    customer?.customerName ||
    customer?.companyName ||
    "Valued Customer";
  doc.text(custName, 14, 43);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  let yOffset = 48;
  if (quotation.contactPerson) {
    doc.text(`Attn: ${quotation.contactPerson}`, 14, yOffset);
    yOffset += 5;
  }
  if (customer?.gstin) {
    doc.text(`GSTIN: ${customer.gstin}`, 14, yOffset);
    yOffset += 5;
  }

  // Customer-Facing Columns in Exact Order:
  // 1. Product Name & Specification
  // 2. Image
  // 3. HSN Code
  // 4. Qty
  // 5. UOM
  // 6. Rate (₹)
  // 7. Discount (%) [if showDiscount]
  // 8. GST (%)
  // 9. Total (₹)
  const headers = [
    "Product Name & Specification",
    "Image",
    "HSN Code",
    "Qty",
    "UOM",
    "Rate (₹)",
  ];
  if (showDiscount) {
    headers.push("Discount (%)");
  }
  headers.push("GST (%)", "Total (₹)");

  const tableRows: any[] = [];
  (quotation.items || []).forEach((item) => {
    const calc = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );
    const spec = item.specification ? `\n${item.specification}` : "";
    const nameAndSpec = `${item.itemName}${item.brand ? ` (${item.brand})` : ""}${spec}`;
    const hsn = (item as any).hsnCode || (item as any).hsn || "—";
    const row = [
      nameAndSpec,
      (item as any).imageUrl ? "[Image Attached]" : "—",
      hsn,
      String(item.quantity),
      item.unitName || "Nos",
      item.rate.toLocaleString("en-IN"),
    ];
    if (showDiscount) {
      row.push(`${item.discountPercentage}%`);
    }
    row.push(`${item.gstRate}%`, calc.lineTotal.toLocaleString("en-IN"));
    tableRows.push(row);

    // Linked Accessories if any
    (item.accessories || []).forEach((acc) => {
      const aCalc = calculateItemTotals(
        acc.quantity,
        acc.rate,
        acc.discountPercentage,
        acc.gstRate
      );
      const accSpec = acc.specification ? `\n${acc.specification}` : "";
      const accNameAndSpec = `  ↳ [Accessory] ${acc.itemName}${accSpec}`;
      const accHsn = (acc as any).hsnCode || (acc as any).hsn || "—";
      const accRow = [
        accNameAndSpec,
        (acc as any).imageUrl ? "[Image Attached]" : "—",
        accHsn,
        String(acc.quantity),
        acc.unitName || "Nos",
        acc.rate.toLocaleString("en-IN"),
      ];
      if (showDiscount) {
        accRow.push(`${acc.discountPercentage}%`);
      }
      accRow.push(`${acc.gstRate}%`, aCalc.lineTotal.toLocaleString("en-IN"));
      tableRows.push(accRow);
    });
  });

  autoTable(doc, {
    startY: Math.max(yOffset + 2, 55),
    head: [headers],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: showDiscount ? 46 : 56 },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "center", cellWidth: 14 },
      5: { halign: "right", cellWidth: 20 },
      ...(showDiscount
        ? {
            6: { halign: "center", cellWidth: 16 },
            7: { halign: "center", cellWidth: 16 },
            8: { halign: "right", cellWidth: 22 },
          }
        : {
            6: { halign: "center", cellWidth: 16 },
            7: { halign: "right", cellWidth: 24 },
          }),
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Pricing Totals Box
  const summaryX = pageWidth - 70;
  let summaryY = finalY + 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  doc.text("Subtotal:", summaryX, summaryY);
  doc.text(
    `₹ ${formatINR(quotation.taxableAmount || quotation.subtotal)}`,
    pageWidth - 14,
    summaryY,
    { align: "right" }
  );
  summaryY += 4.5;

  doc.text("Total GST:", summaryX, summaryY);
  doc.text(`₹ ${formatINR(quotation.taxAmount)}`, pageWidth - 14, summaryY, {
    align: "right",
  });
  summaryY += 4.5;

  if (quotation.freightCharges > 0) {
    doc.text("Freight Charges:", summaryX, summaryY);
    doc.text(
      `₹ ${formatINR(quotation.freightCharges)}`,
      pageWidth - 14,
      summaryY,
      { align: "right" }
    );
    summaryY += 4.5;
  }

  if (quotation.installationCharges > 0) {
    doc.text("Installation Charges:", summaryX, summaryY);
    doc.text(
      `₹ ${formatINR(quotation.installationCharges)}`,
      pageWidth - 14,
      summaryY,
      { align: "right" }
    );
    summaryY += 4.5;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX, summaryY, pageWidth - 14, summaryY);
  summaryY += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", summaryX, summaryY);
  doc.setTextColor(21, 64, 104);
  doc.text(`₹ ${formatINR(quotation.grandTotal)}`, pageWidth - 14, summaryY, {
    align: "right",
  });

  // Terms & Conditions
  if (quotation.termsAndConditions) {
    const termsY = Math.max(summaryY + 10, finalY + 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Terms & Conditions:", 14, termsY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const splitTerms = doc.splitTextToSize(
      quotation.termsAndConditions,
      pageWidth - 90
    );
    doc.text(splitTerms, 14, termsY + 4);
  }

  doc.save(`${qNum}_CustomerQuotation.pdf`);
}

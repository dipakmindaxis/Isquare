import * as XLSX from "xlsx";
import type { Quotation } from "../models/quotationModels";
import { calculateItemTotals } from "./quotationCalculations";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "./customerQuotationStorage";

export function exportQuotationToCustomerExcel(
  quotation: Quotation,
  showDiscount: boolean = true
) {
  // If uploaded customer quotation, download the original preserved file directly
  if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
    const downloaded = downloadOriginalCustomerQuotation(quotation.quotationId);
    if (downloaded) return;
  }

  const qNum = quotation.quotationNumber || `QT-${quotation.quotationId}`;
  const rows: Record<string, any>[] = [];

  // Line items matching customer-facing columns in exact order
  (quotation.items || []).forEach((item, idx) => {
    const calc = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );
    const spec = item.specification ? `\n${item.specification}` : "";
    const nameAndSpec = `${item.itemName}${item.brand ? ` (${item.brand})` : ""}${spec}`;
    const hsn = (item as any).hsnCode || (item as any).hsn || "—";
    const imgDisplay = (item as any).imageUrl ? "Attached" : "—";

    const row: Record<string, any> = {
      "Sr.": idx + 1,
      "Product Name & Specification": nameAndSpec,
      "Image": imgDisplay,
      "HSN Code": hsn,
      "Qty": item.quantity,
      "UOM": item.unitName || "Nos",
      "Rate (₹)": item.rate,
    };

    if (showDiscount) {
      row["Discount (%)"] = item.discountPercentage;
    }

    row["GST (%)"] = item.gstRate;
    row["Total (₹)"] = calc.lineTotal;

    rows.push(row);

    // Accessories if present
    (item.accessories || []).forEach((acc, aIdx) => {
      const aCalc = calculateItemTotals(
        acc.quantity,
        acc.rate,
        acc.discountPercentage,
        acc.gstRate
      );
      const accSpec = acc.specification ? `\n${acc.specification}` : "";
      const accNameAndSpec = `  ↳ [Accessory] ${acc.itemName}${accSpec}`;
      const accHsn = (acc as any).hsnCode || (acc as any).hsn || "—";
      const accImg = (acc as any).imageUrl ? "Attached" : "—";

      const accRow: Record<string, any> = {
        "Sr.": `${idx + 1}.${aIdx + 1}`,
        "Product Name & Specification": accNameAndSpec,
        "Image": accImg,
        "HSN Code": accHsn,
        "Qty": acc.quantity,
        "UOM": acc.unitName || "Nos",
        "Rate (₹)": acc.rate,
      };

      if (showDiscount) {
        accRow["Discount (%)"] = acc.discountPercentage;
      }

      accRow["GST (%)"] = acc.gstRate;
      accRow["Total (₹)"] = aCalc.lineTotal;

      rows.push(accRow);
    });
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // Sr.
    { wch: 40 }, // Product Name & Spec
    { wch: 12 }, // Image
    { wch: 14 }, // HSN Code
    { wch: 8 },  // Qty
    { wch: 10 }, // UOM
    { wch: 14 }, // Rate
  ];
  if (showDiscount) {
    colWidths.push({ wch: 14 }); // Discount %
  }
  colWidths.push({ wch: 10 }); // GST %
  colWidths.push({ wch: 16 }); // Total

  worksheet["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Quotation");
  XLSX.writeFile(workbook, `${qNum}_CustomerQuotation.xlsx`);
}

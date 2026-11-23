import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Quotation, CompanyProfile, Product } from "../models/quotationModels";
import type { Customer } from "../../RSM/Pages/Customer/Types/CustomerTypes";
import { calculateItemTotals, hasQuotationDiscount } from "./quotationCalculations";
import {
  isCustomerFormatQuotation,
  downloadOriginalCustomerQuotation,
} from "./customerQuotationStorage";
import { ISQUARE_SEAL_BASE64 } from "./isquareSealBase64";
import { ISQUARE_LOGO_BASE64 } from "./isquareLogoBase64";
import {
  loadImageAsDataUrl,
  findProductFromMaster,
  getItemImageSource,
} from "./quotationExportPdf";

type CustomerDetails = Customer & {
  contactPerson?: string | null;
  contactPersonName?: string | null;
  email?: string | null;
  emailAddress?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  billingAddress?: string | null;
};

/**
 * Extracts pure base64 data and extension from a Data URL string.
 */
function parseDataUrl(dataUrl: string): { base64: string; extension: "png" | "jpeg" | "gif" } {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
  if (match) {
    const ext = match[1].toLowerCase() === "jpg" ? "jpeg" : match[1].toLowerCase();
    const safeExt = (ext === "png" || ext === "jpeg" || ext === "gif") ? ext : "png";
    return { base64: match[2], extension: safeExt as "png" | "jpeg" | "gif" };
  }
  return { base64: dataUrl.replace(/^data:[^;]+;base64,/, ""), extension: "png" };
}

/**
 * Formats date into DD MMM YYYY (e.g. 23 Nov 2026)
 */
function formatExcelDate(dateStr?: string | null): string {
  if (!dateStr) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
}

/**
 * Dynamically calculates the required Excel row height for a multi-line product description,
 * wrapping based on column width so no lines or bullet points are cut off or overflow below.
 */
function calculateDescriptionRowHeight(text: string, colWidth: number = 48): number {
  if (!text || !text.trim()) return 75;
  const lines = text.split(/\r?\n/);
  let totalVisualLines = 0;
  const charsPerLine = Math.max(28, colWidth - 6);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      totalVisualLines += 0.8;
    } else {
      totalVisualLines += Math.max(1, Math.ceil(trimmed.length / charsPerLine));
    }
  }
  const height = Math.ceil(totalVisualLines * 16.5 + 24);
  return Math.max(75, height);
}

/**
 * Exports a professional, corporate customer-facing Excel quotation document
 * formatted with rich styles, embedded images, headers, commercial terms,
 * and company stamp matching client reference standards.
 */
export async function exportQuotationToCustomerExcel(
  quotation: Quotation,
  showDiscount?: boolean,
  companyProfile?: CompanyProfile | null,
  customer?: Customer | null,
  masterProducts?: Product[]
): Promise<void> {
  // If uploaded customer quotation, download the original preserved file directly
  if (isCustomerFormatQuotation(quotation.quotationId, quotation)) {
    const downloaded = downloadOriginalCustomerQuotation(quotation.quotationId);
    if (downloaded) return;
  }

  const effectiveShowDiscount =
    showDiscount !== undefined ? showDiscount : hasQuotationDiscount(quotation);

  const qNum =
    quotation.quotationNumber ||
    `QT-2026-${String(quotation.quotationId || 1).padStart(3, "0")}`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "iSQUARE CRM";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Customer Quotation", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
    views: [{ showGridLines: true }],
  });

  // Set column widths matching reference quotation
  worksheet.columns = [
    { key: "spacer", width: 3 },      // Col A: Margin spacer
    { key: "sr", width: 8 },          // Col B: SR. NO.
    { key: "desc", width: 48 },        // Col C: DESCRIPTION (expanded for better breathing room)
    { key: "img", width: 16 },         // Col D: IMAGE
    { key: "hsn", width: 14 },         // Col E: HSN CODE
    { key: "gst", width: 10 },         // Col F: GST (%)
    { key: "qty", width: 8 },          // Col G: QTY
    { key: "uom", width: 10 },         // Col H: UOM
    { key: "rate", width: 16 },        // Col I: UNIT RATE (INR)
    ...(effectiveShowDiscount ? [{ key: "disc", width: 14 }] : []), // Col J: DISCOUNT (%) if enabled
    { key: "total", width: 18 },       // Col J or K: TOTAL AMOUNT (INR)
  ];

  const lastColLetter = effectiveShowDiscount ? "K" : "J";
  const subTotalEndColLetter = effectiveShowDiscount ? "J" : "I";

  // Reusable border style
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFD6E0EC" } },
    bottom: { style: "thin", color: { argb: "FFD6E0EC" } },
    left: { style: "thin", color: { argb: "FFD6E0EC" } },
    right: { style: "thin", color: { argb: "FFD6E0EC" } },
  };

  // 1. Company Letterhead Header Card (Row 2) - Exactly matching user reference screenshot
  worksheet.getRow(2).height = 105;
  worksheet.mergeCells(`B2:${lastColLetter}2`);
  const headerCell = worksheet.getCell("B2");
  const compName = companyProfile?.companyName || "iSQUARE Safety Equipments Pvt. Ltd.";
  const companyAddr =
    "GOYAL RESIDENCY B, SR NO. 434/4A, OFFICE, B1/13, Kasarwadi, Maharashtra 411034";
  const companyPhone = companyProfile?.phone || "+91 9028815632";
  const companyEmail = companyProfile?.email || "sales@isquaresafety.com";
  const companyGstin = companyProfile?.gstin || "27AARCP3435C1ZD";
  const companyPan = companyProfile?.pan || "AARCP3435C";

  headerCell.value = {
    richText: [
      {
        font: { name: "Arial", size: 14, bold: true, color: { argb: "FF002B55" } },
        text: `${compName}\n`,
      },
      {
        font: { name: "Arial", size: 9.5, italic: true, bold: false, color: { argb: "FFFF7900" } },
        text: "The complete safety solution\n",
      },
      {
        font: { name: "Arial", size: 9, color: { argb: "FF4A5568" } },
        text: `${companyAddr}\n`,
      },
      {
        font: { name: "Arial", size: 9, color: { argb: "FF4A5568" } },
        text: `Contact: ${companyPhone}  |  Email: ${companyEmail}\n`,
      },
      {
        font: { name: "Arial", size: 9, bold: true, color: { argb: "FF002B55" } },
        text: `GSTIN : ${companyGstin}  |  PAN : ${companyPan}`,
      },
    ],
  };
  headerCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  headerCell.border = {
    top: { style: "medium", color: { argb: "FF2D6A4F" } }, // Dark green top border from reference
    bottom: { style: "medium", color: { argb: "FFFF7900" } }, // Vibrant orange bottom border
    left: { style: "thin", color: { argb: "FFD6E0EC" } },
    right: { style: "thin", color: { argb: "FFD6E0EC" } },
  };

  try {
    const parsedLogo = parseDataUrl(ISQUARE_LOGO_BASE64);
    const logoId = workbook.addImage({
      base64: parsedLogo.base64,
      extension: parsedLogo.extension,
    });
    // Position company logo on the left of Row 2, vertically centered
    worksheet.addImage(logoId, {
      tl: { col: 1.15, row: 1.25 },
      ext: { width: 145, height: 49 },
    });
  } catch (err) {
    console.warn("Could not embed company logo in Excel:", err);
  }

  // 2. Spacer row 3
  worksheet.getRow(3).height = 6;

  // 3. Quotation Reference Information Strip (Row 4)
  worksheet.getRow(4).height = 24;
  worksheet.mergeCells("B4:E4");
  const refCell = worksheet.getCell("B4");
  refCell.value = `Ref.: ${qNum}`;
  refCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  refCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  refCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };
  refCell.border = thinBorder;

  worksheet.mergeCells(`F4:${lastColLetter}4`);
  const dateCell = worksheet.getCell("F4");
  dateCell.value = `Date: ${formatExcelDate(quotation.quotationDate)}`;
  dateCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  dateCell.alignment = { vertical: "middle", horizontal: "right" };
  dateCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };
  dateCell.border = thinBorder;

  // Spacer row 5
  worksheet.getRow(5).height = 6;

  // 4. Customer Information Block (Rows 6 to 11)
  const custDetails = customer as CustomerDetails | null | undefined;
  const customerName =
    (quotation as any).companyName ||
    (quotation as any).customerName ||
    custDetails?.companyName ||
    "Customer";
  const customerAddress =
    custDetails?.billingAddress ||
    custDetails?.address ||
    "";
  const contactPerson =
    quotation.contactPerson ||
    custDetails?.contactPerson ||
    custDetails?.contactPersonName ||
    "";
  const contactPhone =
    (quotation as any).contactPhone ||
    (quotation as any).contactMobile ||
    custDetails?.phone ||
    custDetails?.mobile ||
    "";
  const contactEmail =
    (quotation as any).contactEmail ||
    custDetails?.email ||
    custDetails?.emailAddress ||
    "";

  // Row 6: To,
  worksheet.getRow(6).height = 18;
  worksheet.mergeCells(`B6:${lastColLetter}6`);
  const toCell = worksheet.getCell("B6");
  toCell.value = "To,";
  toCell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF64748B" } };
  toCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  toCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Row 7: Customer Company Name
  worksheet.getRow(7).height = 20;
  worksheet.mergeCells(`B7:${lastColLetter}7`);
  const cNameCell = worksheet.getCell("B7");
  cNameCell.value = customerName.toUpperCase();
  cNameCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF002B55" } };
  cNameCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  cNameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Row 8: Customer Address
  worksheet.getRow(8).height = customerAddress ? 24 : 16;
  worksheet.mergeCells(`B8:${lastColLetter}8`);
  const cAddrCell = worksheet.getCell("B8");
  cAddrCell.value = customerAddress || "—";
  cAddrCell.font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };
  cAddrCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true, indent: 1 };
  cAddrCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Row 9: Kind Attn
  worksheet.getRow(9).height = 18;
  worksheet.mergeCells(`B9:${lastColLetter}9`);
  const attnCell = worksheet.getCell("B9");
  attnCell.value = `Kind Attn: ${contactPerson || "—"}`;
  attnCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
  attnCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  attnCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Row 10: Mob. No.
  worksheet.getRow(10).height = 18;
  worksheet.mergeCells(`B10:${lastColLetter}10`);
  const mobCell = worksheet.getCell("B10");
  mobCell.value = `Mob. No.: ${contactPhone || "—"}`;
  mobCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
  mobCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  mobCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Row 11: Email id
  worksheet.getRow(11).height = 18;
  worksheet.mergeCells(`B11:${lastColLetter}11`);
  const emailCell = worksheet.getCell("B11");
  emailCell.value = `Email id: ${contactEmail || "—"}`;
  emailCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
  emailCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  emailCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };

  // Add border around customer card (rows 6-11)
  for (let r = 6; r <= 11; r++) {
    const row = worksheet.getRow(r);
    row.getCell("B").border = {
      ...row.getCell("B").border,
      left: { style: "thin", color: { argb: "FFD6E0EC" } },
      ...(r === 6 ? { top: { style: "thin", color: { argb: "FFD6E0EC" } } } : {}),
      ...(r === 11 ? { bottom: { style: "thin", color: { argb: "FFD6E0EC" } } } : {}),
    };
    row.getCell(lastColLetter).border = {
      ...row.getCell(lastColLetter).border,
      right: { style: "thin", color: { argb: "FFD6E0EC" } },
      ...(r === 6 ? { top: { style: "thin", color: { argb: "FFD6E0EC" } } } : {}),
      ...(r === 11 ? { bottom: { style: "thin", color: { argb: "FFD6E0EC" } } } : {}),
    };
  }

  // Spacer row 12
  worksheet.getRow(12).height = 6;

  // 5. Subject Highlighted Bar (Row 13)
  worksheet.getRow(13).height = 22;
  worksheet.mergeCells(`B13:${lastColLetter}13`);
  const subCell = worksheet.getCell("B13");
  subCell.value = "Sub: Offer for PPP";
  subCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } };
  subCell.border = {
    top: { style: "thin", color: { argb: "FFFED7AA" } },
    bottom: { style: "thin", color: { argb: "FFFED7AA" } },
    left: { style: "thin", color: { argb: "FFFED7AA" } },
    right: { style: "thin", color: { argb: "FFFED7AA" } },
  };

  // 6. Salutation & Intro (Rows 14 & 15)
  worksheet.getRow(14).height = 18;
  worksheet.mergeCells(`B14:${lastColLetter}14`);
  const salutationCell = worksheet.getCell("B14");
  salutationCell.value = "Dear Sir/Madam,";
  salutationCell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF002B55" } };
  salutationCell.alignment = { vertical: "middle", horizontal: "left" };

  worksheet.getRow(15).height = 18;
  worksheet.mergeCells(`B15:${lastColLetter}15`);
  const introCell = worksheet.getCell("B15");
  introCell.value = "We take pleasure in submitting our competitive offer for your requirement.";
  introCell.font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };
  introCell.alignment = { vertical: "middle", horizontal: "left" };

  // Spacer row 16
  worksheet.getRow(16).height = 6;

  // 7. Product Table Header (Row 17)
  const headerRowIdx = 17;
  worksheet.getRow(headerRowIdx).height = 26;

  const headers = [
    { key: "sr", title: "SR. NO." },
    { key: "desc", title: "DESCRIPTION" },
    { key: "img", title: "IMAGE" },
    { key: "hsn", title: "HSN CODE" },
    { key: "gst", title: "GST (%)" },
    { key: "qty", title: "QTY" },
    { key: "uom", title: "UOM" },
    { key: "rate", title: "UNIT RATE (INR)" },
    ...(effectiveShowDiscount ? [{ key: "disc", title: "DISCOUNT (%)" }] : []),
    { key: "total", title: "TOTAL AMOUNT (INR)" },
  ];

  headers.forEach((h) => {
    const cell = worksheet.getRow(headerRowIdx).getCell(h.key);
    cell.value = h.title;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF7900" }, // Vibrant Orange
    };
    cell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: h.key === "desc" ? "left" : (h.key === "rate" || h.key === "total") ? "right" : "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE06800" } },
      bottom: { style: "thin", color: { argb: "FFE06800" } },
      left: { style: "thin", color: { argb: "FFE06800" } },
      right: { style: "thin", color: { argb: "FFE06800" } },
    };
  });

  // 8. Populate Product Rows
  let currentRowIdx = 18;
  const items = quotation.items || [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const calc = calculateItemTotals(
      item.quantity,
      item.rate,
      item.discountPercentage,
      item.gstRate
    );

    const specText = item.specification ? `\r\n${item.specification}` : "";
    const description = `${item.itemName}${item.brand ? ` (${item.brand})` : ""}${specText}`;
    const matchedProd = masterProducts ? findProductFromMaster(item, masterProducts) : null;
    const hsn = item.hsnCode || (item as any).hsn || matchedProd?.hsnCode || "—";
    const itemImgSrc = getItemImageSource(item, masterProducts || []);

    const row = worksheet.getRow(currentRowIdx);
    const calculatedHeight = calculateDescriptionRowHeight(description, 48);
    row.height = calculatedHeight;

    // SR. NO.
    const srCell = row.getCell("sr");
    srCell.value = idx + 1;
    srCell.alignment = { vertical: "middle", horizontal: "center" };
    srCell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF102A50" } };
    srCell.border = thinBorder;

    // DESCRIPTION
    const descCell = row.getCell("desc");
    descCell.value = description;
    descCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    descCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
    descCell.border = thinBorder;

    // IMAGE
    const imgCell = row.getCell("img");
    imgCell.border = thinBorder;
    if (itemImgSrc) {
      try {
        const dataUrl = await loadImageAsDataUrl(itemImgSrc);
        if (dataUrl) {
          const parsed = parseDataUrl(dataUrl);
          const pImgId = workbook.addImage({
            base64: parsed.base64,
            extension: parsed.extension,
          });
          const verticalOffsetFraction = Math.max(
            0.05,
            (calculatedHeight - 55) / (2 * calculatedHeight)
          );
          worksheet.addImage(pImgId, {
            tl: { col: 3.18, row: currentRowIdx - 1 + verticalOffsetFraction },
            ext: { width: 70, height: 70 },
          });
        } else {
          imgCell.value = "—";
          imgCell.alignment = { vertical: "middle", horizontal: "center" };
        }
      } catch (err) {
        console.warn("Could not load product image for Excel:", err);
        imgCell.value = "—";
        imgCell.alignment = { vertical: "middle", horizontal: "center" };
      }
    } else {
      imgCell.value = "—";
      imgCell.alignment = { vertical: "middle", horizontal: "center" };
    }

    // HSN CODE
    const hsnCell = row.getCell("hsn");
    hsnCell.value = hsn;
    hsnCell.alignment = { vertical: "middle", horizontal: "center" };
    hsnCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
    hsnCell.border = thinBorder;

    // GST (%)
    const gstCell = row.getCell("gst");
    gstCell.value = `${item.gstRate}%`;
    gstCell.alignment = { vertical: "middle", horizontal: "center" };
    gstCell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF002B55" } };
    gstCell.border = thinBorder;

    // QTY
    const qtyCell = row.getCell("qty");
    qtyCell.value = item.quantity;
    qtyCell.alignment = { vertical: "middle", horizontal: "center" };
    qtyCell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF102A50" } };
    qtyCell.border = thinBorder;

    // UOM
    const uomCell = row.getCell("uom");
    uomCell.value = item.unitName || "Nos";
    uomCell.alignment = { vertical: "middle", horizontal: "center" };
    uomCell.font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };
    uomCell.border = thinBorder;

    // UNIT RATE (INR)
    const rateCell = row.getCell("rate");
    rateCell.value = item.rate;
    rateCell.numFmt = '"₹"#,##0.00';
    rateCell.alignment = { vertical: "middle", horizontal: "right" };
    rateCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
    rateCell.border = thinBorder;

    // DISCOUNT (%) if enabled
    if (effectiveShowDiscount) {
      const discCell = row.getCell("disc");
      discCell.value = `${item.discountPercentage}%`;
      discCell.alignment = { vertical: "middle", horizontal: "center" };
      discCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
      discCell.border = thinBorder;
    }

    // TOTAL AMOUNT (INR)
    const totCell = row.getCell("total");
    totCell.value = calc.lineTotal;
    totCell.numFmt = '"₹"#,##0.00';
    totCell.alignment = { vertical: "middle", horizontal: "right" };
    totCell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF102A50" } };
    totCell.border = thinBorder;

    currentRowIdx++;

    // Accessories linked to item
    for (let aIdx = 0; aIdx < (item.accessories || []).length; aIdx++) {
      const acc = item.accessories![aIdx];
      const aCalc = calculateItemTotals(
        acc.quantity,
        acc.rate,
        acc.discountPercentage,
        acc.gstRate
      );
      const accSpec = acc.specification ? `\r\n${acc.specification}` : "";
      const accDesc = `  ↳ [Accessory] ${acc.itemName}${accSpec}`;
      const accHsn = (acc as any).hsnCode || (acc as any).hsn || "—";
      const accImgSrc = getItemImageSource(acc, masterProducts || []);

      const aRow = worksheet.getRow(currentRowIdx);
      const accHeight = calculateDescriptionRowHeight(accDesc, 48);
      aRow.height = accHeight;

      const aSrCell = aRow.getCell("sr");
      aSrCell.value = `${idx + 1}.${aIdx + 1}`;
      aSrCell.alignment = { vertical: "middle", horizontal: "center" };
      aSrCell.font = { name: "Arial", size: 8, color: { argb: "FF64748B" } };
      aSrCell.border = thinBorder;

      const aDescCell = aRow.getCell("desc");
      aDescCell.value = accDesc;
      aDescCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      aDescCell.font = { name: "Arial", size: 8, color: { argb: "FF102A50" } };
      aDescCell.border = thinBorder;

      const aImgCell = aRow.getCell("img");
      aImgCell.border = thinBorder;
      if (accImgSrc) {
        try {
          const aDataUrl = await loadImageAsDataUrl(accImgSrc);
          if (aDataUrl) {
            const aParsed = parseDataUrl(aDataUrl);
            const aImgId = workbook.addImage({
              base64: aParsed.base64,
              extension: aParsed.extension,
            });
            const accVerticalOffsetFraction = Math.max(
              0.05,
              (accHeight - 45) / (2 * accHeight)
            );
            worksheet.addImage(aImgId, {
              tl: { col: 3.25, row: currentRowIdx - 1 + accVerticalOffsetFraction },
              ext: { width: 55, height: 55 },
            });
          } else {
            aImgCell.value = "—";
            aImgCell.alignment = { vertical: "middle", horizontal: "center" };
          }
        } catch {
          aImgCell.value = "—";
          aImgCell.alignment = { vertical: "middle", horizontal: "center" };
        }
      } else {
        aImgCell.value = "—";
        aImgCell.alignment = { vertical: "middle", horizontal: "center" };
      }

      const aHsnCell = aRow.getCell("hsn");
      aHsnCell.value = accHsn;
      aHsnCell.alignment = { vertical: "middle", horizontal: "center" };
      aHsnCell.font = { name: "Arial", size: 8, color: { argb: "FF64748B" } };
      aHsnCell.border = thinBorder;

      const aGstCell = aRow.getCell("gst");
      aGstCell.value = `${acc.gstRate}%`;
      aGstCell.alignment = { vertical: "middle", horizontal: "center" };
      aGstCell.font = { name: "Arial", size: 8, bold: true, color: { argb: "FF002B55" } };
      aGstCell.border = thinBorder;

      const aQtyCell = aRow.getCell("qty");
      aQtyCell.value = acc.quantity;
      aQtyCell.alignment = { vertical: "middle", horizontal: "center" };
      aQtyCell.font = { name: "Arial", size: 8, color: { argb: "FF102A50" } };
      aQtyCell.border = thinBorder;

      const aUomCell = aRow.getCell("uom");
      aUomCell.value = acc.unitName || "Nos";
      aUomCell.alignment = { vertical: "middle", horizontal: "center" };
      aUomCell.font = { name: "Arial", size: 8, color: { argb: "FF64748B" } };
      aUomCell.border = thinBorder;

      const aRateCell = aRow.getCell("rate");
      aRateCell.value = acc.rate;
      aRateCell.numFmt = '"₹"#,##0.00';
      aRateCell.alignment = { vertical: "middle", horizontal: "right" };
      aRateCell.font = { name: "Arial", size: 8, color: { argb: "FF102A50" } };
      aRateCell.border = thinBorder;

      if (effectiveShowDiscount) {
        const aDiscCell = aRow.getCell("disc");
        aDiscCell.value = `${acc.discountPercentage}%`;
        aDiscCell.alignment = { vertical: "middle", horizontal: "center" };
        aDiscCell.font = { name: "Arial", size: 8, color: { argb: "FF102A50" } };
        aDiscCell.border = thinBorder;
      }

      const aTotCell = aRow.getCell("total");
      aTotCell.value = aCalc.lineTotal;
      aTotCell.numFmt = '"₹"#,##0.00';
      aTotCell.alignment = { vertical: "middle", horizontal: "right" };
      aTotCell.font = { name: "Arial", size: 8, bold: true, color: { argb: "FF102A50" } };
      aTotCell.border = thinBorder;

      currentRowIdx++;
    }
  }

  // 9. Sub Total Row
  const calculatedSubTotal =
    (quotation.items || []).reduce((acc, itm) => {
      const itmTot = calculateItemTotals(
        itm.quantity,
        itm.rate,
        itm.discountPercentage,
        itm.gstRate
      ).lineTotal;
      const accTot = (itm.accessories || []).reduce((aAcc, a) => {
        return (
          aAcc +
          calculateItemTotals(
            a.quantity,
            a.rate,
            a.discountPercentage,
            a.gstRate
          ).lineTotal
        );
      }, 0);
      return acc + itmTot + accTot;
    }, 0) || quotation.grandTotal || 0;

  worksheet.getRow(currentRowIdx).height = 26;
  worksheet.mergeCells(`B${currentRowIdx}:${subTotalEndColLetter}${currentRowIdx}`);
  const subTotalLabelCell = worksheet.getCell(`B${currentRowIdx}`);
  subTotalLabelCell.value = "SUB TOTAL";
  subTotalLabelCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  subTotalLabelCell.alignment = { vertical: "middle", horizontal: "right" };
  subTotalLabelCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F8FC" },
  };
  subTotalLabelCell.border = {
    top: { style: "thin", color: { argb: "FFD6E0EC" } },
    bottom: { style: "thin", color: { argb: "FFD6E0EC" } },
    left: { style: "thin", color: { argb: "FFD6E0EC" } },
    right: { style: "thin", color: { argb: "FFD6E0EC" } },
  };

  const subTotalAmountCell = worksheet.getCell(`${lastColLetter}${currentRowIdx}`);
  subTotalAmountCell.value = calculatedSubTotal;
  subTotalAmountCell.numFmt = '"₹"#,##0.00';
  subTotalAmountCell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFF7900" } };
  subTotalAmountCell.alignment = { vertical: "middle", horizontal: "right" };
  subTotalAmountCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F8FC" },
  };
  subTotalAmountCell.border = {
    top: { style: "thin", color: { argb: "FFD6E0EC" } },
    bottom: { style: "thin", color: { argb: "FFD6E0EC" } },
    left: { style: "thin", color: { argb: "FFD6E0EC" } },
    right: { style: "thin", color: { argb: "FFD6E0EC" } },
  };

  currentRowIdx += 2; // Spacer

  // 10. Commercial Terms
  let defaultTerms: string[] = [];
  if (quotation.termsAndConditions && quotation.termsAndConditions.trim()) {
    defaultTerms = quotation.termsAndConditions
      .split(/\r?\n/)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/Mumbai/gi, "Pune").trim())
      .filter(Boolean);
  } else {
    defaultTerms = [
      "Taxes extra as applicable.",
      "Prices firm for validity period.",
      "Goods once sold will not be taken back.",
      "Subject to Pune Jurisdiction.",
    ];
  }

  worksheet.getRow(currentRowIdx).height = 20;
  worksheet.mergeCells(`B${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
  const termsHeaderCell = worksheet.getCell(`B${currentRowIdx}`);
  termsHeaderCell.value = "COMMERCIAL TERMS";
  termsHeaderCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  termsHeaderCell.alignment = { vertical: "middle", horizontal: "left" };
  currentRowIdx++;

  defaultTerms.forEach((term, tIdx) => {
    worksheet.getRow(currentRowIdx).height = 18;
    worksheet.mergeCells(`B${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
    const termCell = worksheet.getCell(`B${currentRowIdx}`);
    termCell.value = `${tIdx + 1})  ${term}`;
    termCell.font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
    termCell.alignment = { vertical: "middle", horizontal: "left" };
    currentRowIdx++;
  });

  currentRowIdx++; // Spacer

  // 11. Company Authorization Closing
  worksheet.getRow(currentRowIdx).height = 18;
  worksheet.getCell(`B${currentRowIdx}`).value = "Thanking you,";
  worksheet.getCell(`B${currentRowIdx}`).font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
  currentRowIdx++;

  worksheet.getRow(currentRowIdx).height = 18;
  worksheet.getCell(`B${currentRowIdx}`).value = "Yours faithfully,";
  worksheet.getCell(`B${currentRowIdx}`).font = { name: "Arial", size: 8.5, color: { argb: "FF102A50" } };
  currentRowIdx++;

  worksheet.getRow(currentRowIdx).height = 20;
  worksheet.mergeCells(`B${currentRowIdx}:E${currentRowIdx}`);
  const forCompCell = worksheet.getCell(`B${currentRowIdx}`);
  forCompCell.value = `For ${companyProfile?.companyName || "iSQUARE Safety Equipments Pvt. Ltd."}`;
  forCompCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF002B55" } };
  currentRowIdx++;

  // 12. Circular Blue Company Stamp
  worksheet.getRow(currentRowIdx).height = 68;
  try {
    const parsedStamp = parseDataUrl(ISQUARE_SEAL_BASE64);
    const stampId = workbook.addImage({
      base64: parsedStamp.base64,
      extension: parsedStamp.extension,
    });
    worksheet.addImage(stampId, {
      tl: { col: 1.1, row: currentRowIdx - 0.9 },
      ext: { width: 75, height: 75 },
    });
  } catch (err) {
    console.warn("Could not embed company stamp in Excel:", err);
  }
  currentRowIdx += 2;

  // 13. Centered Contact Note
  worksheet.getRow(currentRowIdx).height = 3.5;
  worksheet.mergeCells(`B${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
  worksheet.getCell(`B${currentRowIdx}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD6E0EC" },
  };
  currentRowIdx++;

  worksheet.getRow(currentRowIdx).height = 32;
  worksheet.mergeCells(`B${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
  const noteCell = worksheet.getCell(`B${currentRowIdx}`);
  noteCell.value =
    "Note: If you need any clarification or further assistance please feel free to contact\r\nMr. Irfan Attar";
  noteCell.font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };
  noteCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  // Set repeating headers for print
  worksheet.pageSetup.printTitlesRow = `${headerRowIdx}:${headerRowIdx}`;

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${qNum}_CustomerQuotation.xlsx`);
}

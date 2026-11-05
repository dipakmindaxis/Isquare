import * as XLSX from "xlsx";
import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import type { ProductImportRow, ProductImportResult } from "../models/quotationModels";
import { productService, resolveUomId } from "./quotationService";

/**
 * Robust client-side parser for Product Excel workbooks.
 * Automatically scans all sheets, auto-detects header rows, and maps flexible column headers
 * including "Code/Name of item", "List Price", "Tax", "Images", and standard formats.
 */
export async function parseProductWorkbook(
  file: File,
  existingCodeSet: Set<string>
): Promise<{ rows: ProductImportRow[]; sheetName: string }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Uploaded Excel file contains no worksheets.");
  }

  // Automatically scan all worksheets to detect the best sheet with product data
  let bestRawData: any[][] = [];
  let bestHeaderRowIdx = 0;
  let maxScore = -1;
  let matchedSheetName = workbook.SheetNames[0];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (!rows || rows.length === 0) continue;

    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const cells = rows[r].map((c: any) =>
        String(c || "")
          .trim()
          .toLowerCase()
          .replace(/[*\-_.\/\\#]/g, " ")
          .replace(/\s+/g, " ")
      );
      let score = 0;
      for (const cell of cells) {
        if (
          cell.includes("code") ||
          cell.includes("name") ||
          cell.includes("item") ||
          cell.includes("description") ||
          cell.includes("price") ||
          cell.includes("rate") ||
          cell.includes("hsn") ||
          cell.includes("tax") ||
          cell.includes("gst") ||
          cell.includes("uom") ||
          cell.includes("stock") ||
          cell.includes("sr no")
        ) {
          score++;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestHeaderRowIdx = r;
        bestRawData = rows;
        matchedSheetName = sheetName;
      }
    }
  }

  if (!bestRawData || bestRawData.length <= bestHeaderRowIdx + 1) {
    throw new Error(`Excel sheet '${matchedSheetName}' is empty or contains no data rows.`);
  }

  const rawHeaderRow = bestRawData[bestHeaderRowIdx];
  const headers = rawHeaderRow.map((h: any) =>
    String(h || "")
      .trim()
      .toLowerCase()
      .replace(/[*\-_.\/\\#]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  const getColIdx = (...aliases: string[]): number => {
    const cleanedAliases = aliases.map((a) =>
      a.toLowerCase().replace(/[*\-_.\/\\#]/g, " ").replace(/\s+/g, " ").trim()
    );
    // 1. Exact match first
    for (const alias of cleanedAliases) {
      const idx = headers.findIndex((h) => h === alias);
      if (idx !== -1) return idx;
    }
    // 2. Substring match
    for (const alias of cleanedAliases) {
      const idx = headers.findIndex((h) => h.includes(alias));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const combinedCodeNameIdx = getColIdx(
    "code name of item",
    "code name",
    "item code name",
    "item code product name"
  );

  let itemCodeIdx = getColIdx(
    "item code",
    "product code",
    "itemcode",
    "sku",
    "part no",
    "part number",
    "model no",
    "article no",
    "code"
  );
  if (itemCodeIdx === combinedCodeNameIdx) {
    itemCodeIdx = -1;
  }

  let productNameIdx = getColIdx(
    "product name",
    "productname",
    "item name",
    "itemname",
    "name of item",
    "code name of item",
    "product",
    "item",
    "name",
    "title",
    "material description"
  );

  const brandIdx = getColIdx("brand", "manufacturer", "make", "vendor", "company");
  const specIdx = getColIdx("technical specification", "specification", "description", "spec", "details", "specs");
  const hsnIdx = getColIdx("hsn code", "hsncode", "hsn", "sac", "sac code");
  const uomIdx = getColIdx("default uom", "uom", "unit", "unitname", "unit of measurement", "measurement unit");
  const stdRateIdx = getColIdx(
    "standard rate",
    "standardrate",
    "list price",
    "selling price",
    "sales price",
    "unit price",
    "rate",
    "price",
    "mrp",
    "basic rate"
  );
  const gstRateIdx = getColIdx("gst rate", "gstrate", "gst %", "gst", "tax", "tax rate", "tax %", "vat");
  const purchaseRateIdx = getColIdx(
    "purchase rate",
    "purchaserate",
    "cost price",
    "cost",
    "buying price",
    "purchase price"
  );
  const profitIdx = getColIdx("profit %", "profitpercentage", "profit", "margin %", "margin");
  const stockIdx = getColIdx("stock quantity", "stock", "quantity", "qty", "inventory");
  const imgIdx = getColIdx("product image", "productimage", "image url", "images", "image", "picture", "photo");

  // Fallback if no product name column is matched
  if (productNameIdx === -1) {
    if (specIdx !== -1) {
      productNameIdx = specIdx;
    } else if (headers.length > 1) {
      productNameIdx = 1;
    } else {
      throw new Error("Could not find 'Product Name' or 'Code/Name of item' column in Excel file.");
    }
  }

  const extracted: ProductImportRow[] = [];
  const seenInFile = new Set<string>();

  for (let i = bestHeaderRowIdx + 1; i < bestRawData.length; i++) {
    const row = bestRawData[i];
    if (!row || row.every((c: any) => String(c).trim() === "")) {
      continue;
    }

    const rowNum = i + 1;
    const errors: string[] = [];

    const getVal = (idx: number): string => (idx !== -1 && row[idx] != null ? String(row[idx]).trim() : "");

    let rawCode = getVal(itemCodeIdx);
    let rawName = getVal(productNameIdx);
    const rawBrand = getVal(brandIdx);
    const rawSpec = getVal(specIdx);
    const rawHsn = getVal(hsnIdx);
    const rawUom = getVal(uomIdx) || "Nos";
    const rawStdRate = getVal(stdRateIdx);
    const rawGstRate = getVal(gstRateIdx);
    const rawPurchaseRate = getVal(purchaseRateIdx);
    const rawProfit = getVal(profitIdx);
    const rawStock = getVal(stockIdx);
    const rawImage = getVal(imgIdx);

    // Smart extraction for combined "Code/Name of item":
    if (!rawCode && rawName) {
      const codeMatch = rawName.match(/^([A-Za-z0-9_\-\.\/]+)\s+(.+)$/);
      if (codeMatch && codeMatch[1].length <= 35 && !codeMatch[1].toLowerCase().startsWith("http")) {
        rawCode = codeMatch[1].trim();
      }
    }

    // 1. Mandatory Product Name
    if (!rawName) {
      if (rawSpec) {
        rawName = rawSpec.split("\n")[0].substring(0, 150);
      } else {
        errors.push("Product Name is mandatory.");
      }
    }

    // 2. Duplicate Item Code check
    if (rawCode) {
      const lowerCode = rawCode.toLowerCase();
      if (seenInFile.has(lowerCode)) {
        errors.push(`Duplicate Item Code '${rawCode}' in uploaded file.`);
      } else {
        seenInFile.add(lowerCode);
      }

      if (existingCodeSet.has(lowerCode)) {
        errors.push(`Item Code '${rawCode}' already exists in database.`);
      }
    }

    // 3. Numeric Rates & Currency Cleanup (handles ₹, $, commas, etc.)
    let stdRate = 0;
    const cleanStd = String(rawStdRate || "").replace(/[^0-9.-]/g, "");
    const cleanPurchase = String(rawPurchaseRate || "").replace(/[^0-9.-]/g, "");

    if (cleanStd && !isNaN(Number(cleanStd)) && Number(cleanStd) >= 0) {
      stdRate = Number(cleanStd);
    } else if (cleanPurchase && !isNaN(Number(cleanPurchase)) && Number(cleanPurchase) >= 0) {
      stdRate = Number(cleanPurchase);
    } else {
      errors.push("Standard Rate (or List Price) is required.");
    }

    let gstRate = 18;
    if (rawGstRate) {
      const cleanGst = String(rawGstRate || "").replace(/[^0-9.-]/g, "");
      const num = Number(cleanGst);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push("GST Rate must be between 0 and 100.");
      } else {
        gstRate = num;
      }
    }

    let purchaseRate: number | null = null;
    if (cleanPurchase) {
      const num = Number(cleanPurchase);
      if (!isNaN(num)) {
        purchaseRate = num;
      }
    }

    let profitPercentage: number | null = null;
    if (rawProfit) {
      const cleanProfit = String(rawProfit || "").replace(/[^0-9.-]/g, "");
      const num = Number(cleanProfit);
      if (!isNaN(num)) {
        profitPercentage = num;
      }
    } else if (purchaseRate != null && stdRate > 0 && purchaseRate > 0) {
      profitPercentage = Number((((stdRate - purchaseRate) / purchaseRate) * 100).toFixed(1));
    }

    let stock: number | null = null;
    if (rawStock) {
      const cleanStock = String(rawStock || "").replace(/[^0-9.-]/g, "");
      const num = Number(cleanStock);
      if (!isNaN(num)) {
        stock = Math.round(num);
      }
    }

    const uomId = resolveUomId(rawUom);

    // Sanitize image: Ignore object dumps or invalid text
    let cleanImageStr: string | undefined = undefined;
    if (rawImage && typeof rawImage === "string" && rawImage.trim() !== "" && rawImage !== "[object Object]") {
      cleanImageStr = rawImage.trim();
    }

    extracted.push({
      rowIndex: rowNum,
      itemCode: rawCode || undefined,
      productName: rawName,
      brand: rawBrand || "ISQUARE",
      specification: rawSpec || undefined,
      defaultUom: rawUom,
      unitOfMeasurementId: uomId,
      standardRate: stdRate,
      gstRate,
      hsnCode: rawHsn || undefined,
      purchaseRate,
      profitPercentage,
      stock,
      productImage: cleanImageStr,
      isValid: errors.length === 0,
      validationErrors: errors,
    });
  }

  return { rows: extracted, sheetName: matchedSheetName };
}

export const productImportService = {
  importExcel: async (file: File): Promise<ProductImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ProductImportResult>(
      `${API_ENDPOINTS.Products}/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  bulkImport: async (records: ProductImportRow[]): Promise<ProductImportResult> => {
    const response = await apiClient.post<ProductImportResult>(
      `${API_ENDPOINTS.Products}/bulk-import`,
      records
    );
    return response.data;
  },

  fallbackImportSequential: async (records: ProductImportRow[]): Promise<ProductImportResult> => {
    const result: ProductImportResult = {
      totalRecords: records.length,
      successCount: 0,
      duplicateCount: 0,
      failedCount: 0,
      errors: [],
      importedProducts: [],
    };

    for (const row of records) {
      if (!row.isValid) {
        result.failedCount++;
        result.errors.push({
          rowNumber: row.rowIndex,
          itemCode: row.itemCode,
          productName: row.productName,
          errorMessage: row.validationErrors.join("; "),
        });
        continue;
      }

      try {
        const created = await productService.create({
          itemCode: row.itemCode?.trim() || undefined,
          productName: row.productName.trim(),
          brand: row.brand?.trim() || undefined,
          specification: row.specification?.trim() || undefined,
          hsnCode: row.hsnCode?.trim() || null,
          unitOfMeasurementId: row.unitOfMeasurementId || 1,
          unitName: row.defaultUom?.trim() || "Nos",
          uom: row.defaultUom?.trim() || "Nos",
          standardRate: Number(row.standardRate) || 0,
          gstRate: row.gstRate != null ? Number(row.gstRate) : 18,
          purchaseRate: row.purchaseRate != null ? Number(row.purchaseRate) : null,
          profitPercentage: row.profitPercentage != null ? Number(row.profitPercentage) : null,
          stock: row.stock != null ? Math.round(Number(row.stock)) : null,
          productImage: row.productImage?.trim() || undefined,
          isActive: true,
          isDeleted: false,
        });

        result.successCount++;
        result.importedProducts.push(created);
      } catch (err: any) {
        result.failedCount++;
        result.errors.push({
          rowNumber: row.rowIndex,
          itemCode: row.itemCode,
          productName: row.productName,
          errorMessage: err?.response?.data?.message || err?.message || "Failed to save record",
        });
      }
    }

    result.message = `Import completed: ${result.successCount} succeeded, ${result.failedCount} failed.`;
    return result;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get(`${API_ENDPOINTS.Products}/import-template`, {
      responseType: "blob",
    });
    return response.data;
  },
};

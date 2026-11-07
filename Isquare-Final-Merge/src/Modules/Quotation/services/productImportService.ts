import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import apiClient from "../../../API/apiClient";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import type { Product, ProductImportRow, ProductImportResult } from "../models/quotationModels";
import { productService, resolveUomId, saveProductImageCache } from "./quotationService";

/**
 * Fast helper to convert binary buffer chunks to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

export interface ParsedWorkbookResult {
  rows: ProductImportRow[];
  sheetName: string;
  availableSheets: string[];
}

/**
 * Robust enterprise parser for Product Excel workbooks.
 * - Auto-detects the product catalog sheet (prioritizes embedded drawings/images & product columns, heavily penalizes customer sheets)
 * - Allows explicit worksheet selection for multi-sheet workbooks
 * - Extracts embedded drawing pictures via ExcelJS with dual anchor coordinates + sequential ordering
 * - Caches base64 images in localStorage under multiple key variations
 * - Identifies existing products so images can be updated rather than rejecting them as errors
 */
export async function parseProductWorkbook(
  file: File,
  existingProducts: Product[],
  requestedSheetName?: string
): Promise<ParsedWorkbookResult> {
  const buffer = await file.arrayBuffer();

  // Load via ExcelJS to inspect sheets and embedded drawing objects
  const excelWb = new ExcelJS.Workbook();
  try {
    await excelWb.xlsx.load(buffer.slice(0));
  } catch (e) {
    console.warn("ExcelJS could not read workbook stream directly:", e);
  }

  // Load via XLSX for cell data
  const workbook = XLSX.read(buffer, { type: "array" });
  const availableSheets: string[] = workbook.SheetNames || [];

  if (availableSheets.length === 0) {
    throw new Error("Uploaded Excel file contains no worksheets.");
  }

  // Determine the best worksheet to parse
  let matchedSheetName = availableSheets[0];
  let bestHeaderRowIdx = 0;
  let bestRawData: any[][] = [];
  let maxScore = -999999;

  if (requestedSheetName && availableSheets.includes(requestedSheetName)) {
    matchedSheetName = requestedSheetName;
    const ws = workbook.Sheets[matchedSheetName];
    bestRawData = ws ? XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) : [];
    // Auto-detect header row inside requested sheet
    let bestRowScore = -999999;
    for (let r = 0; r < Math.min(bestRawData.length, 10); r++) {
      const cells = (bestRawData[r] || []).map((c: any) =>
        String(c || "").trim().toLowerCase().replace(/[*\-_.\/\\#]/g, " ").replace(/\s+/g, " ")
      );
      let s = 0;
      for (const cell of cells) {
        if (!cell) continue;
        if (cell.includes("code") || cell.includes("name") || cell.includes("item") || cell.includes("desc")) s += 20;
        if (cell.includes("rate") || cell.includes("price") || cell.includes("hsn") || cell.includes("uom") || cell.includes("image")) s += 20;
      }
      if (s > bestRowScore) {
        bestRowScore = s;
        bestHeaderRowIdx = r;
      }
    }
  } else {
    // Intelligent auto-detection across all worksheets
    for (const sheetName of availableSheets) {
      const wsXlsx = workbook.Sheets[sheetName];
      if (!wsXlsx) continue;
      const rows: any[][] = XLSX.utils.sheet_to_json(wsXlsx, { header: 1, defval: "" });
      if (!rows || rows.length === 0) continue;

      let sheetScore = 0;
      const sNameLower = sheetName.trim().toLowerCase();

      // Check embedded drawing count from ExcelJS
      const excelWs = excelWb.getWorksheet(sheetName) || excelWb.worksheets.find(
        (w) => w.name.trim().toLowerCase() === sNameLower
      );
      const imageCount = (excelWs && typeof excelWs.getImages === "function") ? excelWs.getImages().length : 0;
      if (imageCount > 0) {
        sheetScore += 2500 + (imageCount * 100); // Decisive bonus for sheets containing product photos
      }

      // Name-based hints
      if (sNameLower.includes("product") || sNameLower.includes("item") || sNameLower.includes("catalog") || sNameLower.includes("price")) {
        sheetScore += 300;
      } else if (sNameLower.includes("sheet3")) {
        sheetScore += 250;
      }

      // Severe penalty for customer / lead / employee sheets
      if (
        sNameLower.includes("customer") ||
        sNameLower.includes("cust") ||
        sNameLower.includes("client") ||
        sNameLower.includes("lead") ||
        sNameLower.includes("employee") ||
        sNameLower.includes("vendor") ||
        sNameLower.includes("contact")
      ) {
        sheetScore -= 1500;
      }

      // Header row search within this sheet
      let bestRowScore = -999999;
      let bestRowIdx = 0;

      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const cells = (rows[r] || []).map((c: any) =>
          String(c || "").trim().toLowerCase().replace(/[*\-_.\/\\#]/g, " ").replace(/\s+/g, " ")
        );
        let rowScore = 0;
        for (const cell of cells) {
          if (!cell) continue;

          // Product catalog indicators
          if (cell.includes("images") || cell.includes("image") || cell.includes("picture") || cell.includes("photo")) rowScore += 100;
          if (cell.includes("code name of item") || cell.includes("name of item") || cell.includes("product name")) rowScore += 90;
          if (cell.includes("item code") || cell.includes("product code") || cell.includes("itemcode") || cell.includes("sku")) rowScore += 60;
          if (cell.includes("list price") || cell.includes("standard rate") || cell.includes("selling price") || cell.includes("purchase rate")) rowScore += 80;
          if (cell.includes("hsn") || cell.includes("sac")) rowScore += 50;
          if (cell.includes("uom") || cell.includes("unit")) rowScore += 40;
          if (cell.includes("description") || cell.includes("specification") || cell.includes("spec")) rowScore += 40;
          if (cell.includes("stock") || cell.includes("quantity") || cell.includes("qty")) rowScore += 30;
          if (cell.includes("tax") || cell.includes("gst")) rowScore += 20;
          if (cell.includes("sr no") || cell.includes("serial")) rowScore += 15;

          // Customer Master indicators (negative for product sheet)
          if (cell.includes("customer code") || cell.includes("cust code") || cell.includes("cust id") || cell.includes("customer name") || cell.includes("cust name")) {
            rowScore -= 400;
          }
          if (cell.includes("billing") || cell.includes("shipping") || cell.includes("contact person") || cell.includes("company name")) {
            rowScore -= 250;
          }
        }

        if (rowScore > bestRowScore) {
          bestRowScore = rowScore;
          bestRowIdx = r;
        }
      }

      const totalScore = sheetScore + bestRowScore;
      if (totalScore > maxScore) {
        maxScore = totalScore;
        matchedSheetName = sheetName;
        bestHeaderRowIdx = bestRowIdx;
        bestRawData = rows;
      }
    }
  }

  if (!bestRawData || bestRawData.length <= bestHeaderRowIdx + 1) {
    throw new Error(`Excel sheet '${matchedSheetName}' is empty or contains no data rows.`);
  }

  // Extract embedded drawing images from matched sheet using ExcelJS
  const rowImageMap = new Map<number, { dataUrl: string; extension: string }>();
  const orderedImages: { dataUrl: string; extension: string; topRow: number }[] = [];

  try {
    const ws = excelWb.getWorksheet(matchedSheetName) || excelWb.worksheets.find(
      (w) => w.name.trim().toLowerCase() === matchedSheetName.trim().toLowerCase()
    );

    if (ws && typeof ws.getImages === "function") {
      const rawImages = ws.getImages() || [];
      for (const img of rawImages) {
        try {
          const tl = img.range?.tl;
          const br = img.range?.br;
          const topRow = (tl as any)?.nativeRow != null ? Number((tl as any).nativeRow) : (tl as any)?.row != null ? Number((tl as any).row) : null;
          const bottomRow = (br as any)?.nativeRow != null ? Number((br as any).nativeRow) : (br as any)?.row != null ? Number((br as any).row) : topRow;

          const imgObj = excelWb.getImage(Number(img.imageId));
          if (imgObj && (imgObj.buffer || (imgObj as any).base64)) {
            const ext = imgObj.extension || "png";
            let dataUrl = "";
            if ((imgObj as any).base64) {
              const b64 = (imgObj as any).base64;
              dataUrl = b64.startsWith("data:") ? b64 : `data:image/${ext};base64,${b64}`;
            } else if (imgObj.buffer) {
              const bytes = new Uint8Array(imgObj.buffer);
              dataUrl = `data:image/${ext};base64,${uint8ArrayToBase64(bytes)}`;
            }

            if (dataUrl) {
              const item = { dataUrl, extension: ext, topRow: topRow ?? 0 };
              orderedImages.push(item);

              if (topRow != null) {
                const rStart = Math.floor(topRow) + 1;
                const rRound = Math.round(topRow) + 1;
                const rCenter = bottomRow != null ? Math.floor((topRow + bottomRow) / 2) + 1 : rStart;
                const rEnd = bottomRow != null ? Math.floor(bottomRow) + 1 : rStart;

                rowImageMap.set(rStart, item);
                rowImageMap.set(rRound, item);
                rowImageMap.set(rCenter, item);
                for (let r = rStart; r <= rEnd; r++) {
                  if (!rowImageMap.has(r)) {
                    rowImageMap.set(r, item);
                  }
                }
              }
            }
          }
        } catch (singleImgErr) {
          console.warn("Failed to extract single Excel image:", singleImgErr);
        }
      }
    }
  } catch (excelErr) {
    console.warn("ExcelJS drawing extraction failed, continuing with text-only images:", excelErr);
  }

  // Sort orderedImages from top to bottom
  orderedImages.sort((a, b) => a.topRow - b.topRow);

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
    for (const alias of cleanedAliases) {
      const idx = headers.findIndex((h) => h === alias);
      if (idx !== -1) return idx;
    }
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
  const imgIdx = getColIdx("images", "image", "product image url", "productimageurl", "image url", "imageurl", "product image", "productimage", "image file", "picture", "photo");

  if (productNameIdx === -1) {
    if (specIdx !== -1) {
      productNameIdx = specIdx;
    } else if (headers.length > 1) {
      productNameIdx = 1;
    } else {
      throw new Error(`Could not find 'Product Name' or 'Code/Name of item' column in worksheet '${matchedSheetName}'.`);
    }
  }

  const extracted: ProductImportRow[] = [];
  const seenNamesInFile = new Set<string>();

  let productCount = 0;

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

    // 2. Duplicate validation by ProductName (NOT ItemCode)
    let isExisting = false;
    let existingProductId: number | undefined = undefined;

    if (rawName && rawName.trim()) {
      const trimmedName = rawName.trim();
      const lowerName = trimmedName.toLowerCase();

      // Check duplicate within uploaded sheet
      if (seenNamesInFile.has(lowerName)) {
        errors.push(`Duplicate Product Name '${trimmedName}' found within the uploaded Excel file.`);
      } else {
        seenNamesInFile.add(lowerName);
      }

      // Check duplicate against existing database products
      const existing = existingProducts.find(
        (p) => !p.isDeleted && p.productName && p.productName.trim().toLowerCase() === lowerName
      );
      if (existing) {
        isExisting = true;
        existingProductId = existing.productId;
        errors.push(`Product Name '${trimmedName}' already exists in the Product Master database.`);
      }
    }
    // 3. Rates & Currency sanitization
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
      if (!isNaN(num)) purchaseRate = num;
    }

    let profitPercentage: number | null = null;
    if (rawProfit) {
      const cleanProfit = String(rawProfit || "").replace(/[^0-9.-]/g, "");
      const num = Number(cleanProfit);
      if (!isNaN(num)) profitPercentage = num;
    } else if (purchaseRate != null && stdRate > 0 && purchaseRate > 0) {
      profitPercentage = Number((((stdRate - purchaseRate) / purchaseRate) * 100).toFixed(1));
    }

    let stock: number | null = null;
    if (rawStock) {
      const cleanStock = String(rawStock || "").replace(/[^0-9.-]/g, "");
      const num = Number(cleanStock);
      if (!isNaN(num)) stock = Math.round(num);
    }

    const uomId = resolveUomId(rawUom);

    // 4. Robust Image Resolution
    // Priority A: Check anchor coordinates
    let extractedImg = rowImageMap.get(rowNum);

    // Priority B: If anchor coordinates missed due to custom row height, use vertical order
    if (!extractedImg && orderedImages.length > 0 && productCount < orderedImages.length) {
      extractedImg = orderedImages[productCount];
    }

    let cleanImageStr: string | undefined = undefined;
    let rowDataUrl: string | undefined = undefined;

    if (extractedImg && extractedImg.dataUrl) {
      rowDataUrl = extractedImg.dataUrl;
      const ext = extractedImg.extension || "png";
      const cleanCode = (rawCode || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = cleanCode ? `${cleanCode}.${ext}` : `excel_prod_${rowNum}.${ext}`;
      const imageRefPath = `/images/products/${fileName}`;

      // Cache image under all key variations for instant listing resolution
      saveProductImageCache(imageRefPath, rowDataUrl);
      saveProductImageCache(fileName, rowDataUrl);
      if (rawCode) {
        const c = rawCode.trim();
        saveProductImageCache(c, rowDataUrl);
        saveProductImageCache(c.toLowerCase(), rowDataUrl);
        saveProductImageCache(c.replace(/\s+/g, "-"), rowDataUrl);
        saveProductImageCache(c.replace(/\s+/g, "-").toLowerCase(), rowDataUrl);
        saveProductImageCache(c.replace(/-/g, " "), rowDataUrl);
        saveProductImageCache(c.replace(/-/g, " ").toLowerCase(), rowDataUrl);
      }
      if (rawName) {
        const n = rawName.trim();
        saveProductImageCache(n, rowDataUrl);
        saveProductImageCache(n.toLowerCase(), rowDataUrl);
      }

      cleanImageStr = imageRefPath;
    } else if (rawImage && typeof rawImage === "string" && rawImage.trim() !== "" && rawImage !== "[object Object]") {
      const trimmedImg = rawImage.trim();
      cleanImageStr = trimmedImg;
      if (/^(?:https?:|blob:|data:)/i.test(trimmedImg)) {
        rowDataUrl = trimmedImg;
        if (rawCode) saveProductImageCache(rawCode.trim(), trimmedImg);
        if (rawName) saveProductImageCache(rawName.trim(), trimmedImg);
      }
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
      imageDataUrl: rowDataUrl,
      isExisting,
      existingProductId,
      isValid: errors.length === 0,
      validationErrors: errors,
    });

    productCount++;
  }

  return {
    rows: extracted,
    sheetName: matchedSheetName,
    availableSheets,
  };
}

export const productImportService = {
  importExcel: async (file: File, zipFile?: File | null): Promise<ProductImportResult> => {
    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("file", file);
    if (zipFile) {
      formData.append("zipFile", zipFile);
    }
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
    // Ensure all images are persisted in localStorage cache
    for (const r of records) {
      const imgData = r.imageDataUrl;
      if (imgData) {
        if (r.productImage) saveProductImageCache(r.productImage, imgData);
        if (r.itemCode) {
          const c = r.itemCode.trim();
          saveProductImageCache(c, imgData);
          saveProductImageCache(c.toLowerCase(), imgData);
          saveProductImageCache(c.replace(/\s+/g, "-"), imgData);
          saveProductImageCache(c.replace(/\s+/g, "-").toLowerCase(), imgData);
          saveProductImageCache(c.replace(/-/g, " "), imgData);
          saveProductImageCache(c.replace(/-/g, " ").toLowerCase(), imgData);
        }
        if (r.productName) {
          const n = r.productName.trim();
          saveProductImageCache(n, imgData);
          saveProductImageCache(n.toLowerCase(), imgData);
        }
      }
    }

    const response = await apiClient.post<ProductImportResult>(
      `${API_ENDPOINTS.Products}/bulk-import`,
      records
    );

    if (response.data && response.data.importedProducts) {
      for (const p of response.data.importedProducts) {
        const matching = records.find(
          (r) =>
            (r.itemCode && p.itemCode && r.itemCode.toLowerCase() === p.itemCode.toLowerCase()) ||
            (r.productName && p.productName && r.productName.toLowerCase() === p.productName.toLowerCase())
        );
        if (matching && matching.imageDataUrl) {
          if (p.itemCode) saveProductImageCache(p.itemCode, matching.imageDataUrl);
          if (p.productName) saveProductImageCache(p.productName, matching.imageDataUrl);
          if (p.productImage) saveProductImageCache(p.productImage, matching.imageDataUrl);
        }
      }
    }

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
        // If product already exists in database, update its image and fields!
        if (row.isExisting && row.existingProductId) {
          await productService.update(row.existingProductId, {
            productImage: row.productImage?.trim() || undefined,
            standardRate: Number(row.standardRate) || 0,
            gstRate: row.gstRate != null ? Number(row.gstRate) : 18,
            purchaseRate: row.purchaseRate != null ? Number(row.purchaseRate) : null,
            profitPercentage: row.profitPercentage != null ? Number(row.profitPercentage) : null,
            stock: row.stock != null ? Math.round(Number(row.stock)) : null,
          });

          if (row.imageDataUrl) {
            if (row.itemCode) saveProductImageCache(row.itemCode, row.imageDataUrl);
            if (row.productName) saveProductImageCache(row.productName, row.imageDataUrl);
            if (row.productImage) saveProductImageCache(row.productImage, row.imageDataUrl);
          }

          result.successCount++;
          continue;
        }

        // New product creation
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

        if (row.imageDataUrl) {
          if (created.itemCode) {
            saveProductImageCache(created.itemCode, row.imageDataUrl);
            saveProductImageCache(created.itemCode.toLowerCase(), row.imageDataUrl);
          }
          if (created.productName) {
            saveProductImageCache(created.productName, row.imageDataUrl);
            saveProductImageCache(created.productName.toLowerCase(), row.imageDataUrl);
          }
          if (created.productImage) {
            saveProductImageCache(created.productImage, row.imageDataUrl);
          }
        }

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

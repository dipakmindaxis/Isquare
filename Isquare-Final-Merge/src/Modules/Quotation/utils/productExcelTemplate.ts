import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Columns matching Image 5 (Enterprise / Vendor catalog layout)
 */
export const IMAGE5_TEMPLATE_COLUMNS = [
  { header: "Sr.No", width: 8 },
  { header: "Item Code/Name of item", width: 38 },
  { header: "Description", width: 50 },
  { header: "Images", width: 20 },
  { header: "HSN Code", width: 14 },
  { header: "Tax", width: 10 },
  { header: "UOM", width: 10 },
  { header: "List Price", width: 14 },
  { header: "Total Amount", width: 14 },
  { header: "Purchase Rate", width: 14 },
  { header: "Profit %", width: 10 },
  { header: "Stock", width: 10 },
];

/**
 * Standard 12-column layout matching Add Product form (Image 4 & Section 3)
 */
export const STANDARD_TEMPLATE_COLUMNS = [
  { header: "Item Code", width: 14 },
  { header: "Brand / Manufacturer", width: 22 },
  { header: "Product Name *", width: 34 },
  { header: "Technical Specification", width: 45 },
  { header: "Product Image URL", width: 24 },
  { header: "HSN Code", width: 14 },
  { header: "Default UOM", width: 14 },
  { header: "Standard Rate *", width: 16 },
  { header: "GST Rate *", width: 12 },
  { header: "Purchase Rate", width: 16 },
  { header: "Profit %", width: 12 },
  { header: "Stock Quantity", width: 14 },
];

export function generateProductExcelTemplateBlob(): Blob {
  // Sheet 1: Image 5 layout (Vendor / Enterprise Catalog matching user's Excel)
  const image5Data = [
    IMAGE5_TEMPLATE_COLUMNS.map((c) => c.header),
    // Sample Row 1 (exact match to Image 5)
    [
      1,
      "ES-VCH-S Vinyl Coated Hasp - Small - Red (5 mm Shackle)",
      "Vinyl Coated Hasp - Small - Red (5 mm Shackle) • Material: High tensile steel sheet, electro-plated/powder-coated to prevent rusting",
      "",
      "8466.94.00",
      "18%",
      "EACH",
      175.0,
      175.0,
      175.0,
      0,
      50,
    ],
    // Sample Row 2
    [
      2,
      "PRD-101 Safety Helmet with Ratchet",
      "High-density polymer with 4-point suspension headband and chin strap",
      "",
      "650610",
      "18%",
      "Nos",
      450.0,
      450.0,
      320.0,
      40.6,
      150,
    ],
    // Sample Row 3
    [
      3,
      "PRD-102 Industrial Safety Shoes (Steel Toe)",
      "Genuine leather, oil-resistant PU sole, 200J steel toe cap",
      "",
      "640340",
      "18%",
      "Pair",
      1850.0,
      1850.0,
      1350.0,
      37.0,
      85,
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(image5Data);
  ws1["!cols"] = IMAGE5_TEMPLATE_COLUMNS.map((col) => ({ wch: col.width }));

  // Sheet 2: Standard Add Product Form layout (Image 4 & Section 3)
  const standardData = [
    STANDARD_TEMPLATE_COLUMNS.map((c) => c.header),
    [
      "PRD-001",
      "ISQUARE",
      "ES-VCH-S Vinyl Coated Hasp - Small - Red (5 mm Shackle)",
      "Vinyl Coated Hasp - Small - Red (5 mm Shackle)",
      "",
      "8466.94.00",
      "Nos",
      175.0,
      18,
      175.0,
      0,
      50,
    ],
    [
      "PRD-101",
      "ISQUARE",
      "Safety Helmet with Ratchet",
      "High-density polymer with 4-point suspension",
      "",
      "650610",
      "Nos",
      450.0,
      18,
      320.0,
      40.6,
      150,
    ],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(standardData);
  ws2["!cols"] = STANDARD_TEMPLATE_COLUMNS.map((col) => ({ wch: col.width }));

  // Sheet 3: Field Guidelines & Instructions
  const instructionsData = [
    ["iSQUARE CRM - Product Master Excel Import Guidelines"],
    [""],
    ["Excel Column (Image 5)", "Product Form Field (Image 4)", "Required?", "Guideline / Notes"],
    ["Item Code/Name of item", "Product Name & Item Code", "MANDATORY", "Item name. If prefixed with a code (e.g. 'ES-VCH-S Name'), code is automatically extracted."],
    ["Description", "Technical Specification", "Optional", "Detailed product specifications or notes."],
    ["Images", "Product Image", "Optional", "Product image file name, server path or URL."],
    ["HSN Code", "HSN Code", "Optional", "GST Harmonized System code (e.g. 8466.94.00)."],
    ["Tax", "GST Rate (%)", "MANDATORY", "GST percentage (e.g. 18% or 18). Default is 18."],
    ["UOM", "Default UOM", "Optional", "Unit of measure (Nos, Pcs, EACH, Pair, Set, Kg). Defaults to Nos."],
    ["List Price", "Standard Rate (₹)", "MANDATORY", "Selling rate excluding GST. Currency symbols (₹, $) are automatically stripped."],
    ["Purchase Rate", "Purchase Rate (₹)", "Optional", "Cost price. Must be numeric."],
    ["Profit %", "Profit %", "Optional", "Profit margin percentage. Auto-calculated if left blank."],
    ["Stock", "Stock Quantity", "Optional", "Available inventory quantity."],
    ["Brand / Manufacturer", "Brand / Manufacturer", "Optional", "Defaults to 'ISQUARE' when left blank."],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions["!cols"] = [{ wch: 25 }, { wch: 28 }, { wch: 15 }, { wch: 75 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Sheet3"); // Named Sheet3 or Product Catalog to match user's workbook
  XLSX.utils.book_append_sheet(wb, ws2, "Standard Template");
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadProductExcelTemplate(fileName = "Product_Import_Template.xlsx"): void {
  const blob = generateProductExcelTemplateBlob();
  saveAs(blob, fileName);
}

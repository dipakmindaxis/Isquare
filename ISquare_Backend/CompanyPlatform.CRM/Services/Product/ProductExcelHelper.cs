using System.Drawing;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using CompanyPlatform.CRM.DTO.Product;

namespace CompanyPlatform.CRM.Services.Product
{
    public static class ProductExcelHelper
    {
        public static List<ProductExcelRowDto> ParseExcel(Stream stream)
        {
            var rows = new List<ProductExcelRowDto>();

            using var package = new ExcelPackage(stream);

            // Automatically scan all worksheets to find the one with product columns/data
            ExcelWorksheet worksheet = null;
            int headerRow = 1;
            int maxScore = -1;

            foreach (var ws in package.Workbook.Worksheets)
            {
                if (ws.Dimension == null) continue;
                for (int r = 1; r <= Math.Min(ws.Dimension.Rows, 10); r++)
                {
                    int score = 0;
                    for (int c = 1; c <= ws.Dimension.Columns; c++)
                    {
                        var text = ws.Cells[r, c].Text?.Trim().ToLower() ?? "";
                        if (text.Contains("code") || text.Contains("name") || text.Contains("item") ||
                            text.Contains("description") || text.Contains("price") || text.Contains("rate") ||
                            text.Contains("hsn") || text.Contains("tax") || text.Contains("gst") ||
                            text.Contains("uom") || text.Contains("stock") || text.Contains("sr no"))
                        {
                            score++;
                        }
                    }
                    if (score > maxScore)
                    {
                        maxScore = score;
                        worksheet = ws;
                        headerRow = r;
                    }
                }
            }

            if (worksheet == null || worksheet.Dimension == null)
            {
                worksheet = package.Workbook.Worksheets.FirstOrDefault();
            }

            if (worksheet == null || worksheet.Dimension == null)
            {
                return rows;
            }

            int rowCount = worksheet.Dimension.Rows;
            int colCount = worksheet.Dimension.Columns;

            // Map headers from detected headerRow
            var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            for (int col = 1; col <= colCount; col++)
            {
                var header = worksheet.Cells[headerRow, col].Text?.Trim();
                if (!string.IsNullOrEmpty(header))
                {
                    var cleanHeader = System.Text.RegularExpressions.Regex.Replace(header, @"[*\-_.\/\\#]", " ").Trim();
                    cleanHeader = System.Text.RegularExpressions.Regex.Replace(cleanHeader, @"\s+", " ");
                    if (!colMap.ContainsKey(cleanHeader))
                        colMap[cleanHeader] = col;

                    var rawClean = header.Replace("*", "").Trim();
                    if (!colMap.ContainsKey(rawClean))
                        colMap[rawClean] = col;
                }
            }

            int GetCol(params string[] aliases)
            {
                // Exact match first
                foreach (var alias in aliases)
                {
                    var norm = System.Text.RegularExpressions.Regex.Replace(alias, @"[*\-_.\/\\#]", " ").Trim();
                    norm = System.Text.RegularExpressions.Regex.Replace(norm, @"\s+", " ");
                    if (colMap.TryGetValue(norm, out int col))
                        return col;
                    if (colMap.TryGetValue(alias, out col))
                        return col;
                }
                // Partial match
                foreach (var alias in aliases)
                {
                    var norm = alias.ToLower();
                    foreach (var kvp in colMap)
                    {
                        if (kvp.Key.ToLower().Contains(norm))
                            return kvp.Value;
                    }
                }
                return -1;
            }

            int combinedCodeNameCol = GetCol("Code Name of item", "Code Name", "Item Code Name");
            int itemCodeCol = GetCol("Item Code", "Product Code", "ItemCode", "SKU", "Part No", "Model No", "Code");
            if (itemCodeCol == combinedCodeNameCol)
            {
                itemCodeCol = -1;
            }

            int productNameCol = GetCol("Product Name", "ProductName", "Item Name", "ItemName", "Name of item", "Code Name of item", "Name", "Product", "Item");
            int brandCol = GetCol("Brand", "Manufacturer", "Make", "Vendor");
            int specCol = GetCol("Technical Specification", "Specification", "Description", "Spec", "Details");
            int hsnCol = GetCol("HSN Code", "HsnCode", "HSN", "Hsn", "SAC");
            int uomCol = GetCol("Default UOM", "UOM", "Unit", "UnitName", "Unit of measurement");
            int stdRateCol = GetCol("Standard Rate", "StandardRate", "List Price", "Selling Price", "Rate", "Price", "Unit Price", "MRP");
            int gstRateCol = GetCol("GST Rate", "GSTRate", "Tax", "GST %", "GST Percentage", "GST", "Tax %", "VAT");
            int purchaseRateCol = GetCol("Purchase Rate", "PurchaseRate", "Cost Price", "Buying Price", "Cost");
            int profitCol = GetCol("Profit %", "ProfitPercentage", "Profit", "Margin %");
            int stockCol = GetCol("Stock Quantity", "Stock", "Quantity", "Qty", "Inventory");
            int imgCol = GetCol("Images", "Image", "Product Image URL", "ProductImageUrl", "Image URL", "ImageUrl", "Product Image", "ProductImage", "Image File", "Picture", "Photo");

            if (productNameCol <= 0 && specCol > 0)
            {
                productNameCol = specCol;
            }

            for (int r = headerRow + 1; r <= rowCount; r++)
            {
                // Skip completely empty rows
                bool isRowEmpty = true;
                for (int c = 1; c <= colCount; c++)
                {
                    if (!string.IsNullOrWhiteSpace(worksheet.Cells[r, c].Text))
                    {
                        isRowEmpty = false;
                        break;
                    }
                }
                if (isRowEmpty) continue;

                var rowDto = new ProductExcelRowDto { RowIndex = r };

                string GetVal(int colIndex)
                {
                    if (colIndex <= 0) return string.Empty;
                    return worksheet.Cells[r, colIndex].Text?.Trim() ?? string.Empty;
                }

                rowDto.ItemCode = GetVal(itemCodeCol);
                rowDto.ProductName = GetVal(productNameCol);
                rowDto.Brand = GetVal(brandCol);
                rowDto.Specification = GetVal(specCol);
                rowDto.HsnCode = GetVal(hsnCol);
                rowDto.DefaultUom = GetVal(uomCol);
                rowDto.ProductImage = GetVal(imgCol);

                // Smart extraction from combined "Code/Name of item"
                if (string.IsNullOrWhiteSpace(rowDto.ItemCode) && !string.IsNullOrWhiteSpace(rowDto.ProductName))
                {
                    var match = System.Text.RegularExpressions.Regex.Match(rowDto.ProductName, @"^([A-Za-z0-9_\-\.\/]+)\s+(.+)$");
                    if (match.Success && match.Groups[1].Value.Length <= 35 && !match.Groups[1].Value.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                    {
                        rowDto.ItemCode = match.Groups[1].Value.Trim();
                    }
                }

                // Parse Standard Rate (cleaning currency symbols)
                var rawStd = GetVal(stdRateCol);
                var cleanStd = System.Text.RegularExpressions.Regex.Replace(rawStd, @"[^0-9.-]", "");
                var rawPurchase = GetVal(purchaseRateCol);
                var cleanPurchase = System.Text.RegularExpressions.Regex.Replace(rawPurchase, @"[^0-9.-]", "");

                if (decimal.TryParse(cleanStd, out decimal parsedStdRate))
                    rowDto.StandardRate = parsedStdRate;
                else if (decimal.TryParse(cleanPurchase, out decimal parsedFallbackRate))
                    rowDto.StandardRate = parsedFallbackRate;
                else if (!string.IsNullOrEmpty(rawStd))
                    rowDto.ValidationErrors.Add("Standard Rate must be a valid number.");

                // Parse GST Rate
                var rawGst = GetVal(gstRateCol);
                var cleanGst = System.Text.RegularExpressions.Regex.Replace(rawGst, @"[^0-9.-]", "");
                if (decimal.TryParse(cleanGst, out decimal parsedGstRate))
                    rowDto.GSTRate = parsedGstRate;
                else if (!string.IsNullOrEmpty(rawGst))
                    rowDto.ValidationErrors.Add("GST Rate must be a valid number.");
                else
                    rowDto.GSTRate = 18;

                // Parse Purchase Rate
                if (!string.IsNullOrEmpty(cleanPurchase))
                {
                    if (decimal.TryParse(cleanPurchase, out decimal parsedPR))
                        rowDto.PurchaseRate = parsedPR;
                    else
                        rowDto.ValidationErrors.Add("Purchase Rate must be a valid number.");
                }

                // Parse Profit %
                var rawProfit = GetVal(profitCol);
                var cleanProfit = System.Text.RegularExpressions.Regex.Replace(rawProfit, @"[^0-9.-]", "");
                if (!string.IsNullOrEmpty(cleanProfit))
                {
                    if (decimal.TryParse(cleanProfit, out decimal parsedProfit))
                        rowDto.ProfitPercentage = parsedProfit;
                    else
                        rowDto.ValidationErrors.Add("Profit % must be a valid number.");
                }
                else if (rowDto.PurchaseRate.HasValue && rowDto.PurchaseRate.Value > 0 && rowDto.StandardRate > 0)
                {
                    rowDto.ProfitPercentage = Math.Round(((rowDto.StandardRate - rowDto.PurchaseRate.Value) / rowDto.PurchaseRate.Value) * 100, 1);
                }

                // Parse Stock
                var rawStock = GetVal(stockCol);
                var cleanStock = System.Text.RegularExpressions.Regex.Replace(rawStock, @"[^0-9.-]", "");
                if (!string.IsNullOrEmpty(cleanStock))
                {
                    if (int.TryParse(cleanStock, out int parsedStock))
                        rowDto.Stock = parsedStock;
                    else if (decimal.TryParse(cleanStock, out decimal decStock))
                        rowDto.Stock = (int)Math.Round(decStock);
                    else
                        rowDto.ValidationErrors.Add("Stock Quantity must be a valid integer.");
                }

                // Validate mandatory Product Name
                if (string.IsNullOrWhiteSpace(rowDto.ProductName))
                {
                    if (!string.IsNullOrWhiteSpace(rowDto.Specification))
                    {
                        var firstLine = rowDto.Specification.Split('\n')[0].Trim();
                        rowDto.ProductName = firstLine.Length > 150 ? firstLine.Substring(0, 150) : firstLine;
                    }
                    else
                    {
                        rowDto.ValidationErrors.Add("Product Name is required.");
                    }
                }

                if (rowDto.ValidationErrors.Count > 0)
                {
                    rowDto.IsValid = false;
                }

                rows.Add(rowDto);
            }

            return rows;
        }

        public static byte[] GenerateTemplate()
        {
            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Product Master Template");

            string[] headers = new[]
            {
                "Item Code",
                "Product Name *",
                "Brand",
                "Technical Specification",
                "HSN Code",
                "Default UOM",
                "Standard Rate *",
                "GST Rate *",
                "Purchase Rate",
                "Profit %",
                "Stock Quantity",
                "Product Image"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cells[1, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.Color.SetColor(Color.White);
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(0, 35, 74)); // #00234a
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }

            // Sample Row 1
            ws.Cells[2, 1].Value = "PRD-101";
            ws.Cells[2, 2].Value = "Safety Helmet with Ratchet";
            ws.Cells[2, 3].Value = "ISQUARE";
            ws.Cells[2, 4].Value = "High-density polymer with 4-point suspension";
            ws.Cells[2, 5].Value = "650610";
            ws.Cells[2, 6].Value = "Nos";
            ws.Cells[2, 7].Value = 450.00;
            ws.Cells[2, 8].Value = 18;
            ws.Cells[2, 9].Value = 320.00;
            ws.Cells[2, 10].Value = 28.89;
            ws.Cells[2, 11].Value = 150;
            ws.Cells[2, 12].Value = "";

            // Sample Row 2
            ws.Cells[3, 1].Value = "PRD-102";
            ws.Cells[3, 2].Value = "Industrial Safety Shoes (Steel Toe)";
            ws.Cells[3, 3].Value = "ISQUARE";
            ws.Cells[3, 4].Value = "Genuine leather, oil-resistant PU sole, 200J steel toe";
            ws.Cells[3, 5].Value = "640340";
            ws.Cells[3, 6].Value = "Pair";
            ws.Cells[3, 7].Value = 1850.00;
            ws.Cells[3, 8].Value = 18;
            ws.Cells[3, 9].Value = 1350.00;
            ws.Cells[3, 10].Value = 27.03;
            ws.Cells[3, 11].Value = 85;
            ws.Cells[3, 12].Value = "";

            ws.Row(1).Height = 26;
            ws.Row(2).Height = 20;
            ws.Row(3).Height = 20;

            for (int col = 1; col <= headers.Length; col++)
            {
                ws.Column(col).AutoFit();
                if (ws.Column(col).Width < 14) ws.Column(col).Width = 14;
            }

            return package.GetAsByteArray();
        }
    }
}

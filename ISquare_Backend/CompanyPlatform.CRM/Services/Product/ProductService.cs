using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using System.IO.Compression;
using CompanyPlatform.CRM.DTO.Product;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Data;
using Microsoft.EntityFrameworkCore;
using ProductModel = CompanyPlatform.Core.Models.CRM.Company.Product;

namespace CompanyPlatform.CRM.Services.Product
{
    public class ProductService : IProductService
    {
        private readonly IRepositories<ProductModel> _repository;
        private readonly ILogger<ProductService> _logger;
        private readonly ApplicationDBContext? _context;
        private readonly IWebHostEnvironment? _env;

        public ProductService(
            IRepositories<ProductModel> repository,
            ILogger<ProductService> logger,
            ApplicationDBContext? context = null,
            IWebHostEnvironment? env = null)
        {
            _repository = repository;
            _logger = logger;
            _context = context;
            _env = env;
        }

        private async Task<string> GenerateNextProductCodeAsync()
        {
            var products = await _repository.GetAll();

            int maxNumber = 0;

            foreach (var product in products)
            {
                if (string.IsNullOrWhiteSpace(product.ItemCode))
                    continue;

                var code = product.ItemCode.Trim();

                if (code.StartsWith(
                    "PRD-",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart = code.Substring("PRD-".Length);

                    if (int.TryParse(numberPart, out int number))
                    {
                        if (number > maxNumber)
                            maxNumber = number;
                    }
                }
            }

            return $"PRD-{maxNumber + 1:D3}";
        }

        // GET ALL
        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            _logger.LogInformation("Fetching active products.");

            var products = await _repository.GetAll();

            return products
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductDto
                {
                    ProductId = x.ProductId,
                    ItemCode = x.ItemCode,
                    ProductName = x.ProductName,
                    Brand = x.Brand,
                    Specification = x.Specification,
                    UnitOfMeasurementId = x.UnitOfMeasurementId,
                    StandardRate = x.StandardRate,
                    GSTRate = x.GSTRate,
                    HsnCode = x.HsnCode,
                    PurchaseRate = x.PurchaseRate,
                    ProfitPercentage = x.ProfitPercentage,
                    Stock = x.Stock,
                    ProductImage = x.ProductImage,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }

        // GET BY ID
        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching product with ID: {ProductId}", id);

            var product = await _repository.GetByIdAsync(id);

            if (product == null || product.IsDeleted)
                return null;

            return new ProductDto
            {
                ProductId = product.ProductId,
                ItemCode = product.ItemCode,
                ProductName = product.ProductName,
                Brand = product.Brand,
                Specification = product.Specification,
                UnitOfMeasurementId = product.UnitOfMeasurementId,
                StandardRate = product.StandardRate,
                GSTRate = product.GSTRate,
                HsnCode = product.HsnCode,
                PurchaseRate = product.PurchaseRate,
                ProfitPercentage = product.ProfitPercentage,
                Stock = product.Stock,
                ProductImage = product.ProductImage,
                IsActive = product.IsActive,
                IsDeleted = product.IsDeleted
            };
        }

        // CREATE
        public async Task<ProductDto> CreateProductAsync(ProductDto dto)
        {
            _logger.LogInformation(
                "Creating product: {ProductName}", dto.ProductName);

            var generatedCode = await GenerateNextProductCodeAsync();

            var product = new ProductModel
            {
                ItemCode = generatedCode,
                ProductName = dto.ProductName,
                Brand = dto.Brand,
                Specification = dto.Specification,
                UnitOfMeasurementId = dto.UnitOfMeasurementId,
                StandardRate = dto.StandardRate,
                GSTRate = dto.GSTRate,
                HsnCode = dto.HsnCode,
                PurchaseRate = dto.PurchaseRate,
                ProfitPercentage = dto.ProfitPercentage,
                Stock = dto.Stock,
                ProductImage = dto.ProductImage ?? dto.ProductImagePath,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(product);

            dto.ProductId = product.ProductId;
            dto.ItemCode = product.ItemCode;
            dto.HsnCode = product.HsnCode;
            dto.PurchaseRate = product.PurchaseRate;
            dto.ProfitPercentage = product.ProfitPercentage;
            dto.Stock = product.Stock;
            dto.ProductImage = product.ProductImage;
            dto.IsActive = product.IsActive;
            dto.IsDeleted = product.IsDeleted;

            return dto;
        }

        // UPDATE
        public async Task<bool> UpdateProductAsync(
            int id, ProductDto dto)
        {
            _logger.LogInformation(
                "Updating product with ID: {ProductId}", id);

            var product = await _repository.GetByIdAsync(id);

            if (product == null || product.IsDeleted)
                return false;

            product.ProductName = dto.ProductName;
            product.Brand = dto.Brand;
            product.Specification = dto.Specification;
            product.UnitOfMeasurementId = dto.UnitOfMeasurementId;
            product.StandardRate = dto.StandardRate;
            product.GSTRate = dto.GSTRate;
            product.HsnCode = dto.HsnCode;
            product.PurchaseRate = dto.PurchaseRate;
            product.ProfitPercentage = dto.ProfitPercentage;
            product.Stock = dto.Stock;
            product.IsActive = dto.IsActive;
            product.ProductImage = dto.ProductImage ?? dto.ProductImagePath ?? product.ProductImage;

            // ItemCode is generated by the system and remains unchanged.
            await _repository.Update(product);

            return true;
        }

        // DELETE - SOFT DELETE
        public async Task<bool> DeleteProductAsync(int id)
        {
            _logger.LogInformation(
                "Deleting product with ID: {ProductId}", id);

            var product = await _repository.GetByIdAsync(id);

            if (product == null || product.IsDeleted)
                return false;

            product.IsDeleted = true;

            await _repository.Update(product);

            return true;
        }

        // EXCEL TEMPLATE GENERATION
        public byte[] GenerateExcelTemplate()
        {
            return ProductExcelHelper.GenerateTemplate();
        }

        // ZIP PRODUCT IMAGE EXTRACTION (SAFE, SANITIZED, PATH TRAVERSAL PROTECTED)
        private async Task<(int imagesExtracted, Dictionary<string, string> extractedImages, List<string> warnings)> ExtractProductImagesZipAsync(Stream zipStream)
        {
            var extractedMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var warnings = new List<string>();
            int extractedCount = 0;

            var webRoot = _env?.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var targetFolder = Path.Combine(webRoot, "uploads", "products");
            if (!Directory.Exists(targetFolder))
            {
                Directory.CreateDirectory(targetFolder);
            }

            var fullTargetDir = Path.GetFullPath(targetFolder);
            if (!fullTargetDir.EndsWith(Path.DirectorySeparatorChar.ToString()))
            {
                fullTargetDir += Path.DirectorySeparatorChar;
            }

            // Security limits against ZipSlip and Zip Bombs
            const int maxFileCount = 1000;
            const long maxIndividualFileSize = 25 * 1024 * 1024; // 25 MB
            const long maxTotalExtractedSize = 200 * 1024 * 1024; // 200 MB
            long totalExtractedSize = 0;
            int processedEntries = 0;

            using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: true);

            foreach (var entry in archive.Entries)
            {
                processedEntries++;
                if (processedEntries > maxFileCount)
                {
                    _logger.LogWarning("ZIP extraction reached limit of {MaxFiles} files.", maxFileCount);
                    warnings.Add($"ZIP archive exceeded file count limit ({maxFileCount}). Some files may have been skipped.");
                    break;
                }

                // Normalize path separator to handle Windows and Unix zip formats, including nested folders
                var normalizedFullName = entry.FullName.Replace('\\', '/');

                // Skip directory entries and empty paths
                if (normalizedFullName.EndsWith('/') || entry.Length == 0)
                    continue;

                // Extract filename only (handles nested subfolders like "iSquare Product/Picture1.png")
                var safeFileName = Path.GetFileName(normalizedFullName);
                if (string.IsNullOrWhiteSpace(safeFileName) || safeFileName.Contains(".."))
                    continue;

                if (entry.Length > maxIndividualFileSize)
                {
                    _logger.LogWarning("Skipping '{Name}' because size exceeds limit.", safeFileName);
                    warnings.Add($"Skipped '{safeFileName}': file size exceeds 25 MB limit.");
                    continue;
                }

                totalExtractedSize += entry.Length;
                if (totalExtractedSize > maxTotalExtractedSize)
                {
                    _logger.LogWarning("ZIP extraction stopped: total size limit reached.");
                    warnings.Add("ZIP extraction halted: maximum total uncompressed size (200 MB) reached.");
                    break;
                }

                foreach (var c in Path.GetInvalidFileNameChars())
                {
                    safeFileName = safeFileName.Replace(c, '_');
                }

                var ext = Path.GetExtension(safeFileName).ToLowerInvariant();
                if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp")
                    continue;

                // Check for duplicate/ambiguous filenames inside ZIP across subfolders
                if (extractedMap.ContainsKey(safeFileName))
                {
                    warnings.Add($"Duplicate image filename '{safeFileName}' found in ZIP archive (at '{entry.FullName}'). The latest occurrence was used.");
                }

                // Prevent Zip Slip / Path Traversal
                var destinationPath = Path.GetFullPath(Path.Combine(targetFolder, safeFileName));
                if (!destinationPath.StartsWith(fullTargetDir, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Blocked potential ZIP path traversal: {EntryFullName}", entry.FullName);
                    continue;
                }

                // Extract file safely (overwrite with latest from zip)
                using (var entryStream = entry.Open())
                using (var fileDestStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await entryStream.CopyToAsync(fileDestStream);
                }

                var relativePath = $"/uploads/products/{safeFileName}";
                extractedMap[safeFileName] = relativePath;

                var nameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);
                if (!string.IsNullOrWhiteSpace(nameWithoutExt) && !extractedMap.ContainsKey(nameWithoutExt))
                {
                    extractedMap[nameWithoutExt] = relativePath;
                }

                extractedCount++;
            }

            return (extractedCount, extractedMap, warnings);
        }

        private static string? GetImageFileName(string? rawVal)
        {
            if (string.IsNullOrWhiteSpace(rawVal))
                return null;

            var trimmed = rawVal.Trim();
            if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uriResult) &&
                (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
            {
                return null;
            }

            var normalized = trimmed.Replace('\\', '/');
            var fileName = Path.GetFileName(normalized);
            return string.IsNullOrWhiteSpace(fileName) ? null : fileName.Trim();
        }

        private string? ResolveProductImagePath(
            string? rawImageVal,
            Dictionary<string, string> extractedMap,
            string targetFolder,
            List<string> missingImages,
            ref int imagesMatched,
            ref int imagesLinked)
        {
            if (string.IsNullOrWhiteSpace(rawImageVal))
                return null;

            var trimmed = rawImageVal.Trim();

            // Case 1: Full public URL (http / https)
            if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uriResult) &&
                (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
            {
                imagesLinked++;
                return trimmed;
            }

            // Clean filename from Windows path (e.g. D:\ICEEM\iSquare Productimage\Picture1.png) or unix path or bare name
            var normalized = trimmed.Replace('\\', '/');
            var cleanName = Path.GetFileName(normalized);
            if (string.IsNullOrWhiteSpace(cleanName))
                return null;

            // Case 2: Match in extracted images from ZIP
            if (extractedMap.TryGetValue(cleanName, out var mappedPath))
            {
                imagesMatched++;
                imagesLinked++;
                return mappedPath;
            }

            // Case 2b: Match without extension or with spaces/hyphens
            var nameWithoutExt = Path.GetFileNameWithoutExtension(cleanName);
            if (!string.IsNullOrWhiteSpace(nameWithoutExt) && extractedMap.TryGetValue(nameWithoutExt, out mappedPath))
            {
                imagesMatched++;
                imagesLinked++;
                return mappedPath;
            }

            var alt1 = cleanName.Replace(" ", "-");
            if (extractedMap.TryGetValue(alt1, out mappedPath))
            {
                imagesMatched++;
                imagesLinked++;
                return mappedPath;
            }

            var alt2 = cleanName.Replace("-", " ");
            if (extractedMap.TryGetValue(alt2, out mappedPath))
            {
                imagesMatched++;
                imagesLinked++;
                return mappedPath;
            }

            // Case 3: Check if file already exists on server disk in targetFolder
            var diskPath = Path.Combine(targetFolder, cleanName);
            if (File.Exists(diskPath))
            {
                imagesMatched++;
                imagesLinked++;
                return $"/uploads/products/{cleanName}";
            }

            // Case 4: Image file is missing from ZIP and disk
            if (!missingImages.Contains(cleanName, StringComparer.OrdinalIgnoreCase))
            {
                missingImages.Add(cleanName);
            }

            return null;
        }

        // EXCEL IMPORT FROM STREAM WITH OPTIONAL ZIP IMAGES
        public async Task<ProductImportResultDto> ImportProductsFromExcelAsync(Stream fileStream, Stream? zipStream = null)
        {
            _logger.LogInformation("Parsing and importing products from uploaded Excel stream with optional ZIP.");

            var extractedMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var imageWarnings = new List<string>();
            int imagesExtracted = 0;

            var webRoot = _env?.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }
            var targetFolder = Path.Combine(webRoot, "uploads", "products");

            if (zipStream != null)
            {
                try
                {
                    var zipResult = await ExtractProductImagesZipAsync(zipStream);
                    imagesExtracted = zipResult.imagesExtracted;
                    extractedMap = zipResult.extractedImages;
                    imageWarnings = zipResult.warnings;
                    _logger.LogInformation("Successfully extracted {Count} images from ZIP file.", imagesExtracted);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while extracting ZIP stream.");
                    imageWarnings.Add($"Failed to process ZIP archive: {ex.Message}");
                }
            }

            var rows = ProductExcelHelper.ParseExcel(fileStream);
            var missingImages = new List<string>();
            int imagesMatched = 0;
            int imagesLinked = 0;

            // Map each row's product image using the extracted lookup
            foreach (var row in rows)
            {
                if (!string.IsNullOrWhiteSpace(row.ProductImage))
                {
                    row.ProductImage = ResolveProductImagePath(row.ProductImage, extractedMap, targetFolder, missingImages, ref imagesMatched, ref imagesLinked);
                }
            }

            var result = await BulkImportProductsAsync(rows);
            result.ImagesExtracted = imagesExtracted;
            result.ImagesMatched = imagesMatched;
            result.ImagesLinked = imagesLinked;
            result.MissingImages = missingImages;
            result.ImageWarnings = imageWarnings;

            return result;
        }

        // BULK IMPORT PRODUCTS
        public async Task<ProductImportResultDto> BulkImportProductsAsync(List<ProductExcelRowDto> records)
        {
            _logger.LogInformation("Starting bulk product import for {Count} records.", records?.Count ?? 0);

            var result = new ProductImportResultDto
            {
                TotalRecords = records?.Count ?? 0
            };

            if (records == null || records.Count == 0)
            {
                result.Message = "No records found in Excel file.";
                return result;
            }

            // 1. Fetch existing active product names to check for duplicates (ProductName based duplicate validation)
            var existingProducts = await _repository.GetAll();
            var existingNames = new HashSet<string>(
                existingProducts
                    .Where(p => !p.IsDeleted && !string.IsNullOrWhiteSpace(p.ProductName))
                    .Select(p => p.ProductName.Trim()),
                StringComparer.OrdinalIgnoreCase
            );

            // Compute current max PRD number for auto-generating missing codes
            int maxNumber = 0;
            foreach (var p in existingProducts)
            {
                if (string.IsNullOrWhiteSpace(p.ItemCode)) continue;
                var codeVal = p.ItemCode.Trim();
                if (codeVal.StartsWith("PRD-", StringComparison.OrdinalIgnoreCase))
                {
                    var numPart = codeVal.Substring("PRD-".Length);
                    if (int.TryParse(numPart, out int num) && num > maxNumber)
                    {
                        maxNumber = num;
                    }
                }
            }

            var seenNamesInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var productsToAdd = new List<ProductModel>();

            // 2. Row-by-row validation & duplication checks
            foreach (var row in records)
            {
                var rowNum = row.RowIndex > 0 ? row.RowIndex : (records.IndexOf(row) + 2);

                // Check previously detected format errors
                if (!row.IsValid && row.ValidationErrors.Count > 0)
                {
                    result.FailedCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = row.ItemCode,
                        ProductName = row.ProductName,
                        ErrorMessage = string.Join("; ", row.ValidationErrors)
                    });
                    continue;
                }

                // Mandatory Product Name validation
                if (string.IsNullOrWhiteSpace(row.ProductName))
                {
                    result.FailedCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = row.ItemCode,
                        ProductName = row.ProductName,
                        ErrorMessage = "Product Name is required."
                    });
                    continue;
                }

                var prodName = row.ProductName.Trim();

                // Check duplicate ProductName in uploaded Excel file
                if (seenNamesInFile.Contains(prodName))
                {
                    result.DuplicateCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = row.ItemCode,
                        ProductName = row.ProductName,
                        ErrorMessage = $"Duplicate Product Name '{prodName}' found within the uploaded Excel file."
                    });
                    continue;
                }

                // Check duplicate ProductName in existing database
                if (existingNames.Contains(prodName))
                {
                    result.DuplicateCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = row.ItemCode,
                        ProductName = row.ProductName,
                        ErrorMessage = $"Product Name '{prodName}' already exists in the Product Master database."
                    });
                    continue;
                }

                seenNamesInFile.Add(prodName);

                // If Item Code is specified, preserve it; otherwise auto-generate PRD-XXX
                var code = row.ItemCode?.Trim();
                if (string.IsNullOrWhiteSpace(code))
                {
                    maxNumber++;
                    code = $"PRD-{maxNumber:D3}";
                    row.ItemCode = code;
                }

                // Numeric validation
                if (row.StandardRate < 0)
                {
                    result.FailedCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = code,
                        ProductName = row.ProductName,
                        ErrorMessage = "Standard Rate must be greater than or equal to 0."
                    });
                    continue;
                }

                if (row.GSTRate < 0 || row.GSTRate > 100)
                {
                    result.FailedCount++;
                    result.Errors.Add(new ProductImportErrorDto
                    {
                        RowNumber = rowNum,
                        ItemCode = code,
                        ProductName = row.ProductName,
                        ErrorMessage = "GST Rate must be between 0 and 100."
                    });
                    continue;
                }

                // Map UOM
                int uomId = row.UnitOfMeasurementId ?? 1;
                if (!string.IsNullOrWhiteSpace(row.DefaultUom))
                {
                    var uomLower = row.DefaultUom.Trim().ToLower();
                    if (uomLower.StartsWith("nos") || uomLower == "no") uomId = 1;
                    else if (uomLower.StartsWith("pc")) uomId = 2;
                    else if (uomLower.StartsWith("set")) uomId = 3;
                    else if (uomLower.StartsWith("mtr") || uomLower.StartsWith("meter")) uomId = 4;
                    else if (uomLower.StartsWith("kg")) uomId = 5;
                    else if (uomLower.StartsWith("box")) uomId = 6;
                    else if (uomLower.StartsWith("pair")) uomId = 7;
                    else if (uomLower.StartsWith("ltr") || uomLower.StartsWith("liter")) uomId = 8;
                }

                var entity = new ProductModel
                {
                    ItemCode = code,
                    ProductName = row.ProductName.Trim(),
                    Brand = row.Brand?.Trim(),
                    Specification = row.Specification?.Trim(),
                    UnitOfMeasurementId = uomId,
                    StandardRate = row.StandardRate,
                    GSTRate = row.GSTRate,
                    HsnCode = row.HsnCode?.Trim(),
                    PurchaseRate = row.PurchaseRate,
                    ProfitPercentage = row.ProfitPercentage,
                    Stock = row.Stock,
                    ProductImage = row.ProductImage?.Trim(),
                    IsActive = true,
                    IsDeleted = false
                };

                productsToAdd.Add(entity);
                existingNames.Add(prodName);
            }

            // 3. Batch insertion with Database Transaction
            if (productsToAdd.Count > 0)
            {
                if (_context != null)
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        await _context.Products.AddRangeAsync(productsToAdd);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        _logger.LogError(ex, "Transaction failed during bulk product import.");
                        throw;
                    }
                }
                else
                {
                    await _repository.AddRangeAsync(productsToAdd);
                    await _repository.SaveChangesAsync();
                }

                result.SuccessCount = productsToAdd.Count;
                result.ImportedProducts = productsToAdd.Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    ItemCode = p.ItemCode,
                    ProductName = p.ProductName,
                    Brand = p.Brand,
                    Specification = p.Specification,
                    UnitOfMeasurementId = p.UnitOfMeasurementId,
                    StandardRate = p.StandardRate,
                    GSTRate = p.GSTRate,
                    HsnCode = p.HsnCode,
                    PurchaseRate = p.PurchaseRate,
                    ProfitPercentage = p.ProfitPercentage,
                    Stock = p.Stock,
                    ProductImage = p.ProductImage,
                    IsActive = p.IsActive,
                    IsDeleted = p.IsDeleted
                }).ToList();
            }

            result.Message = $"Import completed: {result.SuccessCount} imported, {result.DuplicateCount} duplicates, {result.FailedCount} failed.";
            return result;
        }
    }
}

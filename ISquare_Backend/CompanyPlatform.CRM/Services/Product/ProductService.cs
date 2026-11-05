using Microsoft.Extensions.Logging;
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

        public ProductService(
            IRepositories<ProductModel> repository,
            ILogger<ProductService> logger,
            ApplicationDBContext? context = null)
        {
            _repository = repository;
            _logger = logger;
            _context = context;
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

        // EXCEL IMPORT FROM STREAM
        public async Task<ProductImportResultDto> ImportProductsFromExcelAsync(Stream fileStream)
        {
            _logger.LogInformation("Parsing and importing products from uploaded Excel stream.");
            var rows = ProductExcelHelper.ParseExcel(fileStream);
            return await BulkImportProductsAsync(rows);
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

            // 1. Fetch existing active product item codes to check for duplicates
            var existingProducts = await _repository.GetAll();
            var existingCodes = new HashSet<string>(
                existingProducts
                    .Where(p => !p.IsDeleted && !string.IsNullOrWhiteSpace(p.ItemCode))
                    .Select(p => p.ItemCode.Trim().ToLower()),
                StringComparer.OrdinalIgnoreCase
            );

            // Compute current max PRD number for auto-generating missing codes
            int maxNumber = 0;
            foreach (var p in existingProducts)
            {
                if (string.IsNullOrWhiteSpace(p.ItemCode)) continue;
                var code = p.ItemCode.Trim();
                if (code.StartsWith("PRD-", StringComparison.OrdinalIgnoreCase))
                {
                    var numPart = code.Substring("PRD-".Length);
                    if (int.TryParse(numPart, out int num) && num > maxNumber)
                    {
                        maxNumber = num;
                    }
                }
            }

            var seenInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
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

                // If Item Code is specified, check duplicates
                var code = row.ItemCode?.Trim();
                if (!string.IsNullOrWhiteSpace(code))
                {
                    // Check duplicate in file
                    if (seenInFile.Contains(code))
                    {
                        result.DuplicateCount++;
                        result.Errors.Add(new ProductImportErrorDto
                        {
                            RowNumber = rowNum,
                            ItemCode = code,
                            ProductName = row.ProductName,
                            ErrorMessage = $"Duplicate Item Code '{code}' found within the uploaded Excel file."
                        });
                        continue;
                    }

                    // Check duplicate in existing database
                    if (existingCodes.Contains(code))
                    {
                        result.DuplicateCount++;
                        result.Errors.Add(new ProductImportErrorDto
                        {
                            RowNumber = rowNum,
                            ItemCode = code,
                            ProductName = row.ProductName,
                            ErrorMessage = $"Item Code '{code}' already exists in the Product Master database."
                        });
                        continue;
                    }

                    seenInFile.Add(code);
                }
                else
                {
                    // Auto-generate code
                    maxNumber++;
                    code = $"PRD-{maxNumber:D3}";
                    row.ItemCode = code;
                    seenInFile.Add(code);
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
                existingCodes.Add(code);
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

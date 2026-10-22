using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Product;
using CompanyPlatform.Core.Repository;
using ProductModel = CompanyPlatform.Core.Models.CRM.Company.Product;

namespace CompanyPlatform.CRM.Services.Product
{
    public class ProductService : IProductService
    {
        private readonly IRepositories<ProductModel> _repository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IRepositories<ProductModel> repository,
            ILogger<ProductService> logger)
        {
            _repository = repository;
            _logger = logger;
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
                ProductImage = dto.ProductImage ?? dto.ProductImagePath,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(product);

            dto.ProductId = product.ProductId;
            dto.ItemCode = product.ItemCode;
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
    }
}
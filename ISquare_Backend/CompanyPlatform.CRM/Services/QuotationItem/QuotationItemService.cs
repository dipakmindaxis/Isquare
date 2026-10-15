using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;
using QuotationItemModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationItem;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class QuotationItemService : IQuotationItemService
    {
        private readonly IRepositories<QuotationItemModel> _repository;
        private readonly ILogger<QuotationItemService> _logger;

        public QuotationItemService(
            IRepositories<QuotationItemModel> repository,
            ILogger<QuotationItemService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // CALCULATE LINE AMOUNTS
        private static void CalculateAmounts(QuotationItemModel item)
        {
            decimal grossAmount = item.Quantity * item.Rate;

            item.DiscountAmount = Math.Round(
                grossAmount * item.DiscountPercentage / 100m, 2);

            item.TaxableAmount = Math.Round(
                grossAmount - item.DiscountAmount, 2);

            item.TaxAmount = Math.Round(
                item.TaxableAmount * item.GSTRate / 100m, 2);

            item.LineTotal = Math.Round(
                item.TaxableAmount + item.TaxAmount, 2);
        }

        // MAP ENTITY TO DTO
        private static QuotationItemDto MapToDto(
            QuotationItemModel item)
        {
            return new QuotationItemDto
            {
                QuotationItemId = item.QuotationItemId,
                QuotationId = item.QuotationId,
                ProductId = item.ProductId,
                ParentQuotationItemId = item.ParentQuotationItemId,
                IsAccessory = item.IsAccessory,
                ItemCode = item.ItemCode,
                ItemName = item.ItemName,
                Brand = item.Brand,
                Specification = item.Specification,
                Quantity = item.Quantity,
                UnitOfMeasurementId = item.UnitOfMeasurementId,
                Rate = item.Rate,
                DiscountPercentage = item.DiscountPercentage,
                DiscountAmount = item.DiscountAmount,
                GSTRate = item.GSTRate,
                TaxableAmount = item.TaxableAmount,
                TaxAmount = item.TaxAmount,
                LineTotal = item.LineTotal,
                DisplayOrder = item.DisplayOrder,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        // GET ALL
        public async Task<IEnumerable<QuotationItemDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching quotation items.");

            var items = await _repository.GetAll();

            return items
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.QuotationId)
                .ThenBy(x => x.DisplayOrder)
                .Select(MapToDto)
                .ToList();
        }

        // GET ITEMS BY QUOTATION
        public async Task<IEnumerable<QuotationItemDto>>
            GetByQuotationIdAsync(int quotationId)
        {
            _logger.LogInformation(
                "Fetching items for quotation {QuotationId}",
                quotationId);

            var items = await _repository.GetAll();

            return items
                .Where(x =>
                    x.QuotationId == quotationId &&
                    !x.IsDeleted)
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.QuotationItemId)
                .Select(MapToDto)
                .ToList();
        }

        // GET BY ID
        public async Task<QuotationItemDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching quotation item {QuotationItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return MapToDto(item);
        }

        // CREATE
        public async Task<QuotationItemDto> CreateAsync(
            QuotationItemDto dto)
        {
            _logger.LogInformation(
                "Creating quotation item for quotation {QuotationId}",
                dto.QuotationId);

            ValidateItem(dto);

            // Validate the parent item when creating an accessory.
            if (dto.IsAccessory)
            {
                if (!dto.ParentQuotationItemId.HasValue)
                {
                    throw new ArgumentException(
                        "An accessory must have a parent quotation item.");
                }

                var parent = await _repository.GetByIdAsync(
                    dto.ParentQuotationItemId.Value);

                if (parent == null ||
                    parent.IsDeleted ||
                    parent.QuotationId != dto.QuotationId ||
                    parent.IsAccessory)
                {
                    throw new ArgumentException(
                        "The parent must be an active main product " +
                        "from the same quotation.");
                }
            }
            else if (dto.ParentQuotationItemId.HasValue)
            {
                throw new ArgumentException(
                    "A main product cannot have a parent quotation item.");
            }

            var item = new QuotationItemModel
            {
                QuotationId = dto.QuotationId,
                ProductId = dto.ProductId,
                ParentQuotationItemId = dto.ParentQuotationItemId,
                IsAccessory = dto.IsAccessory,
                ItemCode = dto.ItemCode,
                ItemName = dto.ItemName,
                Brand = dto.Brand,
                Specification = dto.Specification,
                Quantity = dto.Quantity,
                UnitOfMeasurementId = dto.UnitOfMeasurementId,
                Rate = dto.Rate,
                DiscountPercentage = dto.DiscountPercentage,
                GSTRate = dto.GSTRate,
                DisplayOrder = dto.DisplayOrder,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            CalculateAmounts(item);

            await _repository.Create(item);

            return MapToDto(item);
        }

        // UPDATE
        public async Task<bool> UpdateAsync(
            int id, QuotationItemDto dto)
        {
            _logger.LogInformation(
                "Updating quotation item {QuotationItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            // Keep the quotation and parent relationship unchanged here.
            // Use a dedicated operation to move items between quotations.
            if (dto.QuotationId != item.QuotationId ||
                dto.IsAccessory != item.IsAccessory ||
                dto.ParentQuotationItemId != item.ParentQuotationItemId)
            {
                throw new ArgumentException(
                    "Quotation and parent relationships cannot be changed " +
                    "through this update endpoint.");
            }

            ValidateItem(dto);

            item.ProductId = dto.ProductId;
            item.ItemCode = dto.ItemCode;
            item.ItemName = dto.ItemName;
            item.Brand = dto.Brand;
            item.Specification = dto.Specification;
            item.Quantity = dto.Quantity;
            item.UnitOfMeasurementId = dto.UnitOfMeasurementId;
            item.Rate = dto.Rate;
            item.DiscountPercentage = dto.DiscountPercentage;
            item.GSTRate = dto.GSTRate;
            item.DisplayOrder = dto.DisplayOrder;
            item.IsActive = dto.IsActive;
            item.UpdatedAt = DateTime.UtcNow;

            CalculateAmounts(item);

            await _repository.Update(item);

            return true;
        }

        // DELETE - SOFT DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation(
                "Deleting quotation item {QuotationItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            var items = await _repository.GetAll();

            // Prevent deleting a product while it still has active accessories.
            bool hasAccessories = items.Any(x =>
                x.ParentQuotationItemId == id &&
                !x.IsDeleted);

            if (!item.IsAccessory && hasAccessories)
            {
                throw new InvalidOperationException(
                    "Delete or reassign the accessories before deleting " +
                    "the main product.");
            }

            item.IsDeleted = true;
            item.IsActive = false;
            item.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(item);

            return true;
        }

        // VALIDATION
        private static void ValidateItem(QuotationItemDto dto)
        {
            if (dto.QuotationId <= 0)
                throw new ArgumentException("QuotationId is required.");

            if (string.IsNullOrWhiteSpace(dto.ItemName))
                throw new ArgumentException("ItemName is required.");

            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Quantity must be greater than zero.");

            if (dto.Rate < 0)
                throw new ArgumentException(
                    "Rate cannot be negative.");

            if (dto.DiscountPercentage < 0 ||
                dto.DiscountPercentage > 100)
                throw new ArgumentException(
                    "Discount percentage must be between 0 and 100.");

            if (dto.GSTRate < 0 || dto.GSTRate > 100)
                throw new ArgumentException(
                    "GST rate must be between 0 and 100.");
        }
    }
}
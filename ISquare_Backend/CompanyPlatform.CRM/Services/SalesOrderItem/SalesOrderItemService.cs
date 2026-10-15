using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Quotation;
using CompanyPlatform.Core.Repository;

using SalesOrderItemModel =
    CompanyPlatform.Core.Models.CRM.Company.SalesOrderItem;

using SalesOrderModel =
    CompanyPlatform.Core.Models.CRM.Company.SalesOrder;

namespace CompanyPlatform.CRM.Services.Quotation
{
    public class SalesOrderItemService : ISalesOrderItemService
    {
        private readonly IRepositories<SalesOrderItemModel> _itemRepository;
        private readonly IRepositories<SalesOrderModel> _orderRepository;
        private readonly ILogger<SalesOrderItemService> _logger;

        public SalesOrderItemService(
            IRepositories<SalesOrderItemModel> itemRepository,
            IRepositories<SalesOrderModel> orderRepository,
            ILogger<SalesOrderItemService> logger)
        {
            _itemRepository = itemRepository;
            _orderRepository = orderRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<SalesOrderItemDto>> GetAllAsync()
        {
            var items = await _itemRepository.GetAll();

            return items
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.SalesOrderId)
                .ThenBy(x => x.DisplayOrder)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<SalesOrderItemDto?> GetByIdAsync(int id)
        {
            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return MapToDto(item);
        }

        public async Task<IEnumerable<SalesOrderItemDto>>
            GetBySalesOrderIdAsync(int salesOrderId)
        {
            var items = await _itemRepository.GetAll();

            return items
                .Where(x =>
                    x.SalesOrderId == salesOrderId &&
                    !x.IsDeleted)
                .OrderBy(x => x.DisplayOrder)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<SalesOrderItemDto> CreateAsync(
            CreateSalesOrderItemDto dto)
        {
            Validate(dto);

            var order =
                await _orderRepository.GetByIdAsync(dto.SalesOrderId);

            if (order == null || order.IsDeleted)
                throw new KeyNotFoundException("Sales order not found.");

            if (order.OrderStatus.Equals(
                "Completed",
                StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals(
                "Cancelled",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Items cannot be added to completed or cancelled orders.");
            }

            if (dto.IsAccessory)
            {
                if (!dto.ParentSalesOrderItemId.HasValue)
                    throw new ArgumentException(
                        "An accessory must reference a parent order item.");

                var parent =
                    await _itemRepository.GetByIdAsync(
                        dto.ParentSalesOrderItemId.Value);

                if (parent == null ||
                    parent.IsDeleted ||
                    parent.SalesOrderId != dto.SalesOrderId)
                {
                    throw new ArgumentException(
                        "The parent item must belong to the same sales order.");
                }
            }

            var item = new SalesOrderItemModel
            {
                SalesOrderId = dto.SalesOrderId,
                ProductId = dto.ProductId,
                ParentSalesOrderItemId = dto.ParentSalesOrderItemId,
                IsAccessory = dto.IsAccessory,
                ItemCode = dto.ItemCode,
                ItemName = dto.ItemName.Trim(),
                Brand = dto.Brand,
                Specification = dto.Specification,
                Quantity = dto.Quantity,
                UnitOfMeasurement = dto.UnitOfMeasurement,
                Rate = dto.Rate,
                DiscountPercentage = dto.DiscountPercentage,
                GSTRate = dto.GSTRate,
                DisplayOrder = dto.DisplayOrder,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            CalculateAmounts(item);

            await _itemRepository.Create(item);

            _logger.LogInformation(
                "Created item {ItemName} for sales order {SalesOrderId}",
                item.ItemName,
                item.SalesOrderId);

            return MapToDto(item);
        }

        public async Task<SalesOrderItemDto?> UpdateAsync(
            int id,
            CreateSalesOrderItemDto dto)
        {
            Validate(dto);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            if (item.SalesOrderId != dto.SalesOrderId)
                throw new ArgumentException(
                    "The sales order reference cannot be changed.");

            var order =
                await _orderRepository.GetByIdAsync(item.SalesOrderId);

            if (order == null || order.IsDeleted)
                throw new KeyNotFoundException("Sales order not found.");

            if (order.OrderStatus.Equals(
                "Completed",
                StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals(
                "Cancelled",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Items on completed or cancelled orders cannot be edited.");
            }

            item.ProductId = dto.ProductId;
            item.ParentSalesOrderItemId = dto.ParentSalesOrderItemId;
            item.IsAccessory = dto.IsAccessory;
            item.ItemCode = dto.ItemCode;
            item.ItemName = dto.ItemName.Trim();
            item.Brand = dto.Brand;
            item.Specification = dto.Specification;
            item.Quantity = dto.Quantity;
            item.UnitOfMeasurement = dto.UnitOfMeasurement;
            item.Rate = dto.Rate;
            item.DiscountPercentage = dto.DiscountPercentage;
            item.GSTRate = dto.GSTRate;
            item.DisplayOrder = dto.DisplayOrder;
            item.UpdatedAt = DateTime.UtcNow;

            CalculateAmounts(item);

            await _itemRepository.Update(item);

            return MapToDto(item);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            var order =
                await _orderRepository.GetByIdAsync(item.SalesOrderId);

            if (order == null || order.IsDeleted)
                throw new KeyNotFoundException("Sales order not found.");

            if (order.OrderStatus.Equals(
                "Completed",
                StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals(
                "Cancelled",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Items on completed or cancelled orders cannot be deleted.");
            }

            item.IsDeleted = true;
            item.IsActive = false;
            item.UpdatedAt = DateTime.UtcNow;

            await _itemRepository.Update(item);

            return true;
        }

        private static void Validate(CreateSalesOrderItemDto dto)
        {
            if (dto.SalesOrderId <= 0)
                throw new ArgumentException("Valid SalesOrderId is required.");

            if (string.IsNullOrWhiteSpace(dto.ItemName))
                throw new ArgumentException("ItemName is required.");

            if (dto.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero.");

            if (dto.Rate < 0)
                throw new ArgumentException("Rate cannot be negative.");

            if (dto.DiscountPercentage < 0 ||
                dto.DiscountPercentage > 100)
            {
                throw new ArgumentException(
                    "DiscountPercentage must be between 0 and 100.");
            }

            if (dto.GSTRate < 0 || dto.GSTRate > 100)
                throw new ArgumentException(
                    "GSTRate must be between 0 and 100.");
        }

        private static void CalculateAmounts(SalesOrderItemModel item)
        {
            decimal gross = Math.Round(
                item.Quantity * item.Rate,
                2,
                MidpointRounding.AwayFromZero);

            item.DiscountAmount = Math.Round(
                gross * item.DiscountPercentage / 100m,
                2,
                MidpointRounding.AwayFromZero);

            item.TaxableAmount = gross - item.DiscountAmount;

            item.TaxAmount = Math.Round(
                item.TaxableAmount * item.GSTRate / 100m,
                2,
                MidpointRounding.AwayFromZero);

            item.LineTotal = item.TaxableAmount + item.TaxAmount;
        }

        private static SalesOrderItemDto MapToDto(
            SalesOrderItemModel model)
        {
            return new SalesOrderItemDto
            {
                SalesOrderItemId = model.SalesOrderItemId,
                SalesOrderId = model.SalesOrderId,
                ProductId = model.ProductId,
                ParentSalesOrderItemId = model.ParentSalesOrderItemId,
                IsAccessory = model.IsAccessory,
                ItemCode = model.ItemCode,
                ItemName = model.ItemName,
                Brand = model.Brand,
                Specification = model.Specification,
                Quantity = model.Quantity,
                UnitOfMeasurement = model.UnitOfMeasurement,
                Rate = model.Rate,
                DiscountPercentage = model.DiscountPercentage,
                DiscountAmount = model.DiscountAmount,
                GSTRate = model.GSTRate,
                TaxableAmount = model.TaxableAmount,
                TaxAmount = model.TaxAmount,
                LineTotal = model.LineTotal,
                DisplayOrder = model.DisplayOrder
            };
        }
    }
}
using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Quotation;

using SalesOrderModel =
    CompanyPlatform.Core.Models.CRM.Company.SalesOrder;
using SalesOrderItemModel =
    CompanyPlatform.Core.Models.CRM.Company.SalesOrderItem;
using QuotationModel =
    CompanyPlatform.Core.Models.CRM.Company.Quotation;
using QuotationItemModel =
    CompanyPlatform.Core.Models.CRM.Company.QuotationItem;

namespace CompanyPlatform.CRM.Services.SalesOrder
{
    public class SalesOrderService : ISalesOrderService
    {
        private readonly IRepositories<SalesOrderModel> _repository;
        private readonly IRepositories<QuotationModel> _quotationRepository;
        private readonly ApplicationDBContext _context;
        private readonly ILogger<SalesOrderService> _logger;

        private static readonly ConcurrentDictionary<int, SemaphoreSlim> _quotationLocks = new();

        public SalesOrderService(
            IRepositories<SalesOrderModel> repository,
            IRepositories<QuotationModel> quotationRepository,
            ApplicationDBContext context,
            ILogger<SalesOrderService> logger)
        {
            _repository = repository;
            _quotationRepository = quotationRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SalesOrderDto>> GetAllAsync()
        {
            var orders = await _repository.GetAll();

            return orders
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.OrderDate)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<SalesOrderDto?> GetByIdAsync(int id)
        {
            var order = await _repository.GetByIdAsync(id);

            if (order == null || order.IsDeleted)
                return null;

            return MapToDto(order);
        }


        public async Task<SalesOrderDto?> GetByQuotationIdAsync(int quotationId)
        {
            var order = await _context.SalesOrders
                .FirstOrDefaultAsync(x => x.QuotationId == quotationId && !x.IsDeleted);

            if (order == null)
                return null;

            return MapToDto(order);
        }

        public async Task<SalesOrderDto> CreateAsync(
            CreateSalesOrderDto dto,
            string? createdBy)
        {
            if (dto.CustomerId <= 0)
                throw new ArgumentException("Valid CustomerId is required.");

            if (dto.QuotationId.HasValue)
            {
                var quotation = await _quotationRepository.GetByIdAsync(
                    dto.QuotationId.Value);

                if (quotation == null || quotation.IsDeleted)
                    throw new KeyNotFoundException("Quotation not found.");

                if (quotation.CustomerId != dto.CustomerId)
                    throw new ArgumentException(
                        "CustomerId does not match the quotation.");

                if (!string.Equals(
                    quotation.Status,
                    "Won",
                    StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        "Only a quotation marked Won can be converted to a sales order.");
                }
            }

            if (!dto.QuotationId.HasValue)
            {
                return await CreateDirectOrderAsync(dto, createdBy);
            }

            return await ConvertQuotationToSalesOrderAsync(dto, createdBy);
        }

        private async Task<SalesOrderDto> CreateDirectOrderAsync(
            CreateSalesOrderDto dto,
            string? createdBy)
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"SO-{year}-";

            var existingNumbers = await _context.SalesOrders
                .Where(x => x.SalesOrderNumber.StartsWith(prefix))
                .Select(x => x.SalesOrderNumber)
                .ToListAsync();

            var sequence = existingNumbers
                .Select(s =>
                {
                    var parts = s.Split('-');
                    return parts.Length == 3 && int.TryParse(parts[2], out var n) ? n : 0;
                })
                .DefaultIfEmpty(0)
                .Max() + 1;

            var now = DateTime.UtcNow;

            var order = new SalesOrderModel
            {
                SalesOrderNumber = $"{prefix}{sequence:D3}",
                QuotationId = null,
                CustomerId = dto.CustomerId,
                OrderDate = now,
                ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
                OrderStatus = "Pending",
                PaymentTerms = dto.PaymentTerms,
                DeliveryAddress = dto.DeliveryAddress,
                Remarks = dto.Remarks,
                CreatedBy = createdBy,
                CreatedAt = now,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(order);

            _logger.LogInformation(
                "Created direct sales order {SalesOrderNumber}",
                order.SalesOrderNumber);

            return MapToDto(order);
        }

        private async Task<SalesOrderDto> ConvertQuotationToSalesOrderAsync(
            CreateSalesOrderDto dto,
            string? createdBy)
        {
            int quotationId = dto.QuotationId!.Value;

            // Serialize conversions for this quotation to prevent concurrent duplicates
            var semaphore = _quotationLocks.GetOrAdd(quotationId, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();

            try
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Verify quotation exists
                    var quotation = await _context.Quotations
                        .FirstOrDefaultAsync(q => q.QuotationId == quotationId);

                    if (quotation == null || quotation.IsDeleted)
                        throw new KeyNotFoundException("Quotation not found.");

                    // 2. Verify quotation is active
                    if (!quotation.IsActive)
                        throw new InvalidOperationException("Quotation is inactive and cannot be converted to a sales order.");

                    // 3. Verify customer matches quotation
                    if (quotation.CustomerId != dto.CustomerId)
                        throw new ArgumentException("CustomerId does not match the quotation.");

                    // 4. Verify quotation status is Won in database
                    if (!string.Equals(quotation.Status, "Won", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException("Only a quotation marked Won can be converted to a sales order.");
                    }

                    // 5. Prevent duplicate: check whether a Sales Order already exists for that quotation
                    var existingOrder = await _context.SalesOrders
                        .FirstOrDefaultAsync(x => x.QuotationId == quotationId && !x.IsDeleted);

                    if (existingOrder != null)
                    {
                        throw new InvalidOperationException(
                            $"A sales order ({existingOrder.SalesOrderNumber}) already exists for this quotation.");
                    }

                    // 6. Generate Sales Order number
                    var year = DateTime.UtcNow.Year;
                    var prefix = $"SO-{year}-";

                    var existingNumbers = await _context.SalesOrders
                        .Where(x => x.SalesOrderNumber.StartsWith(prefix))
                        .Select(x => x.SalesOrderNumber)
                        .ToListAsync();

                    var sequence = existingNumbers
                        .Select(s =>
                        {
                            var parts = s.Split('-');
                            return parts.Length == 3 && int.TryParse(parts[2], out var n) ? n : 0;
                        })
                        .DefaultIfEmpty(0)
                        .Max() + 1;

                    var now = DateTime.UtcNow;

                    // 7. Retrieve active, non-deleted quotation items
                    var quotationItems = await _context.QuotationItems
                        .Where(x => x.QuotationId == quotationId && !x.IsDeleted && x.IsActive)
                        .OrderBy(x => x.DisplayOrder)
                        .ThenBy(x => x.QuotationItemId)
                        .ToListAsync();

                    // Calculate totals from quotation or compute from items if header totals are empty
                    decimal subtotal = quotation.Subtotal;
                    decimal discountAmount = quotation.DiscountAmount;
                    decimal taxableAmount = quotation.TaxableAmount;
                    decimal taxAmount = quotation.TaxAmount;
                    decimal freightCharges = quotation.FreightCharges;
                    decimal otherCharges = quotation.OtherCharges;
                    decimal grandTotal = quotation.GrandTotal;

                    if (grandTotal == 0 && quotationItems.Count > 0)
                    {
                        subtotal = quotationItems.Sum(x => x.Quantity * x.Rate);
                        discountAmount = quotationItems.Sum(x => x.DiscountAmount);
                        taxableAmount = quotationItems.Sum(x => x.TaxableAmount);
                        taxAmount = quotationItems.Sum(x => x.TaxAmount);
                        grandTotal = taxableAmount + taxAmount + freightCharges + otherCharges;
                    }

                    string? paymentTerms = !string.IsNullOrWhiteSpace(dto.PaymentTerms)
                        ? dto.PaymentTerms
                        : quotation.PaymentTermId?.ToString();

                    // 8. Create Sales Order header
                    var order = new SalesOrderModel
                    {
                        SalesOrderNumber = $"{prefix}{sequence:D3}",
                        QuotationId = quotationId,
                        CustomerId = dto.CustomerId,
                        OrderDate = now,
                        ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
                        OrderStatus = "Pending",
                        Subtotal = subtotal,
                        DiscountAmount = discountAmount,
                        TaxableAmount = taxableAmount,
                        TaxAmount = taxAmount,
                        FreightCharges = freightCharges,
                        OtherCharges = otherCharges,
                        GrandTotal = grandTotal,
                        PaymentTerms = paymentTerms,
                        DeliveryAddress = dto.DeliveryAddress,
                        Remarks = dto.Remarks,
                        CreatedBy = createdBy,
                        CreatedAt = now,
                        IsActive = true,
                        IsDeleted = false
                    };

                    await _context.SalesOrders.AddAsync(order);
                    await _context.SaveChangesAsync();

                    // 9. Copy eligible quotation items into SalesOrderItem
                    // First map and insert main items (non-accessories)
                    var mainItems = quotationItems
                        .Where(x => !x.IsAccessory || !x.ParentQuotationItemId.HasValue)
                        .ToList();

                    var accessoryItems = quotationItems
                        .Where(x => x.IsAccessory && x.ParentQuotationItemId.HasValue)
                        .ToList();

                    var quotationToSalesItemIdMap = new Dictionary<int, int>();

                    foreach (var qItem in mainItems)
                    {
                        var soItem = new SalesOrderItemModel
                        {
                            SalesOrderId = order.SalesOrderId,
                            ProductId = qItem.ProductId,
                            ParentSalesOrderItemId = null,
                            IsAccessory = false,
                            ItemCode = qItem.ItemCode,
                            ItemName = qItem.ItemName,
                            Brand = qItem.Brand,
                            Specification = qItem.Specification,
                            Quantity = qItem.Quantity,
                            UnitOfMeasurement = qItem.UnitOfMeasurementId?.ToString(),
                            Rate = qItem.Rate,
                            DiscountPercentage = qItem.DiscountPercentage,
                            DiscountAmount = qItem.DiscountAmount,
                            GSTRate = qItem.GSTRate,
                            TaxableAmount = qItem.TaxableAmount,
                            TaxAmount = qItem.TaxAmount,
                            LineTotal = qItem.LineTotal,
                            DisplayOrder = qItem.DisplayOrder,
                            IsActive = true,
                            IsDeleted = false,
                            CreatedAt = now
                        };

                        await _context.SalesOrderItems.AddAsync(soItem);
                        await _context.SaveChangesAsync();

                        quotationToSalesItemIdMap[qItem.QuotationItemId] = soItem.SalesOrderItemId;
                    }

                    // 10. Copy accessories and preserve parent-child link
                    foreach (var accItem in accessoryItems)
                    {
                        if (!quotationToSalesItemIdMap.TryGetValue(accItem.ParentQuotationItemId!.Value, out int parentSalesItemId))
                        {
                            throw new InvalidOperationException(
                                $"Quotation accessory item '{accItem.ItemName}' references an invalid or missing parent item.");
                        }

                        var soItem = new SalesOrderItemModel
                        {
                            SalesOrderId = order.SalesOrderId,
                            ProductId = accItem.ProductId,
                            ParentSalesOrderItemId = parentSalesItemId,
                            IsAccessory = true,
                            ItemCode = accItem.ItemCode,
                            ItemName = accItem.ItemName,
                            Brand = accItem.Brand,
                            Specification = accItem.Specification,
                            Quantity = accItem.Quantity,
                            UnitOfMeasurement = accItem.UnitOfMeasurementId?.ToString(),
                            Rate = accItem.Rate,
                            DiscountPercentage = accItem.DiscountPercentage,
                            DiscountAmount = accItem.DiscountAmount,
                            GSTRate = accItem.GSTRate,
                            TaxableAmount = accItem.TaxableAmount,
                            TaxAmount = accItem.TaxAmount,
                            LineTotal = accItem.LineTotal,
                            DisplayOrder = accItem.DisplayOrder,
                            IsActive = true,
                            IsDeleted = false,
                            CreatedAt = now
                        };

                        await _context.SalesOrderItems.AddAsync(soItem);
                        await _context.SaveChangesAsync();

                        quotationToSalesItemIdMap[accItem.QuotationItemId] = soItem.SalesOrderItemId;
                    }

                    // 11. Commit transaction atomically
                    await transaction.CommitAsync();

                    _logger.LogInformation(
                        "Converted quotation {QuotationNumber} to sales order {SalesOrderNumber} with {ItemCount} items.",
                        quotation.QuotationNumber,
                        order.SalesOrderNumber,
                        quotationItems.Count);

                    return MapToDto(order);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            finally
            {
                semaphore.Release();
            }
        }

        public async Task<SalesOrderDto?> UpdateAsync(
            int id,
            CreateSalesOrderDto dto,
            string? updatedBy)
        {
            var order = await _repository.GetByIdAsync(id);

            if (order == null || order.IsDeleted)
                return null;

            if (order.OrderStatus.Equals(
                "Completed",
                StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals(
                "Cancelled",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Completed or cancelled orders cannot be edited.");
            }

            if (dto.CustomerId <= 0)
                throw new ArgumentException("Valid CustomerId is required.");

            if (order.QuotationId.HasValue &&
                dto.QuotationId != order.QuotationId)
            {
                throw new InvalidOperationException(
                    "The quotation reference cannot be changed.");
            }

            order.CustomerId = dto.CustomerId;
            order.ExpectedDeliveryDate = dto.ExpectedDeliveryDate;
            order.PaymentTerms = dto.PaymentTerms;
            order.DeliveryAddress = dto.DeliveryAddress;
            order.Remarks = dto.Remarks;
            order.UpdatedBy = updatedBy;
            order.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(order);

            return MapToDto(order);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var order = await _repository.GetByIdAsync(id);

            if (order == null || order.IsDeleted)
                return false;

            if (order.OrderStatus.Equals(
                "Completed",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "A completed sales order cannot be deleted.");
            }

            order.IsDeleted = true;
            order.IsActive = false;
            order.UpdatedAt = DateTime.UtcNow;

            await _repository.Update(order);

            return true;
        }

        private static SalesOrderDto MapToDto(SalesOrderModel model)
        {
            return new SalesOrderDto
            {
                SalesOrderId = model.SalesOrderId,
                SalesOrderNumber = model.SalesOrderNumber,
                QuotationId = model.QuotationId,
                CustomerId = model.CustomerId,
                OrderDate = model.OrderDate,
                ExpectedDeliveryDate = model.ExpectedDeliveryDate,
                OrderStatus = model.OrderStatus,
                Subtotal = model.Subtotal,
                DiscountAmount = model.DiscountAmount,
                TaxableAmount = model.TaxableAmount,
                TaxAmount = model.TaxAmount,
                FreightCharges = model.FreightCharges,
                OtherCharges = model.OtherCharges,
                GrandTotal = model.GrandTotal,
                PaymentTerms = model.PaymentTerms,
                DeliveryAddress = model.DeliveryAddress,
                Remarks = model.Remarks,
                CreatedBy = model.CreatedBy,
                CreatedAt = model.CreatedAt
            };
        }
    }
}
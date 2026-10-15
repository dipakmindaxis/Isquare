using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.NonGSTInvoice;
using NonGSTInvoiceEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTInvoice;
using NonGSTInvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTInvoiceItem;

namespace CompanyPlatform.CRM.Services.NonGSTInvoice
{
    public class NonGSTInvoiceItemService : INonGSTInvoiceItemService
    {
        private readonly IRepositories<NonGSTInvoiceItemEntity> _itemRepository;
        private readonly IRepositories<NonGSTInvoiceEntity> _invoiceRepository;
        private readonly ILogger<NonGSTInvoiceItemService> _logger;

        public NonGSTInvoiceItemService(
            IRepositories<NonGSTInvoiceItemEntity> itemRepository,
            IRepositories<NonGSTInvoiceEntity> invoiceRepository,
            ILogger<NonGSTInvoiceItemService> logger)
        {
            _itemRepository = itemRepository;
            _invoiceRepository = invoiceRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<NonGSTInvoiceItemDto>> GetAllNonGSTInvoiceItemsAsync()
        {
            _logger.LogInformation("Fetching all active Non-GST Invoice line items.");

            var items = await _itemRepository.FindByCondition(x => !x.IsDeleted);

            return items
                .OrderBy(x => x.NonGSTInvoiceId)
                .Select(x => MapToDto(x));
        }

        public async Task<IEnumerable<NonGSTInvoiceItemDto>> GetItemsByInvoiceIdAsync(int nonGSTInvoiceId)
        {
            _logger.LogInformation("Fetching line items for Non-GST Invoice ID: {InvoiceId}", nonGSTInvoiceId);

            var items = await _itemRepository.FindByCondition(x => x.NonGSTInvoiceId == nonGSTInvoiceId && !x.IsDeleted);

            return items
                .Select(x => MapToDto(x));
        }

        public async Task<NonGSTInvoiceItemDto?> GetNonGSTInvoiceItemByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Non-GST Invoice line item by ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Non-GST Invoice line item with ID {Id} not found.", id);
                return null;
            }

            return MapToDto(item);
        }

        public async Task<NonGSTInvoiceItemDto> CreateNonGSTInvoiceItemAsync(NonGSTInvoiceItemDto dto)
        {
            _logger.LogInformation("Creating new line item for Non-GST Invoice ID: {InvoiceId}", dto.NonGSTInvoiceId);

            // 1. Validate parent Invoice existence
            var invoice = await _invoiceRepository.GetByIdAsync(dto.NonGSTInvoiceId);
            if (invoice == null || invoice.IsDeleted)
            {
                _logger.LogWarning("Non-GST Invoice ID {InvoiceId} is invalid or deleted.", dto.NonGSTInvoiceId);
                throw new ArgumentException($"Non-GST Invoice with ID {dto.NonGSTInvoiceId} does not exist.");
            }

            // 2. Calculate amount
            decimal amount = dto.Quantity * dto.Rate;

            var entity = new NonGSTInvoiceItemEntity
            {
                NonGSTInvoiceId = dto.NonGSTInvoiceId,
                Services = dto.Services,
                Description = dto.Description,
                Quantity = dto.Quantity,
                Rate = dto.Rate,
                Amount = amount,
                IsActive = true,
                IsDeleted = false,
                CreatedDate = DateTime.Now
            };

            await _itemRepository.Create(entity);

            dto.NonGSTInvoiceItemId = entity.NonGSTInvoiceItemId;
            dto.Amount = entity.Amount;

            // 3. Update parent total amount
            await RecalculateParentTotalAmountAsync(dto.NonGSTInvoiceId);

            _logger.LogInformation("Successfully created Non-GST Invoice line item with ID: {ItemId}", entity.NonGSTInvoiceItemId);

            return dto;
        }

        public async Task<bool> UpdateNonGSTInvoiceItemAsync(int id, NonGSTInvoiceItemDto dto)
        {
            _logger.LogInformation("Updating Non-GST Invoice line item with ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Update failed. Non-GST Invoice line item with ID {Id} not found.", id);
                return false;
            }

            decimal amount = dto.Quantity * dto.Rate;

            item.Services = dto.Services;
            item.Description = dto.Description;
            item.Quantity = dto.Quantity;
            item.Rate = dto.Rate;
            item.Amount = amount;
            item.UpdatedDate = DateTime.Now;

            await _itemRepository.Update(item);

            // Update parent total amount
            await RecalculateParentTotalAmountAsync(item.NonGSTInvoiceId);

            _logger.LogInformation("Successfully updated Non-GST Invoice line item with ID: {Id}", id);

            return true;
        }

        public async Task<bool> DeleteNonGSTInvoiceItemAsync(int id)
        {
            _logger.LogInformation("Deleting Non-GST Invoice line item with ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Invoice line item with ID {Id} not found.", id);
                return false;
            }

            int invoiceId = item.NonGSTInvoiceId;

            item.IsDeleted = true;
            item.IsActive = false;
            item.UpdatedDate = DateTime.Now;

            await _itemRepository.Update(item);

            // Update parent total amount
            await RecalculateParentTotalAmountAsync(invoiceId);

            _logger.LogInformation("Successfully soft-deleted Non-GST Invoice line item with ID: {Id}", id);

            return true;
        }

        private async Task RecalculateParentTotalAmountAsync(int invoiceId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice != null && !invoice.IsDeleted)
            {
                var activeItems = await _itemRepository.FindByCondition(x => x.NonGSTInvoiceId == invoiceId && !x.IsDeleted);
                invoice.TotalAmount = activeItems.Sum(x => x.Amount);
                invoice.UpdatedDate = DateTime.Now;
                await _invoiceRepository.Update(invoice);
            }
        }

        private static NonGSTInvoiceItemDto MapToDto(NonGSTInvoiceItemEntity entity)
        {
            return new NonGSTInvoiceItemDto
            {
                NonGSTInvoiceItemId = entity.NonGSTInvoiceItemId,
                NonGSTInvoiceId = entity.NonGSTInvoiceId,
                Services = entity.Services,
                Description = entity.Description,
                Quantity = entity.Quantity,
                Rate = entity.Rate,
                Amount = entity.Amount
            };
        }
    }
}

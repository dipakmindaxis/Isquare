using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Models.CRM.Company;
using InvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.InvoiceItem;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Invoice;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.InvoiceItem
{
    public class InvoiceItemService : IInvoiceItemService
    {
        private readonly IRepositories<InvoiceItemEntity> _repository;
        private readonly ILogger<InvoiceItemService> _logger;

        public InvoiceItemService(
            IRepositories<InvoiceItemEntity> repository,
            ILogger<InvoiceItemService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<InvoiceItemDto>> GetAllInvoiceItemsAsync()
        {
            _logger.LogInformation("Fetching all invoice items.");

            var items = await _repository.GetAll();

            return items
                .Where(i => i.IsDeleted == false)
                .Select(i => new InvoiceItemDto
                {
                    InvoiceItemId = i.InvoiceItemId,
                    InvoiceId = i.InvoiceId,
                    ItemName = i.ItemName,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    GSTPercentage = i.GSTPercentage,
                    GSTAmount = i.GSTAmount,
                    TotalAmount = i.TotalAmount,
                    IsActive = i.IsActive,
                    IsDeleted = i.IsDeleted
                });
        }

        public async Task<InvoiceItemDto?> GetInvoiceItemByIdAsync(int id)
        {
            _logger.LogInformation("Fetching invoice item by ID: {InvoiceItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Invoice item with ID: {InvoiceItemId} not found.", id);
                return null;
            }

            return new InvoiceItemDto
            {
                InvoiceItemId = item.InvoiceItemId,
                InvoiceId = item.InvoiceId,
                ItemName = item.ItemName,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                GSTPercentage = item.GSTPercentage,
                GSTAmount = item.GSTAmount,
                TotalAmount = item.TotalAmount,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<InvoiceItemDto> CreateInvoiceItemAsync(InvoiceItemDto dto)
        {
            _logger.LogInformation("Creating Invoice Item.");

            var newItem = new InvoiceItemEntity
            {
                InvoiceId = dto.InvoiceId,
                ItemName = dto.ItemName,
                Description = dto.Description,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                GSTPercentage = dto.GSTPercentage,
                GSTAmount = dto.GSTAmount,
                TotalAmount = dto.TotalAmount,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.InvoiceItemId = newItem.InvoiceItemId;
            dto.IsActive = newItem.IsActive;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Invoice Item created successfully with ID: {InvoiceItemId}", newItem.InvoiceItemId);

            return dto;
        }

        public async Task<bool> UpdateInvoiceItemAsync(InvoiceItemDto dto)
        {
            _logger.LogInformation("Updating Invoice Item with ID: {InvoiceItemId}", dto.InvoiceItemId);

            var item = await _repository.GetByIdAsync(dto.InvoiceItemId);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning("Invoice Item not found with ID: {InvoiceItemId}", dto.InvoiceItemId);
                return false;
            }

            item.InvoiceId = dto.InvoiceId;
            item.ItemName = dto.ItemName;
            item.Description = dto.Description;
            item.Quantity = dto.Quantity;
            item.UnitPrice = dto.UnitPrice;
            item.GSTPercentage = dto.GSTPercentage;
            item.GSTAmount = dto.GSTAmount;
            item.TotalAmount = dto.TotalAmount;
            item.IsActive = dto.IsActive;

            await _repository.Update(item);

            _logger.LogInformation("Invoice Item updated successfully.");

            return true;
        }

        public async Task<bool> DeleteInvoiceItemAsync(int id)
        {
            _logger.LogInformation("Deleting Invoice Item with ID: {InvoiceItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning("Invoice Item not found with ID: {InvoiceItemId}", id);
                return false;
            }

            item.IsActive = false;
            item.IsDeleted = true;

            await _repository.Update(item);

            _logger.LogInformation("Invoice Item deleted successfully.");

            return true;
        }
    }
}
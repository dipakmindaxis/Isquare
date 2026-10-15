using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.ProformaInvoice;
using ProformaInvoiceEntity = CompanyPlatform.Core.Models.CRM.Company.ProformaInvoice;
using ProformaInvoiceItemEntity = CompanyPlatform.Core.Models.CRM.Company.ProformaInvoiceItem;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public class ProformaInvoiceItemService : IProformaInvoiceItemService
    {
        private readonly IRepositories<ProformaInvoiceItemEntity> _repository;
        private readonly IRepositories<ProformaInvoiceEntity> _proformaRepository;
        private readonly ILogger<ProformaInvoiceItemService> _logger;

        public ProformaInvoiceItemService(
            IRepositories<ProformaInvoiceItemEntity> repository,
            IRepositories<ProformaInvoiceEntity> proformaRepository,
            ILogger<ProformaInvoiceItemService> logger)
        {
            _repository = repository;
            _proformaRepository = proformaRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<ProformaInvoiceItemDto>> GetAllProformaInvoiceItemsAsync()
        {
            _logger.LogInformation("Fetching all active proforma invoice items.");

            var items = await _repository.GetAll();

            return items
                .Where(i => !i.IsDeleted)
                .OrderBy(i => i.ProformaId)
                .ThenBy(i => i.SrNo)
                .Select(i => MapToDto(i));
        }

        public async Task<ProformaInvoiceItemDto?> GetProformaInvoiceItemByIdAsync(int id)
        {
            _logger.LogInformation("Fetching proforma invoice item by ID: {ProformaItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Proforma invoice item with ID: {ProformaItemId} not found or is deleted.", id);
                return null;
            }

            return MapToDto(item);
        }

        public async Task<IEnumerable<ProformaInvoiceItemDto>> GetItemsByProformaIdAsync(int proformaId)
        {
            _logger.LogInformation("Fetching proforma invoice items for Proforma ID: {ProformaId}", proformaId);

            var items = await _repository.FindByCondition(i => i.ProformaId == proformaId && !i.IsDeleted);

            return items
                .OrderBy(i => i.SrNo)
                .Select(i => MapToDto(i));
        }

        public async Task<ProformaInvoiceItemDto> CreateProformaInvoiceItemAsync(ProformaInvoiceItemDto dto)
        {
            _logger.LogInformation("Creating Proforma Invoice Item for Proforma ID: {ProformaId}", dto.ProformaId);

            var proforma = await _proformaRepository.GetByIdAsync(dto.ProformaId);
            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Create Item failed. Parent Proforma Invoice with ID {ProformaId} not found or is deleted.", dto.ProformaId);
                throw new InvalidOperationException($"Parent Proforma Invoice with ID {dto.ProformaId} not found or is deleted.");
            }

            var newItem = new ProformaInvoiceItemEntity
            {
                ProformaId = dto.ProformaId,
                SrNo = dto.SrNo,
                Services = dto.Services,
                Description = dto.Description,
                Quantity = dto.Quantity,
                Rate = dto.Rate,
                Amount = dto.Amount,
                TaxableValue = dto.TaxableValue,
                CGSTRate = dto.CGSTRate,
                CGSTAmount = dto.CGSTAmount,
                SGSTRate = dto.SGSTRate,
                SGSTAmount = dto.SGSTAmount,
                TotalAmount = dto.TotalAmount,
                IsActive = true,
                IsDeleted = false,
                CreatedBy = 0,
                CreatedDate = DateTime.Now
            };

            await _repository.Create(newItem);

            dto.ProformaItemId = newItem.ProformaItemId;
            dto.IsActive = newItem.IsActive;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Proforma Invoice Item created successfully with ID: {ProformaItemId}", newItem.ProformaItemId);
            return dto;
        }

        public async Task<bool> UpdateProformaInvoiceItemAsync(ProformaInvoiceItemDto dto)
        {
            _logger.LogInformation("Updating Proforma Invoice Item with ID: {ProformaItemId}", dto.ProformaItemId);

            var item = await _repository.GetByIdAsync(dto.ProformaItemId);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Proforma Invoice Item not found with ID: {ProformaItemId}", dto.ProformaItemId);
                return false;
            }

            item.ProformaId = dto.ProformaId;
            item.SrNo = dto.SrNo;
            item.Services = dto.Services;
            item.Description = dto.Description;
            item.Quantity = dto.Quantity;
            item.Rate = dto.Rate;
            item.Amount = dto.Amount;
            item.TaxableValue = dto.TaxableValue;
            item.CGSTRate = dto.CGSTRate;
            item.CGSTAmount = dto.CGSTAmount;
            item.SGSTRate = dto.SGSTRate;
            item.SGSTAmount = dto.SGSTAmount;
            item.TotalAmount = dto.TotalAmount;
            item.IsActive = dto.IsActive;
            item.UpdatedDate = DateTime.Now;

            await _repository.Update(item);

            _logger.LogInformation("Proforma Invoice Item updated successfully with ID: {ProformaItemId}", dto.ProformaItemId);
            return true;
        }

        public async Task<bool> DeleteProformaInvoiceItemAsync(int id)
        {
            _logger.LogInformation("Deleting Proforma Invoice Item with ID: {ProformaItemId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Proforma Invoice Item not found with ID: {ProformaItemId}", id);
                return false;
            }

            item.IsActive = false;
            item.IsDeleted = true;
            item.UpdatedDate = DateTime.Now;

            await _repository.Update(item);

            _logger.LogInformation("Proforma Invoice Item deleted successfully with ID: {ProformaItemId}", id);
            return true;
        }

        private static ProformaInvoiceItemDto MapToDto(ProformaInvoiceItemEntity item)
        {
            return new ProformaInvoiceItemDto
            {
                ProformaItemId = item.ProformaItemId,
                ProformaId = item.ProformaId,
                SrNo = item.SrNo,
                Services = item.Services,
                Description = item.Description,
                Quantity = item.Quantity,
                Rate = item.Rate,
                Amount = item.Amount,
                TaxableValue = item.TaxableValue,
                CGSTRate = item.CGSTRate,
                CGSTAmount = item.CGSTAmount,
                SGSTRate = item.SGSTRate,
                SGSTAmount = item.SGSTAmount,
                TotalAmount = item.TotalAmount,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }
    }
}

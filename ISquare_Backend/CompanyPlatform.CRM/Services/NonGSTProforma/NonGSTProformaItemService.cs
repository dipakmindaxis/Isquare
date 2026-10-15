using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.NonGSTProforma;
using NonGSTProformaEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTProforma;
using NonGSTProformaItemEntity = CompanyPlatform.Core.Models.CRM.Company.NonGSTProformaItem;

namespace CompanyPlatform.CRM.Services.NonGSTProforma
{
    public class NonGSTProformaItemService : INonGSTProformaItemService
    {
        private readonly IRepositories<NonGSTProformaItemEntity> _itemRepository;
        private readonly IRepositories<NonGSTProformaEntity> _proformaRepository;
        private readonly ILogger<NonGSTProformaItemService> _logger;

        public NonGSTProformaItemService(
            IRepositories<NonGSTProformaItemEntity> itemRepository,
            IRepositories<NonGSTProformaEntity> proformaRepository,
            ILogger<NonGSTProformaItemService> logger)
        {
            _itemRepository = itemRepository;
            _proformaRepository = proformaRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<NonGSTProformaItemDto>> GetAllNonGSTProformaItemsAsync()
        {
            _logger.LogInformation("Fetching all active Non-GST Proforma line items.");

            var items = await _itemRepository.FindByCondition(x => !x.IsDeleted);

            return items
                .OrderBy(x => x.NonGSTProformaId)
                .ThenBy(x => x.SrNo)
                .Select(x => MapToDto(x));
        }

        public async Task<IEnumerable<NonGSTProformaItemDto>> GetItemsByProformaIdAsync(int nonGSTProformaId)
        {
            _logger.LogInformation("Fetching line items for Non-GST Proforma ID: {ProformaId}", nonGSTProformaId);

            var items = await _itemRepository.FindByCondition(x => x.NonGSTProformaId == nonGSTProformaId && !x.IsDeleted);

            return items
                .OrderBy(x => x.SrNo)
                .Select(x => MapToDto(x));
        }

        public async Task<NonGSTProformaItemDto?> GetNonGSTProformaItemByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Non-GST Proforma line item by ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Non-GST Proforma line item with ID {Id} not found.", id);
                return null;
            }

            return MapToDto(item);
        }

        public async Task<NonGSTProformaItemDto> CreateNonGSTProformaItemAsync(NonGSTProformaItemDto dto)
        {
            _logger.LogInformation("Creating new line item for Non-GST Proforma ID: {ProformaId}", dto.NonGSTProformaId);

            // 1. Validate parent Proforma existence
            var proforma = await _proformaRepository.GetByIdAsync(dto.NonGSTProformaId);
            if (proforma == null || proforma.IsDeleted)
            {
                _logger.LogWarning("Non-GST Proforma ID {ProformaId} is invalid or deleted.", dto.NonGSTProformaId);
                throw new ArgumentException($"Non-GST Proforma with ID {dto.NonGSTProformaId} does not exist.");
            }

            // 2. Calculate amounts
            decimal amount = dto.Quantity * dto.Rate;
            decimal totalAmount = amount; // Non-GST: No tax

            // 3. Determine SrNo if not specified
            int srNo = dto.SrNo;
            if (srNo <= 0)
            {
                var existingItems = await _itemRepository.FindByCondition(x => x.NonGSTProformaId == dto.NonGSTProformaId && !x.IsDeleted);
                srNo = existingItems.Any() ? existingItems.Max(x => x.SrNo) + 1 : 1;
            }

            var entity = new NonGSTProformaItemEntity
            {
                NonGSTProformaId = dto.NonGSTProformaId,
                SrNo = srNo,
                Services = dto.Services,
                Description = dto.Description,
                Quantity = dto.Quantity,
                Rate = dto.Rate,
                Amount = amount,
                TotalAmount = totalAmount,
                IsActive = true,
                IsDeleted = false,
                CreatedDate = DateTime.Now
            };

            await _itemRepository.Create(entity);

            dto.NonGSTProformaItemId = entity.NonGSTProformaItemId;
            dto.SrNo = entity.SrNo;
            dto.Amount = entity.Amount;
            dto.TotalAmount = entity.TotalAmount;

            // 4. Update parent total amount
            await RecalculateParentTotalAmountAsync(dto.NonGSTProformaId);

            _logger.LogInformation("Successfully created Non-GST Proforma line item with ID: {ItemId}", entity.NonGSTProformaItemId);

            return dto;
        }

        public async Task<bool> UpdateNonGSTProformaItemAsync(int id, NonGSTProformaItemDto dto)
        {
            _logger.LogInformation("Updating Non-GST Proforma line item with ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Update failed. Non-GST Proforma line item with ID {Id} not found.", id);
                return false;
            }

            decimal amount = dto.Quantity * dto.Rate;
            decimal totalAmount = amount;

            item.SrNo = dto.SrNo > 0 ? dto.SrNo : item.SrNo;
            item.Services = dto.Services;
            item.Description = dto.Description;
            item.Quantity = dto.Quantity;
            item.Rate = dto.Rate;
            item.Amount = amount;
            item.TotalAmount = totalAmount;
            item.UpdatedDate = DateTime.Now;

            await _itemRepository.Update(item);

            // Update parent total amount
            await RecalculateParentTotalAmountAsync(item.NonGSTProformaId);

            _logger.LogInformation("Successfully updated Non-GST Proforma line item with ID: {Id}", id);

            return true;
        }

        public async Task<bool> DeleteNonGSTProformaItemAsync(int id)
        {
            _logger.LogInformation("Deleting Non-GST Proforma line item with ID: {Id}", id);

            var item = await _itemRepository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Delete failed. Non-GST Proforma line item with ID {Id} not found.", id);
                return false;
            }

            int proformaId = item.NonGSTProformaId;

            item.IsDeleted = true;
            item.IsActive = false;
            item.UpdatedDate = DateTime.Now;

            await _itemRepository.Update(item);

            // Update parent total amount
            await RecalculateParentTotalAmountAsync(proformaId);

            _logger.LogInformation("Successfully soft-deleted Non-GST Proforma line item with ID: {Id}", id);

            return true;
        }

        private async Task RecalculateParentTotalAmountAsync(int proformaId)
        {
            var proforma = await _proformaRepository.GetByIdAsync(proformaId);
            if (proforma != null && !proforma.IsDeleted)
            {
                var activeItems = await _itemRepository.FindByCondition(x => x.NonGSTProformaId == proformaId && !x.IsDeleted);
                proforma.TotalAmount = activeItems.Sum(x => x.TotalAmount);
                proforma.UpdatedDate = DateTime.Now;
                await _proformaRepository.Update(proforma);
            }
        }

        private static NonGSTProformaItemDto MapToDto(NonGSTProformaItemEntity entity)
        {
            return new NonGSTProformaItemDto
            {
                NonGSTProformaItemId = entity.NonGSTProformaItemId,
                NonGSTProformaId = entity.NonGSTProformaId,
                SrNo = entity.SrNo,
                Services = entity.Services,
                Description = entity.Description,
                Quantity = entity.Quantity,
                Rate = entity.Rate,
                Amount = entity.Amount,
                TotalAmount = entity.TotalAmount
            };
        }
    }
}

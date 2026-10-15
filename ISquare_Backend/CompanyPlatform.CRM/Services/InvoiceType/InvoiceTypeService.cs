using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Models.CRM.Company;
using InvoiceTypeEntity = CompanyPlatform.Core.Models.CRM.Company.InvoiceType;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.Invoice;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.InvoiceType
{
    public class InvoiceTypeService : IInvoiceTypeService
    {
        private readonly IRepositories<InvoiceTypeEntity> _repository;
        private readonly ILogger<InvoiceTypeService> _logger;

        public InvoiceTypeService(IRepositories<InvoiceTypeEntity> repository, ILogger<InvoiceTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<InvoiceTypeDto>> GetAllInvoiceTypesAsync()
        {
            _logger.LogInformation("Fetching all active invoice types.");
            var items = await _repository.GetAll();

            return items
                .Where(i => i.IsActive == true)
                .Select(i => new InvoiceTypeDto { ID = i.ID, InvoiceTypeName = i.InvoiceTypeName, IsActive = i.IsActive });
        }

        public async Task<InvoiceTypeDto?> GetInvoiceTypeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching invoice type by ID: {InvoiceTypeId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("Invoice type with ID: {InvoiceTypeId} not found or is inactive.", id);
                return null;
            }

            return new InvoiceTypeDto { ID = item.ID, InvoiceTypeName = item.InvoiceTypeName, IsActive = item.IsActive };
        }

        public async Task<InvoiceTypeDto> CreateInvoiceTypeAsync(InvoiceTypeDto dto)
        {
            _logger.LogInformation("Creating a new invoice type with name: {InvoiceTypeName}", dto.InvoiceTypeName);
            var newItem = new InvoiceTypeEntity
            {
                InvoiceTypeName = dto.InvoiceTypeName,
                IsActive = true
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsActive = newItem.IsActive;

            _logger.LogInformation("Successfully created invoice type with ID: {InvoiceTypeId}", newItem.ID);
            return dto;
        }

        public async Task<bool> UpdateInvoiceTypeAsync(int id, InvoiceTypeDto dto)
        {
            _logger.LogInformation("Attempting to update invoice type with ID: {InvoiceTypeId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsActive == false)
            {
                _logger.LogWarning("Update failed. Invoice type with ID: {InvoiceTypeId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.InvoiceTypeName = dto.InvoiceTypeName;
            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated invoice type with ID: {InvoiceTypeId}", id);
            return true;
        }

        public async Task<bool> DeleteInvoiceTypeAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate invoice type with ID: {InvoiceTypeId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Invoice type with ID: {InvoiceTypeId} not found.", id);
                return false;
            }

            // Soft delete: Mark as inactive instead of deleting
            itemToDelete.IsActive = false;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated invoice type with ID: {InvoiceTypeId}", id);
            return true;
        }
    }
}
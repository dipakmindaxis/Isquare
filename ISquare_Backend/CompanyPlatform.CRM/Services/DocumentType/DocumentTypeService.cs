using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.DocumentType;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.DocumentType
{
    public class DocumentTypeService : IDocumentTypeService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.DocumentType> _repository;
        private readonly ILogger<DocumentTypeService> _logger;

        public DocumentTypeService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.DocumentType> repository,
            ILogger<DocumentTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<DocumentTypeDto>> GetAllDocumentTypesAsync()
        {
            _logger.LogInformation("Fetching all active document types.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new DocumentTypeDto
                {
                    ID = x.ID,
                    DocumentName = x.DocumentName,
                    Code = x.Code,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<DocumentTypeDto> GetDocumentTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Document Type by ID: {DocumentTypeId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Document Type with ID: {DocumentTypeId} not found or is deleted.",
                    id);

                return null;
            }

            return new DocumentTypeDto
            {
                ID = item.ID,
                DocumentName = item.DocumentName,
                Code = item.Code,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<DocumentTypeDto> CreateDocumentTypeAsync(
            DocumentTypeDto dto)
        {
            _logger.LogInformation("Creating a new Document Type.");

            var newItem =
                new CompanyPlatform.Core.Models.CRM.Company.DocumentType
                {
                    DocumentName = dto.DocumentName,
                    Code = dto.Code,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation(
                "Successfully created Document Type with ID: {DocumentTypeId}",
                newItem.ID);

            return dto;
        }

        public async Task<bool> UpdateDocumentTypeAsync(
            int id,
            DocumentTypeDto dto)
        {
            _logger.LogInformation(
                "Attempting to update Document Type with ID: {DocumentTypeId}",
                id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Update failed. Document Type with ID: {DocumentTypeId} not found or is deleted.",
                    id);

                return false;
            }

            itemToUpdate.DocumentName = dto.DocumentName;
            itemToUpdate.Code = dto.Code;
            itemToUpdate.IsActive = dto.IsActive;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation(
                "Successfully updated Document Type with ID: {DocumentTypeId}",
                id);

            return true;
        }

        public async Task<bool> DeleteDocumentTypeAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to delete Document Type with ID: {DocumentTypeId}",
                id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning(
                    "Delete failed. Document Type with ID: {DocumentTypeId} not found.",
                    id);

                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation(
                "Successfully deleted Document Type with ID: {DocumentTypeId}",
                id);

            return true;
        }
    }
}
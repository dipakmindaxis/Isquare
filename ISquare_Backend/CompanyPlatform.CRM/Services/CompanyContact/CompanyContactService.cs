using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CompanyContact
{
    public class CompanyContactService : ICompanyContactService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyContact> _repository;
        private readonly ILogger<CompanyContactService> _logger;

        public CompanyContactService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyContact> repository,
            ILogger<CompanyContactService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyContactDto>> GetAllCompanyContactsAsync()
        {
            _logger.LogInformation("Fetching all company contacts.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.Select(c => new CompanyContactDto
            {
                ContactId = c.ContactId,
                CompanyId = c.CompanyId,
                ContactPerson = c.ContactPerson,
                DesignationId = c.DesignationId,
                Email = c.Email,
                Mobile = c.Mobile,
                AlternateMobile = c.AlternateMobile,
                IsPrimary = c.IsPrimary,
                IsActive = c.IsActive,
                CreatedBy = c.CreatedBy,
                CreatedDate = c.CreatedDate
            });
        }

        public async Task<CompanyContactDto> GetCompanyContactByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company contact by ID: {ContactId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Company contact with ID: {ContactId} not found.", id);

                return null;
            }

            return new CompanyContactDto
            {
                ContactId = item.ContactId,
                CompanyId = item.CompanyId,
                ContactPerson = item.ContactPerson,
                DesignationId = item.DesignationId,
                Email = item.Email,
                Mobile = item.Mobile,
                AlternateMobile = item.AlternateMobile,
                IsPrimary = item.IsPrimary,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate
            };
        }

        public async Task<CompanyContactDto> CreateCompanyContactAsync(CompanyContactDto dto)
        {
            _logger.LogInformation("Creating company contact: {ContactPerson}", dto.ContactPerson);

            var entity = new CompanyPlatform.Core.Models.CRM.Company.CompanyContact {
                CompanyId = dto.CompanyId,
                ContactPerson = dto.ContactPerson,
                DesignationId = dto.DesignationId,
                Email = dto.Email,
                Mobile = dto.Mobile,
                AlternateMobile = dto.AlternateMobile,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = dto.CreatedDate
            };

            await _repository.Create(entity);

            dto.ContactId = entity.ContactId;

            _logger.LogInformation("Successfully created company contact with ID: {ContactId}", entity.ContactId);

            return dto;
        }

        public async Task<bool> UpdateCompanyContactAsync(int id, CompanyContactDto dto)
        {
            _logger.LogInformation("Updating company contact with ID: {ContactId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company contact with ID: {ContactId} not found.", id);

                return false;
            }

            entity.CompanyId = dto.CompanyId;
            entity.ContactPerson = dto.ContactPerson;
            entity.DesignationId = dto.DesignationId;
            entity.Email = dto.Email;
            entity.Mobile = dto.Mobile;
            entity.AlternateMobile = dto.AlternateMobile;
            entity.IsPrimary = dto.IsPrimary;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation("Successfully updated company contact with ID: {ContactId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyContactAsync(int id)
        {
            _logger.LogInformation("Deleting company contact with ID: {ContactId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company contact with ID: {ContactId} not found.", id);

                return false;
            }

            entity.IsDeleted = true;

            await _repository.SoftDelete(entity);

            _logger.LogInformation("Successfully deleted company contact with ID: {ContactId}", id);

            return true;
        }
    }
}
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.CompanyPhone
{
    public class CompanyPhoneService : ICompanyPhoneService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyPhone> _repository;
        private readonly ILogger<CompanyPhoneService> _logger;

        public CompanyPhoneService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyPhone> repository,
            ILogger<CompanyPhoneService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyPhoneDto>> GetAllCompanyPhonesAsync()
        {
            _logger.LogInformation("Fetching all company phones.");

            var items = await _repository.FindByCondition(x => !x.IsDeleted);

            return items.Select(p => new CompanyPhoneDto
            {
                PhoneId = p.PhoneId,
                CompanyId = p.CompanyId,
                PhoneType = p.PhoneType,
                PhoneNumber = p.PhoneNumber,
                IsPrimary = p.IsPrimary,
                IsActive = p.IsActive,
                CreatedBy = p.CreatedBy,
                CreatedDate = p.CreatedDate
            });
        }

        public async Task<CompanyPhoneDto> GetCompanyPhoneByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company phone by ID: {PhoneId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Company phone with ID: {PhoneId} not found.", id);
                return null;
            }

            return new CompanyPhoneDto
            {
                PhoneId = item.PhoneId,
                CompanyId = item.CompanyId,
                PhoneType = item.PhoneType,
                PhoneNumber = item.PhoneNumber,
                IsPrimary = item.IsPrimary,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatedDate = item.CreatedDate
            };
        }

        public async Task<CompanyPhoneDto> CreateCompanyPhoneAsync(CompanyPhoneDto dto)
        {
            _logger.LogInformation("Creating company phone.");

            var entity = new CompanyPlatform.Core.Models.CRM.Company.CompanyPhone {
                CompanyId = dto.CompanyId,
                PhoneType = dto.PhoneType,
                PhoneNumber = dto.PhoneNumber,
                IsPrimary = dto.IsPrimary,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedBy = dto.CreatedBy,
                CreatedDate = dto.CreatedDate
            };

            await _repository.Create(entity);

            dto.PhoneId = entity.PhoneId;

            _logger.LogInformation("Company phone created successfully with ID: {PhoneId}", entity.PhoneId);

            return dto;
        }

        public async Task<bool> UpdateCompanyPhoneAsync(int id, CompanyPhoneDto dto)
        {
            _logger.LogInformation("Updating company phone ID: {PhoneId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company phone not found. ID: {PhoneId}", id);
                return false;
            }

            entity.CompanyId = dto.CompanyId;
            entity.PhoneType = dto.PhoneType;
            entity.PhoneNumber = dto.PhoneNumber;
            entity.IsPrimary = dto.IsPrimary;
            entity.IsActive = dto.IsActive;

            await _repository.Update(entity);

            _logger.LogInformation("Company phone updated successfully. ID: {PhoneId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyPhoneAsync(int id)
        {
            _logger.LogInformation("Deleting company phone ID: {PhoneId}", id);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null || entity.IsDeleted)
            {
                _logger.LogWarning("Company phone not found. ID: {PhoneId}", id);
                return false;
            }

            entity.IsDeleted = true;

            await _repository.SoftDelete(entity);

            _logger.LogInformation("Company phone deleted successfully. ID: {PhoneId}", id);

            return true;
        }
    }
}
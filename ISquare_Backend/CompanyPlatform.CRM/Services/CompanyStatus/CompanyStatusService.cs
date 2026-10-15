using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.CompanyStatus;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.CompanyStatus
{
    public class CompanyStatusService : ICompanyStatusService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyStatus> _repository;
        private readonly ILogger<CompanyStatusService> _logger;

        public CompanyStatusService(IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyStatus> repository, ILogger<CompanyStatusService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyStatusDto>> GetAllCompanyStatusesAsync()
        {
            _logger.LogInformation("Fetching all Company Status records.");

            var companyStatuses = await _repository.GetAll();

            return companyStatuses
                .Where(x => !x.IsDeleted)
                .Select(x => new CompanyStatusDto
                {
                    ID = x.ID,
                    CompanyStatusName = x.CompanyStatusName,
                    IsActive = x.IsActive
                });
        }

        public async Task<CompanyStatusDto?> GetCompanyStatusByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Company Status with ID: {CompanyStatusId}", id);

            var companyStatus = await _repository.GetByIdAsync(id);

            if (companyStatus == null || companyStatus.IsDeleted)
            {
                _logger.LogWarning("Company Status with ID: {CompanyStatusId} not found.", id);
                return null;
            }

            return new CompanyStatusDto
            {
                ID = companyStatus.ID,
                CompanyStatusName = companyStatus.CompanyStatusName,
                IsActive = companyStatus.IsActive
            };
        }

        public async Task<CompanyStatusDto> CreateCompanyStatusAsync(CompanyStatusDto companyStatusDto)
        {
            _logger.LogInformation("Creating Company Status: {CompanyStatusName}", companyStatusDto.CompanyStatusName);

            var companyStatus = new CompanyPlatform.Core.Models.CRM.Company.CompanyStatus
            {
                CompanyStatusName = companyStatusDto.CompanyStatusName,
                IsActive = companyStatusDto.IsActive,
                IsDeleted = false
            };

            await _repository.Create(companyStatus);

            companyStatusDto.ID = companyStatus.ID;

            _logger.LogInformation("Company Status created successfully with ID: {CompanyStatusId}", companyStatus.ID);

            return companyStatusDto;
        }

        public async Task<bool> UpdateCompanyStatusAsync(int id, CompanyStatusDto companyStatusDto)
        {
            _logger.LogInformation("Updating Company Status with ID: {CompanyStatusId}", id);

            var companyStatus = await _repository.GetByIdAsync(id);

            if (companyStatus == null || companyStatus.IsDeleted)
            {
                _logger.LogWarning("Company Status with ID: {CompanyStatusId} not found.", id);
                return false;
            }

            companyStatus.CompanyStatusName = companyStatusDto.CompanyStatusName;
            companyStatus.IsActive = companyStatusDto.IsActive;

            await _repository.Update(companyStatus);

            _logger.LogInformation("Company Status updated successfully with ID: {CompanyStatusId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyStatusAsync(int id)
        {
            _logger.LogInformation("Deleting Company Status with ID: {CompanyStatusId}", id);

            var companyStatus = await _repository.GetByIdAsync(id);

            if (companyStatus == null || companyStatus.IsDeleted)
            {
                _logger.LogWarning("Company Status with ID: {CompanyStatusId} not found.", id);
                return false;
            }

            companyStatus.IsDeleted = true;
            companyStatus.IsActive = false;

            await _repository.Update(companyStatus);

            _logger.LogInformation("Company Status deleted successfully with ID: {CompanyStatusId}", id);

            return true;
        }
    }
}
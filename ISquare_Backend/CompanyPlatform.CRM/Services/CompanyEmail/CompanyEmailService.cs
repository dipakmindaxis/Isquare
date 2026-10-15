using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyEmail;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.Services.CompanyEmail;

namespace CompanyPlatform.CRM.Services.CompanyEmail
{
    public class CompanyEmailService : ICompanyEmailService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyEmail> _repository;
        private readonly ILogger<CompanyEmailService> _logger;

        public CompanyEmailService(
            IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyEmail> repository,
            ILogger<CompanyEmailService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyEmailDto>> GetAllCompanyEmailsAsync()
        {
            _logger.LogInformation("Fetching all active company emails.");

            var items = await _repository.GetAll();

            return items
                .Where(e => e.IsDeleted == false)
                .Select(e => new CompanyEmailDto
                {
                    EmailId = e.EmailId,
                    CompanyId = e.CompanyId,
                    Email = e.Email,
                    IsPrimary = e.IsPrimary,
                    CreatedDate = e.CreatedDate,
                    IsDeleted = e.IsDeleted
                });
        }

        public async Task<CompanyEmailDto> GetCompanyEmailByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company email by ID: {EmailId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning("Company email with ID: {EmailId} not found or is inactive.", id);
                return null;
            }

            return new CompanyEmailDto
            {
                EmailId = item.EmailId,
                CompanyId = item.CompanyId,
                Email = item.Email,
                IsPrimary = item.IsPrimary,
                CreatedDate = item.CreatedDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CompanyEmailDto> CreateCompanyEmailAsync(CompanyEmailDto dto)
        {
            _logger.LogInformation("Creating company email: {Email}", dto.Email);

            var newItem = new CompanyPlatform.Core.Models.CRM.Company.CompanyEmail {
                CompanyId = dto.CompanyId,
                Email = dto.Email,
                IsPrimary = dto.IsPrimary,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.EmailId = newItem.EmailId;
            dto.CreatedDate = newItem.CreatedDate;
            dto.IsDeleted = false;

            _logger.LogInformation("Successfully created company email with ID: {EmailId}", newItem.EmailId);

            return dto;
        }

        public async Task<bool> UpdateCompanyEmailAsync(int id, CompanyEmailDto dto)
        {
            _logger.LogInformation("Updating company email with ID: {EmailId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted)
            {
                _logger.LogWarning("Update failed. Company email with ID: {EmailId} not found.", id);
                return false;
            }

            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.Email = dto.Email;
            itemToUpdate.IsPrimary = dto.IsPrimary;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated company email with ID: {EmailId}", id);

            return true;
        }

        public async Task<bool> DeleteCompanyEmailAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate company email with ID: {EmailId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Delete failed. Company email with ID: {EmailId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated company email with ID: {EmailId}", id);

            return true;
        }
    }
}
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.CompanyTimeline;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CompanyTimeline
{
    public class CompanyTimelineService : ICompanyTimelineService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyTimeline> _repository;
        private readonly ILogger<CompanyTimelineService> _logger;

        public CompanyTimelineService(IRepositories<CompanyPlatform.Core.Models.CRM.Company.CompanyTimeline> repository, ILogger<CompanyTimelineService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<CompanyTimelineDto>> GetAllCompanyTimelinesAsync()
        {
            _logger.LogInformation("Fetching all active company timelines.");
            var items = await _repository.GetAll();

            return items
                .Where(d => d.IsDeleted == false)
                .Select(d => new CompanyTimelineDto
                {
                    TimelineId = d.TimelineId,
                    CompanyId = d.CompanyId,
                    ActivityTypeId = d.ActivityTypeId,
                    ReferenceId = d.ReferenceId,
                    UserId = d.UserId,
                    Description = d.Description,
                    CreatedDate = d.CreatedDate,
                    IsDeleted = d.IsDeleted
                });
        }

        public async Task<CompanyTimelineDto> GetCompanyTimelineByIdAsync(int id)
        {
            _logger.LogInformation("Fetching company timeline by ID: {TimelineId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || !item.IsDeleted == false)
            {
                _logger.LogWarning("Company timeline with ID: {TimelineId} not found or is inactive.", id);
                return null;
            }

            return new CompanyTimelineDto
            {
                TimelineId = item.TimelineId,
                CompanyId = item.CompanyId,
                ActivityTypeId = item.ActivityTypeId,
                ReferenceId = item.ReferenceId,
                UserId = item.UserId,
                Description = item.Description,
                CreatedDate = item.CreatedDate,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<CompanyTimelineDto> CreateCompanyTimelineAsync(CreateCompanyTimelineDto dto)
        {
            _logger.LogInformation("Creating a new company timeline with description: {Description}", dto.Description);
            var newItem = new CompanyPlatform.Core.Models.CRM.Company.CompanyTimeline {
                CompanyId = dto.CompanyId,
                ActivityTypeId = dto.ActivityTypeId,
                ReferenceId = dto.ReferenceId,
                UserId = dto.UserId,
                Description = dto.Description,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            _logger.LogInformation("Successfully created company timeline with ID: {TimelineId}", newItem.TimelineId);

            return new CompanyTimelineDto
            {
                TimelineId = newItem.TimelineId,
                CompanyId = newItem.CompanyId,
                ActivityTypeId = newItem.ActivityTypeId,
                ReferenceId = newItem.ReferenceId,
                UserId = newItem.UserId,
                Description = newItem.Description,
                CreatedDate = newItem.CreatedDate,
                IsDeleted = newItem.IsDeleted
            };
        }

        public async Task<bool> UpdateCompanyTimelineAsync(int id, CompanyTimelineDto dto)
        {
            _logger.LogInformation("Attempting to update company timeline with ID: {TimelineId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || !itemToUpdate.IsDeleted == false)
            {
                _logger.LogWarning("Update failed. Company timeline with ID: {TimelineId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.CompanyId = dto.CompanyId;
            itemToUpdate.ActivityTypeId = dto.ActivityTypeId;
            itemToUpdate.ReferenceId = dto.ReferenceId;
            itemToUpdate.UserId = dto.UserId;
            itemToUpdate.Description = dto.Description;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated company timeline with ID: {TimelineId}", id);
            return true;
        }

        public async Task<bool> DeleteCompanyTimelineAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate company timeline with ID: {TimelineId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Company timeline with ID: {TimelineId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated company timeline with ID: {TimelineId}", id);
            return true;
        }
    }
}

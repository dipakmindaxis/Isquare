using CompanyPlatform.Core.DTO.PriorityMaster;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.Core.PriorityService
{
    public class PriorityService : IPriorityService
    {
        private readonly IRepositories<Priority> _repository;
        private readonly ILogger<PriorityService> _logger;

        public PriorityService(IRepositories<Priority> repository, ILogger<PriorityService> logger)
        {
            _repository = repository;
            _logger = logger;
        }
        public async Task<IEnumerable<PriorityDto>> GetAllPrioritiesAsync()
        {
            _logger.LogInformation("Fetching all active priorities.");

            var items = await _repository.GetAll();

            return items
                .Where(p => p.IsActive)
                .Select(p => new PriorityDto
                {
                    Id = p.Id,
                    PriorityName = p.PriorityName,
                    ColorCode = p.ColorCode,
                    IsActive = p.IsActive
                });
        }
        public async Task<PriorityDto> GetPriorityByIdAsync(int id)
        {
            _logger.LogInformation("Fetching priority by ID: {PriorityId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("Priority with ID: {PriorityId} not found or is inactive.", id);
            }

            return new PriorityDto
            {
                Id = item.Id,
                PriorityName = item.PriorityName,
                ColorCode = item.ColorCode,
                IsActive = item.IsActive
            };
        }
        public async Task<PriorityDto> CreatePriorityAsync(PriorityDto dto)
        {
            _logger.LogInformation("Creating a new Priority with name: {PriorityName}", dto.PriorityName);

            var newItem = new Priority
            {
                PriorityName = dto.PriorityName,
                ColorCode = dto.ColorCode,
                IsActive = true
            };

            await _repository.Create(newItem);

            dto.Id = newItem.Id;
            dto.IsActive = newItem.IsActive;

            _logger.LogInformation("Successfully created Priority with ID: {PriorityId}", newItem.Id);

            return dto;
        }
        public async Task<bool> UpdatePriorityAsync(int id, PriorityDto dto)
        {
            _logger.LogInformation("Attempting to update Priority with ID: {PriorityId}", id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsActive == false)
            {
                _logger.LogWarning("Update failed. Priority with ID: {PriorityId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.PriorityName = dto.PriorityName;
            itemToUpdate.ColorCode = dto.ColorCode;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated Priority with ID: {PriorityId}", id);

            return true;
        }
        public async Task<bool> DeletePriorityAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate Priority with ID: {PriorityId}", id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Priority with ID: {PriorityId} not found.", id);
                return false;
            }
            // Soft Delete
            itemToDelete.IsActive = false;

            await _repository.Update(itemToDelete);
            _logger.LogInformation("Successfully deactivated Priority with ID: {PriorityId}", id);
            return true;
        }
    }
}
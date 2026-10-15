using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using Microsoft.Extensions.Logging;


namespace CompanyPlatform.Core.Services.Meeting
{
    public class ReminderStatusService : IReminderStatusService
    {
        private readonly IRepositories<ReminderStatus> _repository;
        private readonly ILogger<ReminderStatusService> _logger;

        public ReminderStatusService(IRepositories<ReminderStatus> repository, ILogger<ReminderStatusService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ReminderStatusDto>> GetAllReminderStatusesAsync()
        {
            _logger.LogInformation("Fetching all active reminder statuses.");
            var items = await _repository.GetAll();

            return items
                .Where(r => r.IsActive == true)
                .Select(r => new ReminderStatusDto { ID = r.ID, StatusName = r.StatusName, IsActive = r.IsActive });
        }

        public async Task<ReminderStatusDto> GetReminderStatusByIdAsync(int id)
        {
            _logger.LogInformation("Fetching reminder status by ID: {ReminderStatusId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsActive == false)
            {
                _logger.LogWarning("Reminder status with ID: {ReminderStatusId} not found or is inactive.", id);
                return null;
            }

            return new ReminderStatusDto { ID = item.ID, StatusName = item.StatusName, IsActive = item.IsActive };
        }

        public async Task<ReminderStatusDto> CreateReminderStatusAsync(ReminderStatusDto dto)
        {
            _logger.LogInformation("Creating a new reminder status with name: {StatusName}", dto.StatusName);
            var newItem = new ReminderStatus
            {
                StatusName = dto.StatusName,
                IsActive = true
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsActive = newItem.IsActive;

            _logger.LogInformation("Successfully created reminder status with ID: {ReminderStatusId}", newItem.ID);
            return dto;
        }

        public async Task<bool> UpdateReminderStatusAsync(int id, ReminderStatusDto dto)
        {
            _logger.LogInformation("Attempting to update reminder status with ID: {ReminderStatusId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsActive == false)
            {
                _logger.LogWarning("Update failed. Reminder status with ID: {ReminderStatusId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.StatusName = dto.StatusName;
            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated reminder status with ID: {ReminderStatusId}", id);
            return true;
        }

        public async Task<bool> DeleteReminderStatusAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate reminder status with ID: {ReminderStatusId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Reminder status with ID: {ReminderStatusId} not found.", id);
                return false;
            }

            // Soft delete: Mark as inactive instead of deleting
            itemToDelete.IsActive = false;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated reminder status with ID: {ReminderStatusId}", id);
            return true;
        }

      
    }
}
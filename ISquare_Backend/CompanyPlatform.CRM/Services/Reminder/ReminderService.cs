using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Service
{
    public class ReminderService : IReminderService
    {
        private readonly IRepositories<Reminder> _repository;
        private readonly ILogger<ReminderService> _logger;

        public ReminderService(
            IRepositories<Reminder> repository,
            ILogger<ReminderService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ReminderDto>> GetAllAsync()
        {
            var reminders = await _repository.GetAll();

            return reminders
                .Where(x => !x.IsDeleted)
                .Select(x => new ReminderDto
                {
                    ReminderId = x.ReminderId,
                    CompanyId = x.CompanyId,
                    AssignedTo = x.AssignedTo,
                    ReminderStatusId = x.ReminderStatusId,
                    Title = x.Title,
                    ReminderDate = x.ReminderDate,
                    ReminderTime = x.ReminderTime,
                    Remarks = x.Remarks,
                    PriorityId = x.PriorityId,
                    CreatedBy = x.CreatedBy,
                    IsActive = x.IsActive
                });
        }

        public async Task<ReminderDto?> GetByIdAsync(int id)
        {
            var reminder = await _repository.GetByIdAsync(id);

            if (reminder == null || reminder.IsDeleted)
                return null;

            return new ReminderDto
            {
                ReminderId = reminder.ReminderId,
                CompanyId = reminder.CompanyId,
                AssignedTo = reminder.AssignedTo,
                ReminderStatusId = reminder.ReminderStatusId,
                Title = reminder.Title,
                ReminderDate = reminder.ReminderDate,
                ReminderTime = reminder.ReminderTime,
                Remarks = reminder.Remarks,
                PriorityId = reminder.PriorityId,
                CreatedBy = reminder.CreatedBy,
                IsActive = reminder.IsActive
            };
        }

        public async Task<ReminderDto> CreateAsync(ReminderDto dto)
        {
            var reminder = new Reminder
            {
                CompanyId = dto.CompanyId,
                AssignedTo = dto.AssignedTo,
                ReminderStatusId = dto.ReminderStatusId,
                Title = dto.Title,
                ReminderDate = dto.ReminderDate,
                ReminderTime = dto.ReminderTime,
                Remarks = dto.Remarks,
                PriorityId = dto.PriorityId,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(reminder);

            dto.ReminderId = reminder.ReminderId;

            return dto;
        }

        public async Task<bool> UpdateAsync(int id, ReminderDto dto)
        {
            _logger.LogInformation("Updating ReminderId: {ReminderId}", id);

            var reminder = await _repository.GetByIdAsync(id);

            if (reminder == null || reminder.IsDeleted)
            {
                _logger.LogWarning("Reminder not found. Id={ReminderId}", id);
                return false;
            }

            reminder.CompanyId = dto.CompanyId;
            reminder.AssignedTo = dto.AssignedTo;
            reminder.ReminderStatusId = dto.ReminderStatusId;
            reminder.Title = dto.Title;
            reminder.ReminderDate = dto.ReminderDate;
            reminder.ReminderTime = dto.ReminderTime;
            reminder.Remarks = dto.Remarks;
            reminder.PriorityId = dto.PriorityId;
            reminder.IsActive = dto.IsActive;

            await _repository.Update(reminder);

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reminder = await _repository.GetByIdAsync(id);

            if (reminder == null)
                return false;

            reminder.IsDeleted = true;

            await _repository.Update(reminder);

            return true;
        }
    }
}
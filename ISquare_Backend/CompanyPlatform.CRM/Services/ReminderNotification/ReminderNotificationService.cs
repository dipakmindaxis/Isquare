using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Repository;
using Microsoft.Extensions.Logging;


namespace CompanyPlatform.Core.Services.Meeting
{
    public class ReminderNotificationService : IReminderNotificationService
    {
        private readonly IRepositories<ReminderNotification> _repository;
        private readonly ILogger<ReminderNotificationService> _logger;

        public ReminderNotificationService(
            IRepositories<ReminderNotification> repository,
            ILogger<ReminderNotificationService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ReminderNotificationDto>> GetAllReminderNotificationsAsync()
        {
            _logger.LogInformation("Fetching all reminder notifications.");

            var notifications = await _repository.GetAll();

            return notifications
                .Where(x => x.IsActive)
                .Select(x => new ReminderNotificationDto
                {
                    ReminderNotificationId = x.ReminderNotificationId,
                    ReminderId = x.ReminderId,
                    NotificationType = x.NotificationType,
                    NotificationDate = x.NotificationDate,
                    NotificationStatus = x.NotificationStatus,
                    SentBy = x.SentBy,
                    Remarks = x.Remarks,
                    IsActive = x.IsActive
                });
        }

        public async Task<ReminderNotificationDto?> GetReminderNotificationByIdAsync(int id)
        {
            _logger.LogInformation("Fetching Reminder Notification with ID : {Id}", id);

            var notification = await _repository.GetByIdAsync(id);

            if (notification == null || !notification.IsActive)
            {
                _logger.LogWarning("Reminder Notification not found.");
                return null;
            }

            return new ReminderNotificationDto
            {
                ReminderNotificationId = notification.ReminderNotificationId,
                ReminderId = notification.ReminderId,
                NotificationType = notification.NotificationType,
                NotificationDate = notification.NotificationDate,
                NotificationStatus = notification.NotificationStatus,
                SentBy = notification.SentBy,
                Remarks = notification.Remarks,
                IsActive = notification.IsActive
            };
        }

        public async Task<ReminderNotificationDto> CreateReminderNotificationAsync(ReminderNotificationDto dto)
        {
            _logger.LogInformation("Creating Reminder Notification.");

            var notification = new ReminderNotification
            {
                ReminderId = dto.ReminderId,
                NotificationType = dto.NotificationType,
                NotificationDate = dto.NotificationDate,
                NotificationStatus = dto.NotificationStatus,
                SentBy = dto.SentBy,
                Remarks = dto.Remarks,
                IsActive = true
            };

            await _repository.Create(notification);

            dto.ReminderNotificationId = notification.ReminderNotificationId;
            dto.IsActive = notification.IsActive;

            return dto;
        }

        public async Task<bool> UpdateReminderNotificationAsync(int id, ReminderNotificationDto dto)
        {
            _logger.LogInformation("Updating Reminder Notification.");

            var notification = await _repository.GetByIdAsync(id);

            if (notification == null || !notification.IsActive)
                return false;

            notification.ReminderId = dto.ReminderId;
            notification.NotificationType = dto.NotificationType;
            notification.NotificationDate = dto.NotificationDate;
            notification.NotificationStatus = dto.NotificationStatus;
            notification.SentBy = dto.SentBy;
            notification.Remarks = dto.Remarks;

            await _repository.Update(notification);

            return true;
        }

        public async Task<bool> DeleteReminderNotificationAsync(int id)
        {
            _logger.LogInformation("Deleting Reminder Notification.");

            var notification = await _repository.GetByIdAsync(id);

            if (notification == null)
                return false;

            notification.IsActive = false;

            await _repository.Update(notification);

            return true;
        }
    }
}
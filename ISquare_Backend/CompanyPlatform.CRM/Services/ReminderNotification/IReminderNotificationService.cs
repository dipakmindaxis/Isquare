using CompanyPlatform.Core.DTO.Meeting;

namespace CompanyPlatform.Core.Services
{
    public interface IReminderNotificationService
    {
        Task<IEnumerable<ReminderNotificationDto>> GetAllReminderNotificationsAsync();

        Task<ReminderNotificationDto?> GetReminderNotificationByIdAsync(int id);

        Task<ReminderNotificationDto> CreateReminderNotificationAsync(ReminderNotificationDto dto);

        Task<bool> UpdateReminderNotificationAsync(int id, ReminderNotificationDto dto);

        Task<bool> DeleteReminderNotificationAsync(int id);
    }
}
using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.CRM.DTO.Meeting;

namespace CompanyPlatform.Core.Services
{
    public interface IReminderStatusService
    {
        Task<IEnumerable<ReminderStatusDto>> GetAllReminderStatusesAsync();
        Task<ReminderStatusDto> GetReminderStatusByIdAsync(int id);
        Task<ReminderStatusDto> CreateReminderStatusAsync(ReminderStatusDto reminderStatusDto);
        Task<bool> UpdateReminderStatusAsync(int id, ReminderStatusDto reminderStatusDto);
        Task<bool> DeleteReminderStatusAsync(int id);

    }
}
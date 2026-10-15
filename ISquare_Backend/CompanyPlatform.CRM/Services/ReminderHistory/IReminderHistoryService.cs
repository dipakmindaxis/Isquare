using CompanyPlatform.Core.DTO.Meeting;
using CompanyPlatform.CRM.DTO.TaskReminderMapping;

namespace CompanyPlatform.CRM.Services
{
    public interface IReminderHistoryService
    {
        Task<IEnumerable<ReminderHistoryDto>> GetAllAsync();

        Task<ReminderHistoryDto?> GetByIdAsync(int id);

        Task<bool> CreateAsync(ReminderHistoryDto dto);

        Task<bool> UpdateAsync(int id, ReminderHistoryDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
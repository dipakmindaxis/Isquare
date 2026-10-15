using CompanyPlatform.Core.DTO.Meeting;

namespace CompanyPlatform.CRM.Service
{
    public interface IReminderService
    {
        Task<IEnumerable<ReminderDto>> GetAllAsync();

        Task<ReminderDto?> GetByIdAsync(int id);

        Task<ReminderDto> CreateAsync(ReminderDto dto);

        Task<bool> UpdateAsync(int id, ReminderDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
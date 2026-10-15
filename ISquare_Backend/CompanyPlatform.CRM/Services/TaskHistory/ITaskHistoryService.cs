using CompanyPlatform.CRM.DTO.TaskHistory;

namespace CompanyPlatform.CRM.Services.TaskHistory
{
    public interface ITaskHistoryService
    {
        Task<IEnumerable<TaskHistoryDto>> GetAllTaskHistoriesAsync();

        Task<TaskHistoryDto?> GetTaskHistoryByIdAsync(int id);

        Task<TaskHistoryDto> CreateTaskHistoryAsync(CreateTaskHistoryDto dto);

        Task<bool> UpdateTaskHistoryAsync(int id, TaskHistoryDto dto);

        Task<bool> DeleteTaskHistoryAsync(int id);
    }
}

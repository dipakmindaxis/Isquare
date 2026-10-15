using CompanyPlatform.CRM.DTO.TaskChecklists;

namespace CompanyPlatform.CRM.Services.TaskChecklists
{
    public interface ITaskChecklistService
    {
        Task<IEnumerable<TaskChecklistDto>> GetAllTaskChecklistsAsync();

        Task<TaskChecklistDto> GetTaskChecklistByIdAsync(int id);

        Task<TaskChecklistDto> CreateTaskChecklistAsync(TaskChecklistDto dto);

        Task<bool> UpdateTaskChecklistAsync(int id, TaskChecklistDto dto);

        Task<bool> DeleteTaskChecklistAsync(int id);
    }
}
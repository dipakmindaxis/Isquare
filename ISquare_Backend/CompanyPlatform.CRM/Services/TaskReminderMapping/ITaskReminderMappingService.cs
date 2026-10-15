using CompanyPlatform.CRM.DTO.TaskReminderMapping;

namespace CompanyPlatform.CRM.Services.TaskReminderMapping
{
    public interface ITaskReminderMappingService
    {
        Task<IEnumerable<TaskReminderMappingDto>> GetAllTaskReminderMappingsAsync();

        Task<TaskReminderMappingDto?> GetTaskReminderMappingByIdAsync(int id);

        Task<TaskReminderMappingDto> CreateTaskReminderMappingAsync(CreateTaskReminderMappingDto dto);

        Task<bool> UpdateTaskReminderMappingAsync(int id, TaskReminderMappingDto dto);

        Task<bool> DeleteTaskReminderMappingAsync(int id);
    }
}

using CompanyPlatform.CRM.DTO.TaskStatus;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.TaskStatus
{
    public interface ITaskStatusService
    {
        Task<IEnumerable<TaskStatusDto>> GetAllTaskStatusesAsync();

        Task<TaskStatusDto> GetTaskStatusByIdAsync(int id);

        Task<TaskStatusDto> CreateTaskStatusAsync(TaskStatusDto dto);

        Task<bool> UpdateTaskStatusAsync(
            int id,
            TaskStatusDto dto);

        Task<bool> DeleteTaskStatusAsync(int id);
    }
}
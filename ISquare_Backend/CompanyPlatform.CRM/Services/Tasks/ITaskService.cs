using CompanyPlatform.CRM.DTO.Tasks;

namespace CompanyPlatform.CRM.Services.Tasks
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAllTasksAsync();

        Task<TaskDto> GetTaskByIdAsync(int id);

        Task<TaskDto> CreateTaskAsync(TaskDto taskDto);

        Task<bool> UpdateTaskAsync(int id, TaskDto taskDto);

        Task<bool> DeleteTaskAsync(int id);

        // Assign Task
        Task<bool> AssignTaskAsync(int taskId, AssignTaskDto dto);

        // Complete Task
        Task<bool> CompleteTaskAsync(int taskId);

        // Task List
        Task<IEnumerable<TaskListDto>> GetTaskListAsync();

        // Task Details
        Task<TaskDetailsDto?> GetTaskDetailsAsync(int taskId);
    }
}
using CompanyPlatform.CRM.DTO.TaskAssignment;

namespace CompanyPlatform.CRM.Services.TaskAssignment
{
    public interface ITaskAssignmentService
    {
        Task<IEnumerable<TaskAssignmentDto>> GetAllTaskAssignmentsAsync();

        Task<TaskAssignmentDto?> GetTaskAssignmentByIdAsync(int id);

        Task<TaskAssignmentDto> CreateTaskAssignmentAsync(TaskAssignmentDto dto);

        Task<bool> UpdateTaskAssignmentAsync(int id, TaskAssignmentDto dto);

        Task<bool> DeleteTaskAssignmentAsync(int id);
    }
}

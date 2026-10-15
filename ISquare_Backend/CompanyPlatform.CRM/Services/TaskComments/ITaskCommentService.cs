using CompanyPlatform.CRM.DTO.TaskComments;

namespace CompanyPlatform.CRM.Services.TaskComments
{
    public interface ITaskCommentService
    {
        Task<IEnumerable<TaskCommentDto>> GetAllTaskCommentsAsync();

        Task<TaskCommentDto> GetTaskCommentByIdAsync(int id);

        Task<TaskCommentDto> CreateTaskCommentAsync(TaskCommentDto dto);

        Task<bool> UpdateTaskCommentAsync(int id, TaskCommentDto dto);

        Task<bool> DeleteTaskCommentAsync(int id);
    }
}
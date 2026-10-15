using CompanyPlatform.CRM.DTO.TaskAttachment;

namespace CompanyPlatform.CRM.Services.TaskAttachment
{
    public interface ITaskAttachmentService
    {
        Task<TaskAttachmentDto> CreateTaskAttachmentAsync(CreateTaskAttachmentDto dto);

        Task<IEnumerable<TaskAttachmentDto>> GetAllTaskAttachmentsAsync();

        Task<IEnumerable<TaskAttachmentDto>> GetAttachmentsByTaskIdAsync(int taskId);

        Task<TaskAttachmentDto?> GetTaskAttachmentByIdAsync(int id);

        Task<bool> UpdateTaskAttachmentAsync(int id, TaskAttachmentDto dto);

        Task<bool> DeleteTaskAttachmentAsync(int id);
    }
}

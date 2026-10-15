using CompanyPlatform.CRM.DTO.TaskAssignments;

namespace CompanyPlatform.CRM.Services.TaskAssignments
{
    public interface ITaskAssignmentsService
    {
        // ─── CRUD ──────────────────────────────────────────────
        Task<IEnumerable<TaskAssignmentsDto>> GetAllAssignmentsAsync();

        Task<TaskAssignmentsDto?> GetAssignmentByIdAsync(int id);

        Task<TaskAssignmentsDto> CreateAssignmentAsync(TaskAssignmentsDto dto);

        Task<bool> UpdateAssignmentAsync(int id, TaskAssignmentsDto dto);

        Task<bool> DeleteAssignmentAsync(int id);

        // ─── Custom APIs ───────────────────────────────────────

        // Assign Task (with duplicate-active check)
        Task<TaskAssignmentsDto> AssignTaskAsync(AssignTaskRequestDto dto);

        // Reassign Task (deactivate previous, create new)
        Task<TaskAssignmentsDto> ReassignTaskAsync(int taskId, ReassignTaskRequestDto dto);

        // Upload Attachment
        Task<TaskAssignmentsDto> UploadAttachmentAsync(UploadTaskAssignmentAttachmentDto dto);

        // Task Timeline
        Task<IEnumerable<TaskTimelineItemDto>> GetTaskTimelineAsync(int taskId);
    }
}

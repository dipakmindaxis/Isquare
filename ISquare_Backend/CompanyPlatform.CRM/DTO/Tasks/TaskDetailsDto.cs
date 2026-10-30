using System;
using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.Tasks
{
    public class TaskDetailsDto
    {
        public int TaskId { get; set; }

        public int CompanyId { get; set; }

        public string TaskTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int AssignedTo { get; set; }

        public string? AssignedToName { get; set; }

        public int AssignedBy { get; set; }

        public string? AssignedByName { get; set; }

        public int PriorityId { get; set; }

        public int TaskStatusId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? CompletionDate { get; set; }

        public int? ReminderId { get; set; }

        public string? Remarks { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; }

        // Related Data
        public List<TaskCommentItemDto> Comments { get; set; } = new();

        public List<TaskChecklistItemDto> Checklists { get; set; } = new();
    }

    public class TaskCommentItemDto
    {
        public int CommentId { get; set; }

        public string Comment { get; set; } = string.Empty;

        public int CommentedBy { get; set; }

        public DateTime CommentDate { get; set; }
    }

    public class TaskChecklistItemDto
    {
        public int ChecklistId { get; set; }

        public string ChecklistItem { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }

        public DateTime? CompletedDate { get; set; }
    }
}

using System;

namespace CompanyPlatform.CRM.DTO.Tasks
{
    public class TaskListDto
    {
        public int TaskId { get; set; }

        public string TaskTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CompanyId { get; set; }

        public int AssignedTo { get; set; }

        public string? AssignedToName { get; set; }

        public int AssignedBy { get; set; }

        public string? AssignedByName { get; set; }

        public int PriorityId { get; set; }

        public int TaskStatusId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? CompletionDate { get; set; }

        public bool IsCompleted { get; set; }
    }
}

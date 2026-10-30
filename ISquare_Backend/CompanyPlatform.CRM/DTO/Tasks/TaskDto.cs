using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Tasks
{
    public class TaskDto
    {
        public int TaskId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public string TaskTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        public string? AssignedToName { get; set; }

        [Required]
        public int AssignedBy { get; set; }

        public string? AssignedByName { get; set; }

        [Required]
        public int PriorityId { get; set; }

        [Required]
        public int TaskStatusId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime? CompletionDate { get; set; }

        public int? ReminderId { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }
    }
}

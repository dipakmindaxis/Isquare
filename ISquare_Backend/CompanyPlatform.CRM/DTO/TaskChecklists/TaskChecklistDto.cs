using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskChecklists
{
    public class TaskChecklistDto
    {
        public int ChecklistId { get; set; }

        [Required(ErrorMessage = "Task is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Checklist item is required.")]
        public string ChecklistItem { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }

        public DateTime? CompletedDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}
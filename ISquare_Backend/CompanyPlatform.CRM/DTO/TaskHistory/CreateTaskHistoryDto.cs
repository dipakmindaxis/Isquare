using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskHistory
{
    public class CreateTaskHistoryDto
    {
        [Required(ErrorMessage = "Task is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Activity is required.")]
        public string Activity { get; set; } = string.Empty;

        public string? Remarks { get; set; }

        public int? PerformedBy { get; set; }

        public bool IsActive { get; set; } = true;
    }
}

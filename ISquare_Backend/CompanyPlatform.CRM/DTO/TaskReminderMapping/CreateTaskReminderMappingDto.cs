using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskReminderMapping
{
    public class CreateTaskReminderMappingDto
    {
        [Required(ErrorMessage = "Task is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Reminder is required.")]
        public int ReminderId { get; set; }

        [Required(ErrorMessage = "Reminder Date is required.")]
        public DateTime ReminderDate { get; set; }

        public int? CreatedBy { get; set; }

        public bool IsCompleted { get; set; } = false;

        public bool IsActive { get; set; } = true;
    }
}

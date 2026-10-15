using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.TaskReminderMapping
{
    public class TaskReminderMappingDto
    {
        public int MappingId { get; set; }

        [Required(ErrorMessage = "Task is required.")]
        public int TaskId { get; set; }

        [Required(ErrorMessage = "Reminder is required.")]
        public int ReminderId { get; set; }

        [Required(ErrorMessage = "Reminder Date is required.")]
        public DateTime ReminderDate { get; set; }

        public bool IsCompleted { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}

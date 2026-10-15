using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class CreateNotificationQueueDto
    {
        [Required(ErrorMessage =
            "Notification Id is required.")]
        public int NotificationId { get; set; }

        [Required(ErrorMessage =
            "Queue Status is required.")]
        public string QueueStatus { get; set; }
            = "Pending";

        public int RetryCount { get; set; } = 0;

        [Required(ErrorMessage =
            "Scheduled Time is required.")]
        public DateTime ScheduledTime { get; set; }

        public DateTime? ProcessedTime { get; set; }

        public string? ErrorMessage { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
//using System;
//using System.Collections.Generic;
//using System.ComponentModel.DataAnnotations;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.DTO
//{
//    public class NotificationQueueDto
//    {
//        public int QueueId { get; set; }

//        [Required(ErrorMessage = "Notification Id is required.")]
//        public int NotificationId { get; set; }

//        [Required(ErrorMessage = "Queue Status is required.")]
//        public string QueueStatus { get; set; } = string.Empty;

//        public int RetryCount { get; set; }

//        [Required(ErrorMessage = "Scheduled Time is required.")]
//        public DateTime ScheduledTime { get; set; }

//        public DateTime? ProcessedTime { get; set; }

//        public string? ErrorMessage { get; set; }

//        public bool IsActive { get; set; }

//        public bool IsDeleted { get; set; }
//    }
//}

using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO
{
    public class NotificationQueueDto
    {
        public int QueueId { get; set; }

        [Required(ErrorMessage =
            "Notification Id is required.")]
        public int NotificationId { get; set; }

        [Required(ErrorMessage =
            "Queue Status is required.")]
        public string QueueStatus { get; set; }
            = string.Empty;

        public int RetryCount { get; set; }

        [Required(ErrorMessage =
            "Scheduled Time is required.")]
        public DateTime ScheduledTime { get; set; }

        public DateTime? ProcessedTime { get; set; }

        public string? ErrorMessage { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; }
    }
}
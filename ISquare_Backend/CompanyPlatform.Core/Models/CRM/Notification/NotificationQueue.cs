//using System;
//using System.Collections.Generic;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Models
//{
//    internal class NotificationQueue
//    {
//        [Key]
//        public int QueueId { get; set; }

//        [Required]
//        public int NotificationId { get; set; }

//        [Required]
//        public string QueueStatus { get; set; } = string.Empty;

//        [DefaultValue(0)]
//        public int RetryCount { get; set; }

//        [Required]
//        public DateTime ScheduledTime { get; set; }

//        public DateTime? ProcessedTime { get; set; }

//        public string? ErrorMessage { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; }

//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; }
//    }
//}


using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models.CRM.Notification
{
    public class NotificationQueue
    {
        [Key]
        public int QueueId { get; set; }

        [Required]
        public int NotificationId { get; set; }

        [Required]
        public string QueueStatus { get; set; } = string.Empty;

        [DefaultValue(0)]
        public int RetryCount { get; set; }

        [Required]
        public DateTime ScheduledTime { get; set; }

        public DateTime? ProcessedTime { get; set; }

        public string? ErrorMessage { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;
    }
}
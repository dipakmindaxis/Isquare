//using System;
//using System.Collections.Generic;
//using System.ComponentModel.DataAnnotations;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.DTO.NotificationLogs
//{
//    public class NotificationLogsDto
//    {
//        public int NotificationLogId { get; set; }

//        [Required]
//        public int? ReminderId { get; set; }

//        [Required]
//        public int UserId { get; set; }

//        [Required]
//        public string NotificationType { get; set; }

//        public string NotificationMessage { get; set; }

//        public DateTime NotificationDate { get; set; }

//        public string Status { get; set; }

//        [Required]
//        public int CreatedBy { get; set; }

//        public DateTime CreatedDate { get; set; }

//        public int? UpdatedBy { get; set; }

//        public DateTime? UpdatedDate { get; set; }

//        public bool IsActive { get; set; }

//        public bool IsDeleted { get; set; }
//    }
//}


using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.NotificationLogs
{
    public class NotificationLogsDto
    {
        public int NotificationLogId { get; set; }

        public int? ReminderId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string NotificationType { get; set; }
            = string.Empty;

        public string NotificationMessage { get; set; }
            = string.Empty;

        public DateTime NotificationDate { get; set; }

        public string Status { get; set; }
            = string.Empty;

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}
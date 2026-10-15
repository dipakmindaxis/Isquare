//using CompanyPlatform.Core.Models.CRM.Employee;
//using System;
//using System.Collections.Generic;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Models
//{
//    internal class NotificationLogs
//    {
//        [Key]
//        public int NotificationLogId { get; set; }

//        // Foreign Key -> Reminder
//        public int? ReminderId { get; set; }

//        // Foreign Key -> Employee/User
//        public int UserId { get; set; }

//        [Required]
//        [StringLength(100)]
//        public string NotificationType { get; set; }

//        public string NotificationMessage { get; set; }

//        public DateTime NotificationDate { get; set; }

//        [StringLength(100)]
//        public string Status { get; set; }

//        // Audit Fields
//        public int CreatedBy { get; set; }

//        public DateTime CreatedDate { get; set; } = DateTime.Now;

//        public int? UpdatedBy { get; set; }

//        public DateTime? UpdatedDate { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; } = true;

//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; } = false;

//        // Navigation Properties

//        [ForeignKey(nameof(ReminderId))]
//        public virtual Reminder? Reminder { get; set; }

//        [ForeignKey(nameof(UserId))]
//        public virtual Employee? User { get; set; }

//        [ForeignKey(nameof(CreatedBy))]
//        public virtual Employee? CreatedByEmployee { get; set; }

//        [ForeignKey(nameof(UpdatedBy))]
//        public virtual Employee? UpdatedByEmployee { get; set; }
//    }
//}








//using CompanyPlatform.Core.Models.CRM.Employee;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace CompanyPlatform.CRM.Models
//{
//    public class NotificationLogs
//    {
//        [Key]
//        public int NotificationLogId { get; set; }

//        public int? ReminderId { get; set; }

//        public int UserId { get; set; }

//        [Required]
//        [StringLength(100)]
//        public string NotificationType { get; set; }
//            = string.Empty;

//        public string NotificationMessage { get; set; }
//            = string.Empty;

//        public DateTime NotificationDate { get; set; }

//        [StringLength(100)]
//        public string Status { get; set; }
//            = string.Empty;

//        public int CreatedBy { get; set; }

//        public DateTime CreatedDate { get; set; }
//            = DateTime.Now;

//        public int? UpdatedBy { get; set; }

//        public DateTime? UpdatedDate { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; } = true;

//        [DefaultValue(false)]
//        public bool IsDeleted { get; set; } = false;

//        [ForeignKey(nameof(ReminderId))]
//        public virtual Reminder? Reminder { get; set; }

//        [ForeignKey(nameof(UserId))]
//        public virtual Employees? User { get; set; }

//        [ForeignKey(nameof(CreatedBy))]
//        public virtual Employees? CreatedByEmployee { get; set; }

//        [ForeignKey(nameof(UpdatedBy))]
//        public virtual Employees? UpdatedByEmployee { get; set; }
//    }
//}
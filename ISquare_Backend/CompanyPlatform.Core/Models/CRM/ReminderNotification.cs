using CompanyPlatform.Core.Models.CRM.Employee;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_ReminderNotification")]
    public class ReminderNotification
    {
        [Key]
        public int ReminderNotificationId { get; set; }

        // Foreign Key
        public int ReminderId { get; set; }

        // Email / SMS / WhatsApp
        [Required]
        public string NotificationType { get; set; }

        public DateTime NotificationDate { get; set; }

        [Required]
        public string NotificationStatus { get; set; }

        // Employee/User who sent notification
        public int SentBy { get; set; }

        public string? Remarks { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        // Navigation Properties

        [ForeignKey(nameof(ReminderId))]
        public virtual Reminder? Reminder { get; set; }

        [ForeignKey(nameof(SentBy))]
        public virtual Employees? Employee { get; set; }
    }
}
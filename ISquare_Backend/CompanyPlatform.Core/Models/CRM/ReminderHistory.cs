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
    [Table("tbl_ReminderHistory")]
    public class ReminderHistory
    {
        [Key]
        public int ReminderHistoryId { get; set; }

        public int ReminderId { get; set; }

        public int ReminderStatusId { get; set; }

        public string? Remarks { get; set; }

        public int UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(ReminderId))]
        public Reminder Reminder { get; set; }

        [ForeignKey(nameof(ReminderStatusId))]
        public ReminderStatus ReminderStatus { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public Employees UpdatedByEmployee { get; set; }
    }
}
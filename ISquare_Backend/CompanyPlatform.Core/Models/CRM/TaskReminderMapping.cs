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
    [Table("tbl_TaskReminderMapping")]
    public class TaskReminderMapping
    {
        [Key]
        public int MappingId { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public virtual Tasks Task { get; set; }

        [Required]
        public int ReminderId { get; set; }
        [ForeignKey("ReminderId")]
        public virtual Reminder Reminder { get; set; }

        [Required]
        public DateTime ReminderDate { get; set; }

        [DefaultValue(false)]
        public bool IsCompleted { get; set; }

        public int CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual Employees CreatedByEmployee { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }
        [ForeignKey("UpdatedBy")]
        public virtual Employees? UpdatedByEmployee { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;
    }
}

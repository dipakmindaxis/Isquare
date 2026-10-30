using CompanyPlatform.Core.Models.CRM.Company;
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
    [Table("tbl_Task")]
    public class Tasks
    {
        [Key]
        public int TaskId { get; set; }

        [Required]
        public int CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; }

        [Required]
        public string TaskTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int AssignedTo { get; set; }
        [ForeignKey("AssignedTo")]
        public virtual Employee AssignedToEmployee { get; set; }

        [Required]
        public int AssignedBy { get; set; }
        [ForeignKey("AssignedBy")]
        public virtual Employee AssignedByEmployee { get; set; }

        [Required]
        public int PriorityId { get; set; }
        [ForeignKey("PriorityId")]
        public virtual Priority Priority { get; set; }

        [Required]
        public int TaskStatusId { get; set; }
        [ForeignKey("TaskStatusId")]
        public virtual TaskStatus TaskStatus { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime? CompletionDate { get; set; }

        public int? ReminderId { get; set; }
        [ForeignKey("ReminderId")]
        public virtual Reminder? Reminder { get; set; }

        public string? Remarks { get; set; }

        [Required]
        public int CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual Employee CreatedByEmployee { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }
        [ForeignKey("UpdatedBy")]
        public virtual Employee? UpdatedByEmployee { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}

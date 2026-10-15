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
    [Table("tbl_TaskHistory")]
    public class TaskHistory
    {
        [Key]
        public int HistoryId { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public virtual Tasks Task { get; set; }

        [Required]
        public string Activity { get; set; } = string.Empty;

        public string? Remarks { get; set; }

        public int PerformedBy { get; set; }
        [ForeignKey("PerformedBy")]
        public virtual Employees PerformedByEmployee { get; set; }

        public DateTime PerformedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;
    }
}

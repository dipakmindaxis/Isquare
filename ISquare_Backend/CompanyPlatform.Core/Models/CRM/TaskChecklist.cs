using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_TaskChecklist")]
    public class TaskChecklist
    {
        [Key]
        public int ChecklistId { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public virtual Tasks Task { get; set; } = null!;

        [Required]
        public string ChecklistItem { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }

        public DateTime? CompletedDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
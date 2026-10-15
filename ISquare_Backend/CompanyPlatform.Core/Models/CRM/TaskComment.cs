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
    [Table("tbl_TaskComment")]
    public class TaskComment
    {
        [Key]
        public int CommentId { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public virtual Tasks Task { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        [Required]
        public int CommentedBy { get; set; }
        [ForeignKey("CommentedBy")]
        public virtual Employees CommentedByEmployee { get; set; }

        [Required]
        public DateTime CommentDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
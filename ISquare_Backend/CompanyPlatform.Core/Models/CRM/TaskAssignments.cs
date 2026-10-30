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
    [Table("tbl_TaskAssignments")]
    public class TaskAssignments
    {
        [Key]
        public int AssignmentId { get; set; }

        // Foreign Key -> Task
        [Required]
        public int TaskId { get; set; }

        // Foreign Key -> Employee (assigned user)
        [Required]
        public int AssignedTo { get; set; }

        // Foreign Key -> Employee (who assigned)
        [Required]
        public int AssignedBy { get; set; }

        [StringLength(100)]
        public string? AssignmentStatus { get; set; }

        public string? Remarks { get; set; }

        // Audit Fields
        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        // Navigation Properties

        [ForeignKey(nameof(TaskId))]
        public virtual Tasks? Task { get; set; }

        [ForeignKey(nameof(AssignedTo))]
        public virtual Employee? AssignedToEmployee { get; set; }

        [ForeignKey(nameof(AssignedBy))]
        public virtual Employee? AssignedByEmployee { get; set; }

        [ForeignKey(nameof(CreatedBy))]
        public virtual Employee? CreatedByEmployee { get; set; }

        [ForeignKey(nameof(UpdatedBy))]
        public virtual Employee? UpdatedByEmployee { get; set; }
    }
}


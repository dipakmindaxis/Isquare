using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_TaskAssignment")]
    public class TaskAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        [Required]
        public int TaskId { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        [Required]
        public int AssignedBy { get; set; }

        [Required]
        public DateTime AssignedDate { get; set; }


        public string? Remarks { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("TaskId")]
        public virtual Tasks? Task { get; set; }

        [ForeignKey("AssignedTo")]
        public virtual Employee? AssignedToEmployee { get; set; }

        [ForeignKey("AssignedBy")]
        public virtual Employee? AssignedByEmployee { get; set; }
    }
}


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
    [Table("tbl_Reminder")]
    public class Reminder
    {
        [Key]
        public int ReminderId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        [Required]
        public int ReminderStatusId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        public DateTime ReminderDate { get; set; }

        [Required]
        public TimeSpan ReminderTime { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        [Required]
        public int PriorityId { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }

        [ForeignKey("AssignedTo")]
        public virtual Employee? AssignedEmployee { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Employee? CreatedByEmployee { get; set; }

        [ForeignKey("PriorityId")]
        public virtual Priority? Priority { get; set; }

        [ForeignKey("ReminderStatusId")]
        public virtual ReminderStatus? ReminderStatus { get; set; }
    }
}
